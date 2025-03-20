'use strict';

const express = require('express');
const router = express.Router();
const { BusinessRecord, Sequelize } = require('../models');
const { Op } = Sequelize;

const barangays = [
  "Malbang", "Nomoh", "Seven Hills", "Pananag", "Daliao", "Colon",
  "Amsipit", "Bales", "Kamanga", "Kablacan", "Kanalo",
  "Lumatil", "Lumasal", "Tinoto", "Public Market", "Poblacion", "Kabatiol",
];

// Function to safely extract barangay from address
const getBarangayFromAddress = (address) => {
  const normalizedAddress = address.toLowerCase();
  for (const barangay of barangays) {
    const regex = new RegExp(`\\b${barangay.toLowerCase()}\\b`);
    if (regex.test(normalizedAddress)) {
      return barangay;
    }
  }
  return null;
};

router.get('/', async (req, res) => {
  try {
    const { category, barangay } = req.query;

    const queryOptions = {
      where: {}
    };

    if (category && category !== "All") {
      queryOptions.where.businessCategory = category;
    }

    const records = await BusinessRecord.findAll(queryOptions);

    // Filter by barangay if barangay is provided in query
    const filteredRecords = barangay
      ? records.filter(record => {
          const matchedBarangay = getBarangayFromAddress(record.applicantAddress || "");
          return matchedBarangay && matchedBarangay.toLowerCase() === barangay.toLowerCase();
        })
      : records;

    const owners = filteredRecords.map(record => ({
      id: record.id,
      applicantName: record.applicantName,
      businessName: record.businessName,
      businessCategory: record.businessCategory || "Uncategorized",
      applicantAddress: record.applicantAddress
    }));

    res.json({ owners });
  } catch (error) {
    console.error("Error fetching owners:", error);
    res.status(500).json({ message: "Error fetching owners", error: error.message });
  }
});

module.exports = router;
