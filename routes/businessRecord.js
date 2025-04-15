'use strict';
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Sequelize = require('sequelize');
const { BusinessRecord, Applicant } = require('../models');
const { Op } = require('sequelize');

// Use your JWT secret (set in environment or fallback)
const JWT_SECRET =
  process.env.JWT_SECRET ||
  '0216cd9396619f3abfcec489fe0697d9ce6ec029543998da9b47cb3ebd5e5444bf9d601dea2be92c858c8bc7d21f4fdd82074df0e3a0d81b9bb468286e7dbfe8';

// Helper function to extract barangay from address
const extractBarangay = (address) => {
  const barangays = [
    "Amsipit", "Bales", "Colon", "Daliao", "Kabatiol", "Kablacan", "Kamanga",
    "Kanalo", "Lumatil", "Lumasal", "Malbang", "Nomoh", "Pananag", "Poblacion",
    "Public Market", "Seven Hills", "Tinoto",
  ];
  for (const brgy of barangays) {
    if (address.toLowerCase().includes(brgy.toLowerCase())) {
      return brgy;
    }
  }
  return null;
};

// Helper function to compute the period end date based on record date and frequency.
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
    if (month < 3) {
      quarterEndMonth = 2;
    } else if (month < 6) {
      quarterEndMonth = 5;
    } else if (month < 9) {
      quarterEndMonth = 8;
    } else {
      quarterEndMonth = 11;
    }
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

    if (delinquent === "true") {
      const records = await BusinessRecord.findAll({
        where: { year },
        include: [{
          model: Applicant,
          as: 'applicant',
          attributes: [],
          where: {
            applicantAddress: { [Op.iLike]: `%${barangay}%` }
          }
        }]
      });
      const now = new Date();
      const delinquentRecords = records.filter(record => {
        if (!record.date || !record.frequency) return false;
        const periodEnd = computePeriodEnd(record.date, record.frequency);
        return !record.renewed && (periodEnd < now);
      });
      const delinquentCount = delinquentRecords.length;
      return res.status(200).json({
        businessTax: { new: delinquentCount, renew: 0, total: delinquentCount }
      });
    }

    const newCount = await BusinessRecord.count({
      where: {
        year,
        remarks: { [Op.iLike]: 'new' }
      },
      include: [{
        model: Applicant,
        as: 'applicant',
        where: { applicantAddress: { [Op.iLike]: `%${barangay}%` } }
      }]
    });

    const renewCount = await BusinessRecord.count({
      where: {
        year,
        remarks: { [Op.iLike]: 'renew' }
      },
      include: [{
        model: Applicant,
        as: 'applicant',
        where: { applicantAddress: { [Op.iLike]: `%${barangay}%` } }
      }]
    });

    const total = newCount + renewCount;
    return res.status(200).json({
      businessTax: { new: newCount, renew: renewCount, total }
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({ message: error.message });
  }
});

// =========================
// Create a new Business Record
// =========================
router.post('/', async (req, res) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    const userId = decoded.id;

    // Destructure request body including the new natureOfBusiness field for Applicant
    const {
      applicantId,
      applicantName,
      applicantAddress,
      businessName,
      capitalInvestment,
      year,
      date,
      gross,
      orNo,
      busTax,
      mayorsPermit,
      sanitaryInps,
      policeClearance,
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
      renewed,
      zoningClearance,
      // NEW FIELDS:
      barangayClearance,
      Other,
      natureOfBusiness // New field for the Applicant
    } = req.body;

    let applicant;
    if (applicantId) {
      applicant = await Applicant.findByPk(applicantId);
      if (!applicant) {
        return res.status(400).json({ message: 'Applicant not found.' });
      }
      // Optionally update the applicant's natureOfBusiness if provided:
      if (typeof natureOfBusiness !== 'undefined') {
        await applicant.update({ natureOfBusiness });
      }
    } else {
      if (!applicantName || !applicantAddress || !businessName) {
        return res.status(400).json({
          message:
            'Missing required fields: applicantName, applicantAddress, and businessName are needed to create a new applicant.',
        });
      }
      const barangay = extractBarangay(applicantAddress);
      // Note: The applicant object is created with businessName followed immediately by natureOfBusiness.
      applicant = await Applicant.create({
        applicantName,
        applicantAddress,
        businessName,
        natureOfBusiness,          // This field comes right after businessName in the object literal order.
        capitalInvestment: capitalInvestment ?? 0,
        barangay,
      });
    }

    const newRecord = await BusinessRecord.create({
      applicantId: applicant.id,
      year,
      date,
      gross,
      orNo,
      busTax,
      mayorsPermit,
      sanitaryInps,
      policeClearance,
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
      zoningClearance,
      // NEW FIELDS:
      barangayClearance,
      Other,
      userId,
    });

    return res.status(201).json({
      message: 'Business record created successfully',
      record: newRecord,
      applicant,
    });
  } catch (error) {
    console.error('Error creating business record:', error);
    return res.status(500).json({ message: error.message });
  }
});

// =========================
// GET: Fetch all business records with optional filtering.
// =========================
router.get('/', async (req, res) => {
  try {
    const { applicantId, barangay } = req.query;
    const whereClause = {};
    if (applicantId) {
      whereClause.applicantId = applicantId;
    }
    const includeOptions = [{ model: Applicant, as: 'applicant' }];
    if (barangay) {
      includeOptions[0].where = {
        applicantAddress: { [Op.iLike]: `%${barangay}%` }
      };
    }
    let records = await BusinessRecord.findAll({
      where: whereClause,
      include: includeOptions,
    });

    // Transform each record to ensure applicant's businessName is followed by natureOfBusiness
    records = records.map(record => {
      if (record.applicant) {
        record.applicant = {
          id: record.applicant.id,
          applicantName: record.applicant.applicantName,
          applicantAddress: record.applicant.applicantAddress,
          businessName: record.applicant.businessName,
          natureOfBusiness: record.applicant.natureOfBusiness, // Positioned immediately after businessName
          capitalInvestment: record.applicant.capitalInvestment,
          barangay: record.applicant.barangay,
        };
      }
      return record;
    });

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
    let record = await BusinessRecord.findByPk(req.params.id, {
      include: [{ model: Applicant, as: 'applicant' }],
    });
    if (!record) {
      return res.status(404).json({ message: 'Record not found.' });
    }
    // Transform applicant object to ensure ordered keys
    if (record.applicant) {
      record.applicant = {
        id: record.applicant.id,
        applicantName: record.applicant.applicantName,
        applicantAddress: record.applicant.applicantAddress,
        businessName: record.applicant.businessName,
        natureOfBusiness: record.applicant.natureOfBusiness,
        capitalInvestment: record.applicant.capitalInvestment,
        barangay: record.applicant.barangay,
      };
    }
    return res.status(200).json({ record });
  } catch (error) {
    console.error('Error fetching record:', error);
    return res.status(500).json({ message: error.message });
  }
});

// =========================
// UPDATE a business record by id and its linked applicant
// =========================
router.put('/:id', async (req, res) => {
  try {
    const record = await BusinessRecord.findByPk(req.params.id, {
      include: [{ model: Applicant, as: 'applicant' }],
    });
    if (!record) {
      return res.status(404).json({ message: 'Record not found.' });
    }
    await record.update({
      year: req.body.year,
      date: req.body.date,
      gross: req.body.gross,
      orNo: req.body.orNo,
      busTax: req.body.busTax,
      mayorsPermit: req.body.mayorsPermit,
      sanitaryInps: req.body.sanitaryInps,
      policeClearance: req.body.policeClearance,
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
      Other: req.body.Other,
    });
    if (record.applicant) {
      const newBarangay = extractBarangay(req.body.applicantAddress || '');
      await record.applicant.update({
        applicantName: req.body.applicantName,
        applicantAddress: req.body.applicantAddress,
        businessName: req.body.businessName,
        natureOfBusiness: req.body.natureOfBusiness, // Update natureOfBusiness next to businessName
        capitalInvestment: req.body.capitalInvestment,
        barangay: newBarangay || record.applicant.barangay,
      });
    }
    return res.status(200).json({
      message: 'Record and applicant updated successfully',
      record,
      applicant: record.applicant,
    });
  } catch (error) {
    console.error('Error updating record:', error);
    return res.status(500).json({ message: error.message });
  }
});

// =========================
// DELETE a business record by id
// =========================
router.delete('/:id', async (req, res) => {
  try {
    const record = await BusinessRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found.' });
    }
    await record.destroy();
    return res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
