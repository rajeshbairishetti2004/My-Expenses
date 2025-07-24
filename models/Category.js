const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    required: true,
    default: '#3b82f6'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique category names per user
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);