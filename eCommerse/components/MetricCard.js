// No imports in browser-based React
// import React from 'react';
// import './MetricCard.css';

function MetricCard({ title, value, change, period, icon, isAlert, isNegative }) {
  const renderIcon = () => {
    switch (icon) {
      case 'dollar':
        return (
          <div className="metric-icon money">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
        );
      case 'order':
        return (
          <div className="metric-icon order">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
        );
      case 'inventory':
        return (
          <div className="metric-icon inventory">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="metric-icon message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        );
      case 'customer':
        return (
          <div className="metric-icon customer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`metric-card ${isAlert ? 'alert' : ''}`}>
      <div className="metric-content">
        <div className="metric-header">
          <div className="metric-title">{title}</div>
          {renderIcon()}
        </div>
        
        <div className="metric-value">{value}</div>
        
        {change && (
          <div className="metric-change">
            <span className={`change-indicator ${isNegative ? 'negative' : 'positive'}`}>{change}</span>
            <span className="period">{period}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// No export default in browser-based React
// export default MetricCard; 