const Inventory = require('../models/Inventory');

// GET all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Inventory.find({ userId: req.user._id });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADD new product
exports.addProduct = async (req, res) => {
  try {
    const { productName, category, quantity, price } = req.body;

    const product = await Inventory.create({
      userId: req.user._id,
      productName,
      category,
      quantity,
      price
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Inventory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Inventory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};