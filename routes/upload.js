const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const router = express.Router();

// Configure multer to store file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * POST /upload
 * Expects a file upload with the key "file"
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Read workbook from the file buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    
    // Select the first sheet (you can customize if necessary)
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet data to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    // Here you can process jsonData and map it to your database models (Business, Payment, etc.)
    // For example, iterate over jsonData and use your Sequelize models to create records.

    // Example (pseudocode):
    // for (const row of jsonData) {
    //   // Validate and extract data from row
    //   // Use Business.create({...}) and Payment.create({...})
    // }

    // Respond with parsed data for now (for testing)
    res.json({ data: jsonData });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Error processing file.' });
  }
});

module.exports = router;
