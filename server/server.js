require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const customerRoutes = require('./routes/customerRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const publicApiRoutes = require('./routes/publicApiRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Internal routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/keys', apiKeyRoutes);

// Public API routes (for external integrations)
app.use('/v1', publicApiRoutes);

// API Info endpoint
app.get('/v1', (req, res) => {
  res.json({
    name: 'StyleSync AI Public API',
    version: '1.0.0',
    description: 'AI powered business intelligence for retail businesses',
    endpoints: {
      analyze: 'POST /v1/analyze',
      healthCheck: 'POST /v1/health-check'
    },
    authentication: 'x-api-key header required',
    plans: {
      free: '100 calls/month',
      starter: '500 calls/month',
      business: '5000 calls/month',
      enterprise: 'unlimited'
    },
    contact: 'farman@stylesync.ai'
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'StyleSync AI server is running',
    version: '1.0.0',
    publicApi: '/v1'
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Connection failed:', error.message);
    process.exit(1);
  });