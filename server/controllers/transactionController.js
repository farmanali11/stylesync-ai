const Transaction = require('../models/Transaction');
const Inventory = require('../models/Inventory');
const Customer = require('../models/Customer');

// GET all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction
      .find({ userId: req.user._id })
      .populate('customerId', 'customerName phone')
      .populate('productId', 'productName category')
      .sort({ date: -1 });

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADD new transaction
exports.addTransaction = async (req, res) => {
  try {
    const { customerId, productId, quantity, amount } = req.body;

    // Verify product belongs to this user
    const product = await Inventory.findOne({
      _id: productId,
      userId: req.user._id
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Verify customer belongs to this user
    const customer = await Customer.findOne({
      _id: customerId,
      userId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check stock availability
    if (product.quantity < quantity) {
      return res.status(400).json({ 
        error: `Insufficient stock. Available: ${product.quantity}` 
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      customerId,
      productId,
      productName: product.productName,
      quantity,
      amount
    });

    // Deduct stock from inventory
    await Inventory.findByIdAndUpdate(productId, {
      $inc: { quantity: -quantity }
    });

    // Update customer total spent
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalSpent: amount },
      lastPurchaseDate: Date.now()
    });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};