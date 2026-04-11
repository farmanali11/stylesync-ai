const express = require('express');
const router = express.Router();
const { validateApiKey } = require('../middleware/apiKeyMiddleware');
const {
  analyzeBusinessData,
  quickHealthCheck
} = require('../controllers/publicApiController');

// All public API routes require API key
router.post('/analyze', validateApiKey, analyzeBusinessData);
router.post('/health-check', validateApiKey, quickHealthCheck);

module.exports = router;