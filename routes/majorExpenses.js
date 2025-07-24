const express = require('express');
const MajorExpense = require('../models/MajorExpense');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all major expenses for a user
router.get('/', auth, async (req, res) => {
  try {
    const majorExpenses = await MajorExpense.find({ userId: req.user._id });
    res.json(majorExpenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new major expense
router.post('/', auth, async (req, res) => {
  try {
    const { name, amount } = req.body;
    
    const majorExpense = new MajorExpense({
      userId: req.user._id,
      name,
      amount
    });
    
    await majorExpense.save();
    res.status(201).json(majorExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update major expense payment status
router.put('/:id/payment', auth, async (req, res) => {
  try {
    const { year, month, paid } = req.body;
    
    const majorExpense = await MajorExpense.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!majorExpense) {
      return res.status(404).json({ message: 'Major expense not found' });
    }
    
    // Find existing record or create new one
    const existingRecord = majorExpense.paidRecords.find(
      record => record.year === year && record.month === month
    );
    
    if (existingRecord) {
      existingRecord.paid = paid;
      existingRecord.paidDate = paid ? new Date() : null;
    } else {
      majorExpense.paidRecords.push({
        year,
        month,
        paid,
        paidDate: paid ? new Date() : null
      });
    }
    
    await majorExpense.save();
    res.json(majorExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete major expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const majorExpense = await MajorExpense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!majorExpense) {
      return res.status(404).json({ message: 'Major expense not found' });
    }
    
    res.json({ message: 'Major expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;