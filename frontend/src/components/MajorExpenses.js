import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const MajorExpenses = ({ currentDate, onUpdate }) => {
  const [majorExpenses, setMajorExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: '' });

  useEffect(() => {
    fetchMajorExpenses();
  }, []);

  const fetchMajorExpenses = async () => {
    try {
      const response = await api.get('/api/major-expenses');
      setMajorExpenses(response.data);
    } catch (error) {
      console.error('Error fetching major expenses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/major-expenses', {
        name: formData.name,
        amount: parseFloat(formData.amount)
      });
      setFormData({ name: '', amount: '' });
      setShowModal(false);
      fetchMajorExpenses();
      onUpdate();
    } catch (error) {
      console.error('Error creating major expense:', error);
    }
  };

  const handleTogglePayment = async (expenseId, paid) => {
    try {
      await api.put(`/api/major-expenses/${expenseId}/payment`, {
        year: currentDate.getFullYear(),
        month: currentDate.getMonth(),
        paid: paid
      });
      fetchMajorExpenses();
      onUpdate();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/api/major-expenses/${expenseId}`);
        fetchMajorExpenses();
        onUpdate();
      } catch (error) {
        console.error('Error deleting major expense:', error);
      }
    }
  };

  const isExpensePaid = (expense) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const record = expense.paidRecords.find(
      r => r.year === year && r.month === month
    );
    return record ? record.paid : false;
  };

  const formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`;

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Common Expenses</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus"></i> Add Common Expense
        </button>
      </div>
      
      <div className="major-expenses-list">
        {majorExpenses.length === 0 ? (
          <p className="text-muted">No common expenses added. Add items like Rent, Bills, etc.</p>
        ) : (
          majorExpenses.map(expense => {
            const isPaid = isExpensePaid(expense);
            return (
              <div key={expense._id} className="major-expense-item">
                <div className="expense-info">
                  <span className="expense-name">{expense.name}</span>
                  <span className="expense-amount">({formatCurrency(expense.amount)})</span>
                </div>
                <div className="expense-actions">
                  <span className={`payment-status ${isPaid ? 'paid' : 'unpaid'}`}>
                    {isPaid ? 'Paid' : 'Not Paid'}
                  </span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={isPaid}
                      onChange={(e) => handleTogglePayment(expense._id, e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <button 
                    className="btn-danger"
                    onClick={() => handleDelete(expense._id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Common Expense</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Expense Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Rent, Electricity Bill"
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
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
    </div>
  );
};

export default MajorExpenses;