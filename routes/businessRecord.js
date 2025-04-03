'use strict';
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Sequelize = require('sequelize'); // Add this line
const { BusinessRecord, Applicant } = require('../models');
const { Op } = require('sequelize');

// Use your JWT secret (set in environment or fallback)
const JWT_SECRET = process.env.JWT_SECRET || '0216cd9396619f3abfcec489fe0697d9ce6ec029543998da9b47cb3ebd5e5444bf9d601dea2be92c858c8bc7d21f4fdd82074df0e3a0d81b9bb468286e7dbfe8';

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

// =========================
// Aggregated Reports Route
// =========================

// GET aggregated business tax reports based on year and barangay using remarks field.
router.get('/reports', async (req, res) => {
  try {
    const { year, barangay, delinquent } = req.query;
    if (!year || !barangay) {
      return res.status(400).json({ message: "Year and barangay are required" });
    }

    // If delinquent flag is provided, apply different logic
    if (delinquent === "true") {
      const currentYear = new Date().getFullYear();
      const selectedYearInt = parseInt(year);
    
      if (selectedYearInt === currentYear) {
        const delinquentRecords = await BusinessRecord.findAll({
          attributes: [
            'applicantId',
            [Sequelize.fn('MAX', Sequelize.col('year')), 'latestYear']
          ],
          group: ['BusinessRecord.applicantId'], // group only by applicantId
          having: Sequelize.literal(`MAX(year) < ${currentYear}`),
          include: [{
            model: Applicant,
            as: 'applicant',
            attributes: [], // avoid selecting extra columns that would force you to GROUP BY them
            where: {
              applicantAddress: { [Op.iLike]: `%${barangay}%` }
            }
          }]
        });
        const delinquentCount = delinquentRecords.length;
        return res.status(200).json({
          businessTax: { new: delinquentCount, renew: 0, total: delinquentCount }
        });
      } else {
        // For past years, use your original logic (if needed)
        const delinquentCount = await BusinessRecord.count({
          where: { year },
          include: [{
            model: Applicant,
            as: 'applicant',
            where: { applicantAddress: { [Op.iLike]: `%${barangay}%` } }
          }]
        });
        return res.status(200).json({
          businessTax: { new: delinquentCount, renew: 0, total: delinquentCount }
        });
      }
    }
    

    // Otherwise, count records where remarks is "new" and "renew"
    const newCount = await BusinessRecord.count({
      where: {
        year,
        remarks: { [Op.iLike]: 'new' }
      },
      include: [{
        model: Applicant,
        as: 'applicant',
        where: {
          applicantAddress: { [Op.iLike]: `%${barangay}%` }
        }
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
        where: {
          applicantAddress: { [Op.iLike]: `%${barangay}%` }
        }
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

    console.log('Token received in create endpoint:', token);

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    const userId = decoded.id;

    const {
      applicantId, // optional
      applicantName,
      applicantAddress,
      businessName,
      capitalInvestment,
      // BusinessRecord fields
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
      verification,
      weightAndMass,
      healthClearance,
      secFee,
      menro,
      docTax,
      eggsFee,
      market,
      marketCertification,
      surcharge25,
      sucharge2, // renamed field
      miscellaneous,
      totalPayment,
      remarks,
    } = req.body;

    let applicant;
    // 1) If applicantId is provided, try to find that applicant
    if (applicantId) {
      applicant = await Applicant.findByPk(applicantId);
      if (!applicant) {
        return res.status(400).json({ message: 'Applicant not found.' });
      }
    } else {
      // 2) If no applicantId, create a new applicant
      if (!applicantName || !applicantAddress || !businessName) {
        return res.status(400).json({
          message:
            'Missing required fields: applicantName, applicantAddress, and businessName are needed to create a new applicant.',
        });
      }
      const barangay = extractBarangay(applicantAddress);
      applicant = await Applicant.create({
        applicantName,
        applicantAddress,
        businessName,
        capitalInvestment: capitalInvestment ?? 0,
        barangay, // ensure your Applicant model has this column if needed
      });
    }

    // Create the BusinessRecord and include the userId
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
      verification,
      weightAndMass,
      healthClearance,
      secFee,
      menro,
      docTax,
      eggsFee,
      market,
      marketCertification, // new field
      surcharge25,
      sucharge2, // renamed from surcharge5
      miscellaneous, // new field
      totalPayment,
      remarks,
      userId,  // Associate this record with the logged-in user
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
    const records = await BusinessRecord.findAll({
      where: whereClause,
      include: includeOptions,
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
    const record = await BusinessRecord.findByPk(req.params.id, {
      include: [{ model: Applicant, as: 'applicant' }],
    });
    if (!record) {
      return res.status(404).json({ message: 'Record not found.' });
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
      taxClearance: req.body.taxClearance,
      garbage: req.body.garbage,
      verification: req.body.verification,
      weightAndMass: req.body.weightAndMass,
      healthClearance: req.body.healthClearance,
      secFee: req.body.secFee,
      menro: req.body.menro,
      docTax: req.body.docTax,
      eggsFee: req.body.eggsFee,
      market: req.body.market,
      marketCertification: req.body.marketCertification, // new field
      surcharge25: req.body.surcharge25,
      sucharge2: req.body.sucharge2, // renamed from surcharge5
      miscellaneous: req.body.miscellaneous, // new field
      totalPayment: req.body.totalPayment,
      remarks: req.body.remarks,
    });
    if (record.applicant) {
      const newBarangay = extractBarangay(req.body.applicantAddress || '');
      await record.applicant.update({
        applicantName: req.body.applicantName,
        applicantAddress: req.body.applicantAddress,
        businessName: req.body.businessName,
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
