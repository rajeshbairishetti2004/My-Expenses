import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Header.css';

const Header = ({ currentDate, setCurrentDate, refreshTrigger }) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    salary: 0,
    spent: 0,
    remaining: 0,
    savings: 0
  });
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryInput, setSalaryInput] = useState('');

  useEffect(() => {
    fetchStats();
  }, [currentDate, refreshTrigger]);

  const fetchStats = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      // Fetch salary for current month
      const salaryResponse = await api.get(`/api/salary?year=${year}&month=${month}`);
      const currentSalary = salaryResponse.data.length > 0 ? salaryResponse.data[0].amount : 0;
      
      // Fetch expenses for current month
      const expensesResponse = await api.get(`/api/expenses?year=${year}&month=${month}`);
      const expenses = expensesResponse.data;
      
      // Fetch major expenses for current month
      const majorExpensesResponse = await api.get('/api/major-expenses');
      const majorExpenses = majorExpensesResponse.data;
      
      let totalSpent = 0;
      
      // Calculate daily expenses
      expenses.forEach(expense => {
        totalSpent += expense.amount;
      });
      
      // Calculate paid major expenses
      majorExpenses.forEach(expense => {
        const paidRecord = expense.paidRecords.find(
          record => record.year === year && record.month === (month - 1)
        );
        if (paidRecord && paidRecord.paid) {
          totalSpent += expense.amount;
        }
      });
      
      const remaining = currentSalary - totalSpent;
      
      // Calculate total savings (simplified for now)
      const allSalariesResponse = await api.get('/api/salary');
      const allSalaries = allSalariesResponse.data;
      let totalSavings = 0;
      
      // This is a simplified calculation - in a real app, you'd calculate this more accurately
      totalSavings = remaining > 0 ? remaining : 0;
      
      setStats({
        salary: currentSalary,
        spent: totalSpent,
        remaining: remaining,
        savings: totalSavings
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSetSalary = async (e) => {
    e.preventDefault();
    try {
      const amount = parseFloat(salaryInput);
      if (amount >= 0) {
        await api.post('/api/salary', {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          amount
        });
        setShowSalaryModal(false);
        setSalaryInput('');
        fetchStats();
      }
    } catch (error) {
      console.error('Error setting salary:', error);
    }
  };

  const formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`;

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <i className="fas fa-wallet header-icon"></i>
            <h1>My Expenses</h1>
          </div>
          
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Salary</span>
              <span className="stat-value salary">{formatCurrency(stats.salary)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Spent</span>
              <span className="stat-value spent">{formatCurrency(stats.spent)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Remaining</span>
              <span className="stat-value remaining">{formatCurrency(stats.remaining)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Savings</span>
              <span className="stat-value savings">{formatCurrency(stats.savings)}</span>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn-secondary"
              onClick={() => {
                setSalaryInput(stats.salary || '');
                setShowSalaryModal(true);
              }}
            >
              <i className="fas fa-edit"></i> Set Salary
            </button>
            <div className="user-menu">
              <span>Welcome, {user?.username}</span>
              <button className="btn-danger" onClick={logout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {showSalaryModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Set Monthly Salary</h3>
              <button className="close-btn" onClick={() => setShowSalaryModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSetSalary}>
              <div className="form-group">
                <label>Monthly Salary</label>
                <input
                  type="number"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  placeholder="Enter monthly salary"
                  min="0"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowSalaryModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;