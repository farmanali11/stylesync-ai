const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userMessage: {
    type: String,
    required: true
  },
  aiMessage: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);