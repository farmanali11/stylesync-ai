const ApiKey = require('../models/ApiKey');

const planLimits = {
  free: 100,
  starter: 500,
  business: 5000,
  enterprise: 999999
};

exports.validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required',
        message: 'Include x-api-key in your request headers',
        docs: 'https://stylesync-ai.vercel.app/docs'
      });
    }

    const keyRecord = await ApiKey.findOne({ apiKey });

    if (!keyRecord) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'This API key does not exist'
      });
    }

    if (!keyRecord.isActive) {
      return res.status(403).json({
        error: 'API key disabled',
        message: 'This API key has been disabled'
      });
    }

    // Check rate limit
    const limit = planLimits[keyRecord.plan];
    if (keyRecord.callsUsed >= limit) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        plan: keyRecord.plan,
        callsUsed: keyRecord.callsUsed,
        callsLimit: limit,
        message: `Upgrade to increase your limit`,
        upgrade: 'Contact stylesync.ai for premium plans'
      });
    }

    // Increment usage
    await ApiKey.findByIdAndUpdate(keyRecord._id, {
      $inc: { callsUsed: 1 },
      lastUsed: new Date()
    });

    // Attach to request
    req.apiKeyRecord = keyRecord;
    next();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};