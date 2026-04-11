const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTransactions,
  addTransaction
} = require('../controllers/transactionController');

router.get('/', protect, getTransactions);
router.post('/', protect, addTransaction);

module.exports = router;