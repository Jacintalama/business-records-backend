const express = require('express');
const router = express.Router();
const { BusinessRecord, Barangay, Sequelize } = require('../models');
const { Op } = Sequelize;

router.get('/', async (req, res) => {
  try {
    const { ownerId, barangay } = req.query;
    // Build query options. Adjust field names as needed.
    const queryOptions = {
      include: [
        {
          model: Barangay,
          as: 'barangay',
          attributes: ['name'],
          where: barangay ? { name: { [Op.iLike]: barangay } } : undefined,
          required: false
        }
      ],
      where: {}
    };

    // Optionally filter by ownerId if provided
    if (ownerId) {
      queryOptions.where.id = ownerId;
    }

    const records = await BusinessRecord.findAll(queryOptions);
    const mappedRecords = records.map(record => ({
      id: record.id,
      year: record.year,
      date: record.date,
      gross: record.gross,
      orNo: record.orNo,
      busTax: record.busTax,
      mayorsPermit: record.mayorsPermit,
      sanitaryInps: record.sanitaryInps,
      policeClearance: record.policeClearance,
      taxClearance: record.taxClearance,
      garbage: record.garbage,
      verification: record.verification,
      weightAndMass: record.weightAndMass,
      healthClearance: record.healthClearance,
      secFee: record.secFee,
      menro: record.menro,
      docTax: record.docTax,
      eggsFee: record.eggsFee,
      market: record.market,
      surcharge25: record.surcharge25,
      surcharge5: record.surcharge5,
      totalPayment: record.totalPayment,
      remarks: record.remarks,
      // Use associated Barangay name if available; otherwise, fallback to applicantAddress.
      barangay: record.barangay ? record.barangay.name : record.applicantAddress
    }));

    res.json({ records: mappedRecords });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ message: "Error fetching records", error: error.message });
  }
});

module.exports = router;
