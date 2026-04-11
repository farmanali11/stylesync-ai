const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');

// Generate new API key
exports.generateApiKey = async (req, res) => {
  try {
    const { businessName } = req.body;
    const userId = req.user._id;

    // Check if user already has an API key
    const existing = await ApiKey.findOne({ userId });
    if (existing) {
      return res.json({
        success: true,
        message: 'You already have an API key',
        apiKey: existing
      });
    }

    // Generate unique API key
    const apiKey = 'sk-ss-' + crypto
      .randomBytes(32)
      .toString('hex');

    const newApiKey = await ApiKey.create({
      userId,
      businessName,
      apiKey,
      plan: 'free',
      callsLimit: 100
    });

    res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      apiKey: newApiKey
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get my API key
exports.getMyApiKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findOne({
      userId: req.user._id
    });

    if (!apiKey) {
      return res.json({
        success: true,
        apiKey: null,
        message: 'No API key found. Generate one first.'
      });
    }

    res.json({ success: true, apiKey });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Regenerate API key
exports.regenerateApiKey = async (req, res) => {
  try {
    const newKey = 'sk-ss-' + crypto
      .randomBytes(32)
      .toString('hex');

    const apiKey = await ApiKey.findOneAndUpdate(
      { userId: req.user._id },
      { apiKey: newKey, callsUsed: 0 },
      { new: true }
    );

    res.json({
      success: true,
      message: 'API key regenerated',
      apiKey
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};