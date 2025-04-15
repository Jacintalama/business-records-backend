"use strict";

const express = require("express");
const router = express.Router();
// Make sure this matches your model export
const { Boatrecord } = require("../models");

// GET all boat records, optionally filtering by barangay (and birthday)
router.get("/", async (req, res) => {
  try {
    const { barangay, birthday } = req.query;
    const where = {};

    if (barangay && barangay.toLowerCase() !== "all") {
      where.barangay = barangay;
    }
    if (birthday) {
      // Expecting YYYY-MM-DD
      where.birthday = birthday;
    }

    const records = await Boatrecord.findAll({ where });
    res.json({ records });
  } catch (error) {
    console.error("Error fetching boat records:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET a single boat record by id
router.get("/:id", async (req, res) => {
  try {
    const record = await Boatrecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Boat record not found" });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create a new boat record
router.post("/", async (req, res) => {
  try {
    // Destructure only the allowed fields (including birthday)
    const {
      status,
      control_no,
      fish_registration_no_rsbsa,
      last_name,
      first_name,
      middle_name,
      extension_name,
      purok,
      birthday,               // new
      contact_no,             // expects string input from front-end
      fishing_boat_name,
      make,
      engine_sn,
      no_of_fisher_man,
      or_no,
      amount_paid,
      date,
      barangay
    } = req.body;

    const newRecord = await Boatrecord.create({
      status,
      control_no,
      fish_registration_no_rsbsa,
      last_name,
      first_name,
      middle_name,
      extension_name,
      purok,
      birthday,               // new
      contact_no,
      fishing_boat_name,
      make,
      engine_sn,
      no_of_fisher_man,
      or_no,
      amount_paid,
      date,
      barangay
    });

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error creating boat record:", error);
    res.status(500).json({ message: error.message });
  }
});

// PUT update an existing boat record
router.put("/:id", async (req, res) => {
  try {
    const record = await Boatrecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Boat record not found" });
    }

    // Only update allowed fields
    const updates = {};
    [
      "status",
      "control_no",
      "fish_registration_no_rsbsa",
      "last_name",
      "first_name",
      "middle_name",
      "extension_name",
      "purok",
      "birthday",             // new
      "contact_no",
      "fishing_boat_name",
      "make",
      "engine_sn",
      "no_of_fisher_man",
      "or_no",
      "amount_paid",
      "date",
      "barangay"
    ].forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await record.update(updates);
    res.json(record);
  } catch (error) {
    console.error("Error updating boat record:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE a boat record
router.delete("/:id", async (req, res) => {
  try {
    const record = await Boatrecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Boat record not found" });
    }
    await record.destroy();
    res.json({ message: "Boat record deleted successfully" });
  } catch (error) {
    console.error("Error deleting boat record:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
