const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

router.get('/', protect, getCustomers);
router.post('/', protect, addCustomer);
router.put('/:id', protect, updateCustomer);
router.delete('/:id', protect, deleteCustomer);

module.exports = router;