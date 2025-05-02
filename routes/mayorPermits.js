'use strict';
const express = require('express');
const router = express.Router();
const { MayorPermit } = require('../models');

// GET /api/mp
router.get('/', async (req, res) => {
  try {
    const mps = await MayorPermit.findAll();
    res.json(mps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load mayor permits' });
  }
});

module.exports = router;
