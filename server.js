const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Allow requests from your frontend
app.use(cors({
  origin: 'http://192.168.1.107:3001',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Import your routers
const businessRecordRoutes = require('./routes/businessRecord');
const mayorPermitsRouter  = require('./routes/mayorPermits');
const applicantsRoutes     = require('./routes/applicants');
const authRoutes           = require('./routes/auth');
const boatRecordsRoutes    = require('./routes/boatrecords');

app.get('/', (req, res) => {
  res.send('🚀 Backend API is running. Use /api/... endpoints.');
});

// Mount them in order:
app.use('/api/business-record',         businessRecordRoutes);
app.use('/api/business-record/mp',      mayorPermitsRouter);    // ← here’s the new one
app.use('/api/applicants',              applicantsRoutes);
app.use('/api/auth',                    authRoutes);
app.use('/api/boatrecords',             boatRecordsRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
});
