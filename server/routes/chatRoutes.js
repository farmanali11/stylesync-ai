const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getChatHistory,
  generateWhatsAppMessages,
  generateRestockAlerts,
  generateEidForecast,
  generateProfitReport,
  generateWhatsAppHub,
  generateDailyBriefing,
  generateHealthScore,
  generateGhostInventory,
  detectAnomalies
} = require('../controllers/chatController');

router.post('/', protect, sendMessage);
router.get('/history', protect, getChatHistory);
router.get('/whatsapp', protect, generateWhatsAppMessages);
router.get('/restock', protect, generateRestockAlerts);
router.get('/eid-forecast', protect, generateEidForecast);
router.get('/profit', protect, generateProfitReport);
router.get('/whatsapp-hub', protect, generateWhatsAppHub);
router.get('/briefing', protect, generateDailyBriefing);
router.get('/health-score', protect, generateHealthScore);
router.get('/ghost-inventory', protect, generateGhostInventory);
router.get('/anomalies', protect, detectAnomalies);

module.exports = router;