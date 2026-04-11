const Customer = require('../models/Customer');

// GET all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user._id });
    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADD new customer
exports.addCustomer = async (req, res) => {
  try {
    const { customerName, phone, email, totalSpent, lastPurchaseDate } = req.body;

    const customer = await Customer.create({
      userId: req.user._id,
      customerName,
      phone,
      email,
      totalSpent,
      lastPurchaseDate
    });

    res.status(201).json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE customer
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};