'use strict';
const express = require('express');
const router = express.Router();
const { BusinessRecord } = require('../models');
const { Op } = require('sequelize');

// Barangay mapping for lookup
const barangayMapping = {
  "malbang": 1,
  "nomoh": 2,
  "seven hills": 3,
  "pananag": 4,
  "daliao": 5,
  "colon": 6,
  "amsipit": 7,
  "bales": 8,
  "kamanga": 9,
  "kablacan": 10,
  "kanalo": 11,
  "lumatil": 12,
  "lumasal": 13,
  "tinoto": 14,
  "public market": 15,
  "poblacion": 16,
  "kabatiol": 17
};

// ✅ POST handler for adding new records from your React form
router.post('/', async (req, res) => {
  const {
    applicantName, applicantAddress, businessName, capitalInvestment, year, date,
    gross, orNo, busTax, mayorsPermit, sanitaryInps, policeClearance, taxClearance,
    garbage, verification, weightAndMass, healthClearance, secFee, menro, docTax,
    eggsFee, market, surcharge25, surcharge5, totalPayment, remarks
  } = req.body;

  try {
    const newRecord = await BusinessRecord.create({
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
      remarks
    });

    return res.status(201).json({
      message: 'Business record created successfully',
      record: newRecord
    });
  } catch (error) {
    console.error('Error creating record:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


// ✅ Existing GET handler (fetching records by ownerId & barangay)
router.get('/', async (req, res) => {
  try {
    const { ownerId } = req.query;
    console.log('Received ownerId:', ownerId);

    if (!ownerId) {
      return res.status(400).json({ message: 'ownerId is required.' });
    }

    const records = await BusinessRecord.findAll({
      where: { id: ownerId }
    });

    if (!records.length) {
      return res.status(404).json({ message: 'No records found.' });
    }

    const ownerInfo = {
      applicantName: records[0].applicantName,
      address: records[0].applicantAddress,
      businessName: records[0].businessName,
      capitalInvestment: records[0].capitalInvestment
    };

    return res.status(200).json({ records, ownerInfo });

  } catch (error) {
    console.error('Error fetching records:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


module.exports = router;
