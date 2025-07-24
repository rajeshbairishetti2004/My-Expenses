const express = require('express');
const Salary = require('../models/Salary');
const auth = require('../middleware/auth');

const router = express.Router();

// Get salary records for a user
router.get('/', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const filter = { userId: req.user._id };
    
    if (year && month) {
      filter.year = parseInt(year);
      filter.month = parseInt(month);
    }
    
    const salaries = await Salary.find(filter).sort({ year: -1, month: -1 });
    res.json(salaries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Set salary for a specific month
router.post('/', auth, async (req, res) => {
  try {
    const { year, month, amount } = req.body;
    
    const salary = await Salary.findOneAndUpdate(
      { userId: req.user._id, year, month },
      { amount },
      { upsert: true, new: true }
    );
    
    res.json(salary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;