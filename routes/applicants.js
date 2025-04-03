'use strict';
const express = require('express');
const router = express.Router();
const { Applicant } = require('../models');
const { Op } = require('sequelize');

// GET all applicants (optionally filtered by barangay in applicantAddress)
router.get('/', async (req, res) => {
  try {
    const { barangay } = req.query;
    const whereClause = barangay
      ? { applicantAddress: { [Op.iLike]: `%${barangay}%` } }
      : {};
    const applicants = await Applicant.findAll({ where: whereClause });
    return res.status(200).json({ applicants });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return res.status(500).json({ message: error.message });
  }
});

// CREATE a new applicant
router.post('/', async (req, res) => {
  try {
    const { applicantName, applicantAddress, businessName, capitalInvestment } = req.body;
    const newApplicant = await Applicant.create({
      applicantName,
      applicantAddress,
      businessName,
      capitalInvestment,
    });
    return res.status(201).json({
      message: 'Applicant created successfully',
      applicant: newApplicant,
    });
  } catch (error) {
    console.error('Error creating applicant:', error);
    return res.status(500).json({ message: error.message });
  }
});

// UPDATE an applicant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { applicantName, applicantAddress, businessName, capitalInvestment } = req.body;
    const applicant = await Applicant.findByPk(id);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found.' });
    }
    const updatedApplicant = await applicant.update({
      applicantName,
      applicantAddress,
      businessName,
      capitalInvestment,
    });
    return res.status(200).json({
      message: 'Applicant updated successfully',
      applicant: updatedApplicant,
    });
  } catch (error) {
    console.error('Error updating applicant:', error);
    return res.status(500).json({ message: error.message });
  }
});

// DELETE an applicant
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const applicant = await Applicant.findByPk(id);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found.' });
    }
    await applicant.destroy();
    return res.status(200).json({ message: 'Applicant deleted successfully' });
  } catch (error) {
    console.error('Error deleting applicant:', error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
