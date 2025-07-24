const express = require('express');
const BorrowLend = require('../models/BorrowLend');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all borrow/lend records for a user
router.get('/', auth, async (req, res) => {
  try {
    const records = await BorrowLend.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new borrow/lend record
router.post('/', auth, async (req, res) => {
  try {
    const { type, personName, amount } = req.body;
    
    const record = new BorrowLend({
      userId: req.user._id,
      type,
      personName,
      amount
    });
    
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update borrow/lend status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const record = await BorrowLend.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 
        status,
        completedDate: status === 'completed' ? new Date() : null
      },
      { new: true }
    );
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete borrow/lend record
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await BorrowLend.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;