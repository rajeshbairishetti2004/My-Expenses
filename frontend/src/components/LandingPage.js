import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`landing-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="theme-toggle" onClick={toggleTheme}>
        <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
      </div>

      <div className="entry-container">
        <div className="logo animated">
          <i className="fas fa-wallet"></i>
        </div>
        
        <h1 className="fade-in delay-1">My Expenses</h1>
        <p className="tagline fade-in delay-2">Track. Manage. Save Smarter.</p>
        <p className="subtext fade-in delay-3">Get control over your personal finances in minutes.</p>
        
        <div className="fade-in delay-4">
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn secondary">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;