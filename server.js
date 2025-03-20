const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mount your business record routes
const businessRecordRoutes = require('./routes/businessRecord');
app.use('/api/business-record', businessRecordRoutes);

// Mount your owners route
const ownersRoutes = require('./routes/owners');
app.use('/api/owners', ownersRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
