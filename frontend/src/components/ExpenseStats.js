import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ExpenseStats = ({ currentDate, refreshTrigger }) => {
  const [categoryStats, setCategoryStats] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSavingsBreakdown, setShowSavingsBreakdown] = useState(false);

  useEffect(() => {
    fetchExpenseStats();
  }, [currentDate, refreshTrigger]);

  const fetchExpenseStats = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get(`/api/expenses/stats?year=${year}&month=${month}`);
      setCategoryStats(response.data);
    } catch (error) {
      console.error('Error fetching expense stats:', error);
    }
  };

  const formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowSavingsBreakdown(false);
  };

  const handleSavingsClick = () => {
    setShowSavingsBreakdown(true);
    setSelectedCategory(null);
  };

  return (
    <div className="dashboard-section">
      <h2>Expense Overview</h2>
      
      <div className="category-spending-grid">
        {categoryStats.length === 0 ? (
          <p className="text-muted">No expenses recorded for this month yet.</p>
        ) : (
          categoryStats.map(stat => (
            <div 
              key={stat._id} 
              className="category-card"
              onClick={() => handleCategoryClick(stat)}
            >
              <div className="category-header">
                <h4>{stat._id}</h4>
                <span className="category-amount">{formatCurrency(stat.total)}</span>
              </div>
              <div className="category-info">
                <span>{stat.count} transactions</span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedCategory && (
        <div className="category-details">
          <h3>{selectedCategory._id} Details</h3>
          <div className="category-transactions">
            {selectedCategory.transactions.map((transaction, index) => (
              <div key={index} className="transaction-row">
                <span>{formatDate(transaction.date)}</span>
                <span className="transaction-amount">{formatCurrency(transaction.amount)}</span>
              </div>
            ))}
          </div>
          <div className="category-total">
            Total: {formatCurrency(selectedCategory.total)}
          </div>
        </div>
      )}

      {showSavingsBreakdown && (
        <div className="savings-breakdown">
          <h3>Monthly Savings Breakdown</h3>
          <p className="text-muted">Savings breakdown feature coming soon!</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseStats;