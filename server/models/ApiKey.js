const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'business', 'enterprise'],
    default: 'free'
  },
  callsUsed: {
    type: Number,
    default: 0
  },
  callsLimit: {
    type: Number,
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('ApiKey', apiKeySchema);    