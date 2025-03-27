const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for frontend running on localhost:3001
app.use(cors({
  origin: 'http://localhost:3001'
}));

app.use(express.json());

// Correctly import routes (ensure these match your actual filenames exactly)
const businessRecordRoutes = require('./routes/businessRecord')
const applicantsRoutes = require('./routes/applicants'); 

// Mount route middleware with clear endpoint naming
app.use('/api/business-record', businessRecordRoutes);
app.use('/api/applicants', applicantsRoutes);

// Catch-all route for undefined endpoints (optional but recommended)
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Proper error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start the server on specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
