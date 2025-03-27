'use strict';
const express = require('express');
const router = express.Router();
const { BusinessRecord, Applicant } = require('../models');

// Helper function to extract barangay from address
const extractBarangay = (address) => {
  const barangays = [
    "Amsipit", "Bales", "Colon", "Daliao", "Kabatiol", "Kablacan", "Kamanga",
    "Kanalo", "Lumatil", "Lumasal", "Malbang", "Nomoh", "Pananag", "Poblacion",
    "Public Market", "Seven Hills", "Tinoto",
  ];
  // Look for a match (case-insensitive)
  for (const brgy of barangays) {
    if (address.toLowerCase().includes(brgy.toLowerCase())) {
      return brgy;
    }
  }
  return null;
};

// Create a new Business Record (for existing or brand-new applicant)
router.post('/', async (req, res) => {
  try {
    const {
      // Applicant fields
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
      surcharge25,
      surcharge5,
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
      // 2) If no applicantId is provided, create a brand-new applicant
      // Ensure required applicant fields are present
      if (!applicantName || !applicantAddress || !businessName) {
        return res.status(400).json({
          message:
            'Missing required fields: applicantName, applicantAddress, and businessName are needed to create a new applicant.',
        });
      }

      // Extract the barangay from the applicantAddress
      const barangay = extractBarangay(applicantAddress);

      applicant = await Applicant.create({
        applicantName,
        applicantAddress,
        businessName,
        capitalInvestment: capitalInvestment ?? 0,
        barangay, // Save the extracted barangay (Note: Ensure your Applicant model has this column)
      });
    }

    // Create the business record, linking to applicant.id
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
      surcharge25,
      surcharge5,
      totalPayment,
      remarks,
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

/**
 * Fetch all business records, optionally filtered by:
 * - applicantId (BusinessRecord.applicantId)
 * - barangay (filtering by applicantAddress substring)
 *
 * Examples:
 *   GET /api/business-record?applicantId=123
 *   GET /api/business-record?barangay=Colon
 *   GET /api/business-record?applicantId=123&barangay=Colon
 *   GET /api/business-record (returns all records)
 */
const { Op } = require('sequelize'); // ensure Op is imported

router.get('/', async (req, res) => {
  try {
    const { applicantId, barangay } = req.query;

    // Build WHERE clause for BusinessRecord filtering
    const whereClause = {};
    if (applicantId) {
      whereClause.applicantId = applicantId;
    }

    // Build INCLUDE options for Applicant
    const includeOptions = [{ model: Applicant, as: 'applicant' }];
    // If a barangay query parameter is provided, filter by applicantAddress containing that substring
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

// Fetch a single business record by id
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

// Update a business record by id (and update the linked applicant)
router.put('/:id', async (req, res) => {
  try {
    // Fetch the business record along with its associated applicant
    const record = await BusinessRecord.findByPk(req.params.id, {
      include: [{ model: Applicant, as: 'applicant' }],
    });

    if (!record) {
      return res.status(404).json({ message: 'Record not found.' });
    }

    // Update BusinessRecord fields
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
      surcharge25: req.body.surcharge25,
      surcharge5: req.body.surcharge5,
      totalPayment: req.body.totalPayment,
      remarks: req.body.remarks,
    });

    // Update the linked Applicant fields if the applicant exists.
    if (record.applicant) {
      // Optionally re-extract barangay from the new address
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

// Delete a business record by id
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
