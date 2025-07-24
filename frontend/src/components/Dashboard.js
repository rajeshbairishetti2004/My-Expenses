import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Calendar from './Calendar';
import MajorExpenses from './MajorExpenses';
import BorrowLend from './BorrowLend';
import ExpenseStats from './ExpenseStats';
import CategoryModal from './CategoryModal';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="dashboard">
      <Header 
        currentDate={currentDate} 
        setCurrentDate={setCurrentDate}
        refreshTrigger={refreshTrigger}
      />
      
      <main className="dashboard-main">
        <MajorExpenses 
          currentDate={currentDate} 
          onUpdate={triggerRefresh}
        />
        
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Daily Expenses</h2>
            <div className="date-controls">
              <select 
                value={currentDate.getMonth()} 
                onChange={(e) => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(parseInt(e.target.value));
                  setCurrentDate(newDate);
                }}
              >
                {['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December']
                  .map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
              </select>
              <select 
                value={currentDate.getFullYear()} 
                onChange={(e) => {
                  const newDate = new Date(currentDate);
                  newDate.setFullYear(parseInt(e.target.value));
                  setCurrentDate(newDate);
                }}
              >
                {Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i)
                  .map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
              </select>
              <button 
                className="btn-secondary"
                onClick={() => setShowCategoryModal(true)}
              >
                <i className="fas fa-cogs"></i> Manage Categories
              </button>
            </div>
          </div>
          
          <Calendar 
            currentDate={currentDate} 
            onUpdate={triggerRefresh}
            refreshTrigger={refreshTrigger}
          />
        </div>

        <ExpenseStats 
          currentDate={currentDate}
          refreshTrigger={refreshTrigger}
        />

        <BorrowLend onUpdate={triggerRefresh} />
      </main>

      {showCategoryModal && (
        <CategoryModal 
          onClose={() => setShowCategoryModal(false)}
          onUpdate={triggerRefresh}
        />
      )}
    </div>
  );
};

export default Dashboard;