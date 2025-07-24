import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Calendar.css';

const Calendar = ({ currentDate, onUpdate, refreshTrigger }) => {
  const [expenses, setExpenses] = useState({});
  const [categories, setCategories] = useState([]);
  const [editingCell, setEditingCell] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [currentDate, refreshTrigger]);

  const fetchExpenses = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get(`/api/expenses?year=${year}&month=${month}`);
      
      const expensesByDate = {};
      response.data.forEach(expense => {
        const date = new Date(expense.date).toISOString().split('T')[0];
        if (!expensesByDate[date]) {
          expensesByDate[date] = [];
        }
        expensesByDate[date].push(expense);
      });
      
      setExpenses(expensesByDate);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isToday = (year, month, day) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const handleCellClick = (dateStr) => {
    if (editingCell === dateStr) return;
    setEditingCell(dateStr);
  };

  const handleSaveExpenses = async (dateStr, expenseData) => {
    try {
      // Delete existing expenses for this date
      const existingExpenses = expenses[dateStr] || [];
      for (const expense of existingExpenses) {
        await api.delete(`/api/expenses/${expense._id}`);
      }
      
      // Add new expenses
      for (const item of expenseData) {
        if (item.category && item.amount > 0) {
          await api.post('/api/expenses', {
            date: dateStr,
            category: item.category,
            amount: item.amount
          });
        }
      }
      
      setEditingCell(null);
      fetchExpenses();
      onUpdate();
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const renderCalendarDay = (dateStr, day) => {
    const dayExpenses = expenses[dateStr] || [];
    const isEditing = editingCell === dateStr;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const isCurrentDay = isToday(year, month, day);
    
    if (isEditing) {
      return (
        <CalendarDayEditor
          dateStr={dateStr}
          day={day}
          categories={categories}
          initialExpenses={dayExpenses}
          onSave={handleSaveExpenses}
          onCancel={() => setEditingCell(null)}
        />
      );
    }
    
    return (
      <div
        className={`calendar-day ${isCurrentDay ? 'today' : ''}`}
        onClick={() => handleCellClick(dateStr)}
      >
        <div className="day-number">{day}</div>
        <div className="day-expenses">
          {dayExpenses.map((expense, index) => {
            const category = categories.find(cat => cat.name === expense.category);
            return (
              <div key={index} className="expense-item">
                <span 
                  className="category-color" 
                  style={{ backgroundColor: category?.color || '#64748b' }}
                ></span>
                <span className="category-name">{expense.category}</span>
                <span className="expense-amount">₹{expense.amount}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const calendarDays = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(year, month, day);
    calendarDays.push(
      <div key={day}>
        {renderCalendarDay(dateStr, day)}
      </div>
    );
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="day-header">{day}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {calendarDays}
      </div>
    </div>
  );
};

const CalendarDayEditor = ({ dateStr, day, categories, initialExpenses, onSave, onCancel }) => {
  const [expenseItems, setExpenseItems] = useState(
    initialExpenses.length > 0 
      ? initialExpenses.map(exp => ({ category: exp.category, amount: exp.amount }))
      : [{ category: '', amount: '' }]
  );

  const addExpenseItem = () => {
    setExpenseItems([...expenseItems, { category: '', amount: '' }]);
  };

  const updateExpenseItem = (index, field, value) => {
    const updated = [...expenseItems];
    updated[index][field] = value;
    setExpenseItems(updated);
  };

  const removeExpenseItem = (index) => {
    const updated = expenseItems.filter((_, i) => i !== index);
    setExpenseItems(updated);
  };

  const handleSave = () => {
    const validItems = expenseItems.filter(item => item.category && item.amount > 0);
    onSave(dateStr, validItems);
  };

  return (
    <div className="calendar-day editing">
      <div className="day-number">{day}</div>
      <div className="expense-editor">
        {expenseItems.map((item, index) => (
          <div key={index} className="expense-input-row">
            <select
              value={item.category}
              onChange={(e) => updateExpenseItem(index, 'category', e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={item.amount}
              onChange={(e) => updateExpenseItem(index, 'amount', parseFloat(e.target.value) || '')}
              placeholder="Amount"
              min="0"
            />
            {expenseItems.length > 1 && (
              <button onClick={() => removeExpenseItem(index)} className="remove-btn">
                <i className="fas fa-minus"></i>
              </button>
            )}
          </div>
        ))}
        <div className="editor-actions">
          <button onClick={addExpenseItem} className="add-btn">
            <i className="fas fa-plus"></i>
          </button>
          <button onClick={handleSave} className="save-btn">Save</button>
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;