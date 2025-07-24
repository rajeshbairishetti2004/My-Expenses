const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique salary record per user per month
salarySchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Salary', salarySchema);