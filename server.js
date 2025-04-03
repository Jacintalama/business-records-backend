const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Allow requests from your frontend over the network
app.use(cors({
  origin: 'http://192.168.1.107:3001', // <-- update this to your actual frontend URL
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
const businessRecordRoutes = require('./routes/businessRecord');
const applicantsRoutes = require('./routes/applicants');
const authRoutes = require('./routes/auth');

app.get('/', (req, res) => {
  res.send('🚀 Backend API is running. Use /api/... endpoints.');
});

app.use('/api/business-record', businessRecordRoutes);
app.use('/api/applicants', applicantsRoutes);
app.use('/api/auth', authRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 3000;

// ✅ Important: allow LAN access
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
});
