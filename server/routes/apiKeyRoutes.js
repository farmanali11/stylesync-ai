const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  generateApiKey,
  getMyApiKey,
  regenerateApiKey
} = require('../controllers/apiKeyController');

router.post('/generate', protect, generateApiKey);
router.get('/my-key', protect, getMyApiKey);
router.post('/regenerate', protect, regenerateApiKey);

module.exports = router;