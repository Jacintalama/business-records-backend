// routes/businessRecords.js
'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Sequelize = require('sequelize');
const { BusinessRecord, Applicant, BusinessRecordPermit, MayorPermit } = require('../models');
const { Op } = require('sequelize');

// Use your JWT secret (from env or fallback)
const JWT_SECRET = process.env.JWT_SECRET || '0216cd9396619f3abfcec489fe0697d9ce6ec029543998da9b47cb3ebd5e5444bf9d601dea2be92c858c8bc7d21f4fdd82074df0e3a0d81b9bb468286e7dbfe8';

// Helper: extract barangay from address
const extractBarangay = (address) => {
  const barangays = [
    "Amsipit", "Bales", "Colon", "Daliao", "Kabatiol", "Kablacan",
    "Kamanga", "Kanalo", "Lumatil", "Lumasal", "Malbang", "Nomoh",
    "Pananag", "Poblacion", "Public Market", "Seven Hills", "Tinoto"
  ];
  for (const brgy of barangays) {
    if (address.toLowerCase().includes(brgy.toLowerCase())) {
      return brgy;
    }
  }
  return null;
};

// Helper: compute period end date
const computePeriodEnd = (dateStr, frequency) => {
  let recordDate;
  if (typeof dateStr === 'string' && dateStr.includes('/')) {
    const [day, month, year] = dateStr.split("/").map(Number);
    recordDate = new Date(year, month - 1, day);
  } else {
    recordDate = new Date(dateStr);
  }
  const year = recordDate.getFullYear();
  if (frequency === 'quarterly') {
    const month = recordDate.getMonth();
    let quarterEndMonth;
    if (month < 3) quarterEndMonth = 2;
    else if (month < 6) quarterEndMonth = 5;
    else if (month < 9) quarterEndMonth = 8;
    else quarterEndMonth = 11;
    return new Date(year, quarterEndMonth + 1, 0);
  } else if (frequency === 'semi-annual') {
    const month = recordDate.getMonth();
    const periodEndMonth = month < 6 ? 5 : 11;
    return new Date(year, periodEndMonth + 1, 0);
  } else if (frequency === 'annual') {
    return new Date(year, 11, 31);
  }
  return recordDate;
};

// =========================
// Aggregated Reports Route
// =========================
router.get('/reports', async (req, res) => {
  try {
    const { year, barangay, delinquent } = req.query;
    if (!year || !barangay) {
      return res.status(400).json({ message: "Year and barangay are required" });
    }

    // Base fetch by year + applicantAddress includes barangay
    const baseOpts = {
      where: { year },
      include: [{
        model: Applicant,
        as: 'applicant',
        attributes: [],
        where: {
          applicantAddress: { [Op.iLike]: `%${barangay}%` }
        }
      }]
    };

    const records = await BusinessRecord.findAll(baseOpts);
    const now = new Date();

    if (delinquent === "true") {
      // filter out renewed + past period-end
      const delinquentCount = records.filter(r => {
        if (!r.date || !r.frequency) return false;
        const end = computePeriodEnd(r.date, r.frequency);
        return !r.renewed && end < now;
      }).length;

      return res.status(200).json({
        businessTax: { new: delinquentCount, renew: 0, total: delinquentCount }
      });
    }

    // count new vs renew by remarks
    const [newCount, renewCount] = await Promise.all([
      BusinessRecord.count({ 
        where: { year, remarks: { [Op.iLike]: 'new' } }, 
        include: baseOpts.include 
      }),
      BusinessRecord.count({ 
        where: { year, remarks: { [Op.iLike]: 'renew' } }, 
        include: baseOpts.include 
      }),
    ]);
    return res.status(200).json({
      businessTax: { new: newCount, renew: renewCount, total: newCount + renewCount }
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({ message: error.message });
  }
});

// =========================
// GET master list of MayorPermits
// =========================
router.get('/mp', async (req, res) => {
  try {
    const mps = await MayorPermit.findAll();
    res.json(mps);
  } catch (err) {
    console.error('Failed to load mayor permits:', err);
    res.status(500).json({ error: 'Failed to load mayor permits' });
  }
});

// =========================
// Create a new Business Record
// =========================
router.post('/', async (req, res) => {
  try {
    // JWT auth
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    let decoded;
    try { decoded = jwt.verify(token, JWT_SECRET); }
    catch { return res.status(401).json({ message: 'Invalid token' }); }
    const userId = decoded.id;

    // Destructure all incoming fields
    const {
      applicantId, applicantName, applicantAddress,
      businessName, capitalInvestment, natureOfBusiness,
      year, date, gross, orNo, busTax, mayorsPermit,
      sanitaryInps, policeClearance, barangayClearance,
      zoningClearance, taxClearance, garbage,
      garbageCollection, polluters, Occupation,
      verification, weightAndMass, healthClearance,
      secFee, menro, docTax, eggsFee,
      marketCertification, surcharge25, sucharge2,
      miscellaneous, totalPayment, remarks,
      frequency, renewed, Other,
      // New permits array:
      permits = []
    } = req.body;

    // Find or create Applicant
    let applicant;
    if (applicantId) {
      applicant = await Applicant.findByPk(applicantId);
      if (!applicant) return res.status(400).json({ message: 'Applicant not found.' });
      if (natureOfBusiness !== undefined) {
        await applicant.update({ natureOfBusiness });
      }
    } else {
      if (!applicantName || !applicantAddress || !businessName) {
        return res.status(400).json({ message: 'Missing required applicant fields.' });
      }
      const barangay = extractBarangay(applicantAddress);
      applicant = await Applicant.create({
        applicantName,
        applicantAddress,
        businessName,
        natureOfBusiness,
        capitalInvestment: capitalInvestment || 0,
        barangay
      });
    }

    // Create the BusinessRecord
    const record = await BusinessRecord.create({
      applicantId: applicant.id,
      year,
      date,
      gross,
      orNo,
      busTax,
      mayorsPermit,
      sanitaryInps,
      policeClearance,
      barangayClearance,
      zoningClearance,
      taxClearance,
      garbage,
      garbageCollection,
      polluters,
      Occupation,
      verification,
      weightAndMass,
      healthClearance,
      secFee,
      menro,
      docTax,
      eggsFee,
      marketCertification,
      surcharge25,
      sucharge2,
      miscellaneous,
      totalPayment,
      remarks,
      frequency,
      renewed: renewed || false,
      Other,
      userId
    });

    // Link any selected MP’s with amounts
    if (Array.isArray(permits) && permits.length) {
      await Promise.all(permits.map(p =>
        BusinessRecordPermit.create({
          businessRecordId: record.id,
          mayorPermitId:    p.mayorPermitId,
          amount:           p.amount
        })
      ));
    }

    // Return the newly created record + its permits
    const full = await BusinessRecord.findByPk(record.id, {
      include: [
        { model: Applicant, as: 'applicant' },
        { model: MayorPermit, as: 'permits', through: { attributes: ['amount'] } }
      ]
    });

    return res.status(201).json({
      message: 'Business record created successfully',
      record: full
    });
  } catch (error) {
    console.error('Error creating business record:', error);
    return res.status(500).json({ message: error.message });
  }
});

// =========================
// GET all business records
// =========================
router.get('/', async (req, res) => {
  try {
    const { applicantId, barangay } = req.query;
    const where = {};
    if (applicantId) where.applicantId = applicantId;

    const include = [
      { model: Applicant, as: 'applicant',
        where: barangay ? { applicantAddress: { [Op.iLike]: `%${barangay}%` } } : undefined
      },
      { model: MayorPermit, as: 'permits', through: { attributes: ['amount'] } }
    ];

    const records = await BusinessRecord.findAll({ where, include });
    return res.status(200).json({ records });
  } catch (error) {
    console.error('Error fetching records:', error);
    return res.status(500).json({ message: error.message });
  }
});

// =========================
// GET a single business record by id
// =========================
router.get('/:id', async (req, res) => {
  try {
    const record = await BusinessRecord.findByPk(req.params.id, {
      include: [
        { model: Applicant, as: 'applicant' },
        { model: MayorPermit, as: 'permits', through: { attributes: ['amount'] } }
      ]
    });
    if (!record) return res.status(404).json({ message: 'Record not found.' });
    return res.status(200).json({ record });
  } catch (error) {
    console.error('Error fetching record:', error);
    return res.status(500).json({ message: error.message });
  }
});

// =========================
// UPDATE a business record (and its permits)
// =========================
router.put('/:id', async (req, res) => {
  try {
    const record = await BusinessRecord.findByPk(req.params.id, {
      include: [{ model: Applicant, as: 'applicant' }]
    });
    if (!record) return res.status(404).json({ message: 'Record not found.' });

    // Update record fields
    await record.update({
      year: req.body.year,
      date: req.body.date,
      gross: req.body.gross,
      orNo: req.body.orNo,
      busTax: req.body.busTax,
      mayorsPermit: req.body.mayorsPermit,
      sanitaryInps: req.body.sanitaryInps,
      barangayClearance: req.body.barangayClearance,
      zoningClearance: req.body.zoningClearance,
      taxClearance: req.body.taxClearance,
      garbage: req.body.garbage,
      garbageCollection: req.body.garbageCollection,
      polluters: req.body.polluters,
      Occupation: req.body.Occupation,
      verification: req.body.verification,
      weightAndMass: req.body.weightAndMass,
      healthClearance: req.body.healthClearance,
      secFee: req.body.secFee,
      menro: req.body.menro,
      docTax: req.body.docTax,
      eggsFee: req.body.eggsFee,
      marketCertification: req.body.marketCertification,
      surcharge25: req.body.surcharge25,
      sucharge2: req.body.sucharge2,
      miscellaneous: req.body.miscellaneous,
      totalPayment: req.body.totalPayment,
      remarks: req.body.remarks,
      frequency: req.body.frequency,
      renewed: req.body.renewed || false,
      Other: req.body.Other
    });

    // Update applicant details if needed
    if (record.applicant) {
      const newBarangay = extractBarangay(req.body.applicantAddress || '');
      await record.applicant.update({
        applicantName: req.body.applicantName,
        applicantAddress: req.body.applicantAddress,
        businessName: req.body.businessName,
        natureOfBusiness: req.body.natureOfBusiness,
        capitalInvestment: req.body.capitalInvestment,
        barangay: newBarangay || record.applicant.barangay
      });
    }

    // Sync permits: remove old, add new
    await BusinessRecordPermit.destroy({ where: { businessRecordId: record.id } });
    if (Array.isArray(req.body.permits)) {
      await Promise.all(req.body.permits.map(p =>
        BusinessRecordPermit.create({
          businessRecordId: record.id,
          mayorPermitId:    p.mayorPermitId,
          amount:           p.amount
        })
      ));
    }

    const updated = await BusinessRecord.findByPk(record.id, {
      include: [
        { model: Applicant, as: 'applicant' },
        { model: MayorPermit, as: 'permits', through: { attributes: ['amount'] } }
      ]
    });

    return res.status(200).json({
      message: 'Record updated successfully',
      record: updated
    });
  } catch (error) {
    console.error('Error updating record:', error);
    return res.status(500).json({ message: error.message });
  }
});

// =========================
// DELETE a business record
// =========================
router.delete('/:id', async (req, res) => {
  try {
    const record = await BusinessRecord.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found.' });

    // Remove related permits then delete record
    await BusinessRecordPermit.destroy({ where: { businessRecordId: record.id } });
    await record.destroy();

    return res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
