import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const BorrowLend = ({ onUpdate }) => {
  const [borrowedMoney, setBorrowedMoney] = useState([]);
  const [lentMoney, setLentMoney] = useState([]);
  const [showBorrowedForm, setShowBorrowedForm] = useState(false);
  const [showLentForm, setShowLentForm] = useState(false);
  const [borrowedForm, setBorrowedForm] = useState({ personName: '', amount: '' });
  const [lentForm, setLentForm] = useState({ personName: '', amount: '' });

  useEffect(() => {
    fetchBorrowLendData();
  }, []);

  const fetchBorrowLendData = async () => {
    try {
      const response = await api.get('/api/borrow-lend');
      const data = response.data;
      setBorrowedMoney(data.filter(item => item.type === 'borrowed'));
      setLentMoney(data.filter(item => item.type === 'lent'));
    } catch (error) {
      console.error('Error fetching borrow/lend data:', error);
    }
  };

  const handleBorrowedSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/borrow-lend', {
        type: 'borrowed',
        personName: borrowedForm.personName,
        amount: parseFloat(borrowedForm.amount)
      });
      setBorrowedForm({ personName: '', amount: '' });
      setShowBorrowedForm(false);
      fetchBorrowLendData();
      onUpdate();
    } catch (error) {
      console.error('Error creating borrowed record:', error);
    }
  };

  const handleLentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/borrow-lend', {
        type: 'lent',
        personName: lentForm.personName,
        amount: parseFloat(lentForm.amount)
      });
      setLentForm({ personName: '', amount: '' });
      setShowLentForm(false);
      fetchBorrowLendData();
      onUpdate();
    } catch (error) {
      console.error('Error creating lent record:', error);
    }
  };

  const handleStatusToggle = async (recordId, newStatus) => {
    try {
      await api.put(`/api/borrow-lend/${recordId}/status`, {
        status: newStatus
      });
      fetchBorrowLendData();
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/api/borrow-lend/${recordId}`);
        fetchBorrowLendData();
        onUpdate();
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`;

  return (
    <div className="borrow-lend-container">
      <div className="borrow-lend-section">
        <div className="section-header">
          <h3>Money Borrowed</h3>
          <button className="btn-primary" onClick={() => setShowBorrowedForm(true)}>
            <i className="fas fa-plus"></i> Add
          </button>
        </div>
        
        {showBorrowedForm && (
          <form className="borrow-lend-form" onSubmit={handleBorrowedSubmit}>
            <input
              type="text"
              placeholder="Person's Name"
              value={borrowedForm.personName}
              onChange={(e) => setBorrowedForm({ ...borrowedForm, personName: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={borrowedForm.amount}
              onChange={(e) => setBorrowedForm({ ...borrowedForm, amount: e.target.value })}
              min="0"
              step="0.01"
              required
            />
            <button type="submit" className="btn-success">Save</button>
            <button type="button" className="btn-secondary" onClick={() => setShowBorrowedForm(false)}>
              Cancel
            </button>
          </form>
        )}
        
        <div className="borrow-lend-list">
          {borrowedMoney.length === 0 ? (
            <p className="text-muted">No borrowed money records</p>
          ) : (
            borrowedMoney.map(record => (
              <div key={record._id} className="borrow-lend-item">
                <div className="borrow-lend-info">
                  <div className="name">{record.personName}</div>
                  <div className="amount">{formatCurrency(record.amount)}</div>
                </div>
                <div className="borrow-lend-actions">
                  <span className={`status-badge ${record.status}`}>
                    {record.status === 'completed' ? 'Paid' : 'Unpaid'}
                  </span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={record.status === 'completed'}
                      onChange={(e) => handleStatusToggle(
                        record._id, 
                        e.target.checked ? 'completed' : 'pending'
                      )}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <button 
                    className="btn-danger"
                    onClick={() => handleDelete(record._id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="borrow-lend-section">
        <div className="section-header">
          <h3>Money Lent</h3>
          <button className="btn-primary" onClick={() => setShowLentForm(true)}>
            <i className="fas fa-plus"></i> Add
          </button>
        </div>
        
        {showLentForm && (
          <form className="borrow-lend-form" onSubmit={handleLentSubmit}>
            <input
              type="text"
              placeholder="Person's Name"
              value={lentForm.personName}
              onChange={(e) => setLentForm({ ...lentForm, personName: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={lentForm.amount}
              onChange={(e) => setLentForm({ ...lentForm, amount: e.target.value })}
              min="0"
              step="0.01"
              required
            />
            <button type="submit" className="btn-success">Save</button>
            <button type="button" className="btn-secondary" onClick={() => setShowLentForm(false)}>
              Cancel
            </button>
          </form>
        )}
        
        <div className="borrow-lend-list">
          {lentMoney.length === 0 ? (
            <p className="text-muted">No lent money records</p>
          ) : (
            lentMoney.map(record => (
              <div key={record._id} className="borrow-lend-item">
                <div className="borrow-lend-info">
                  <div className="name">{record.personName}</div>
                  <div className="amount">{formatCurrency(record.amount)}</div>
                </div>
                <div className="borrow-lend-actions">
                  <span className={`status-badge ${record.status}`}>
                    {record.status === 'completed' ? 'Received' : 'Unreceived'}
                  </span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={record.status === 'completed'}
                      onChange={(e) => handleStatusToggle(
                        record._id, 
                        e.target.checked ? 'completed' : 'pending'
                      )}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <button 
                    className="btn-danger"
                    onClick={() => handleDelete(record._id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BorrowLend;