// UI Components for Dashboard

// Header Component
function Header() {
  const header = document.createElement('header');
  header.className = 'app-header';
  
  header.innerHTML = `
    <div class="header-left">
      <button id="toggle-menu" class="menu-toggle">
        <span class="menu-icon">☰</span>
      </button>
      <div class="search-container">
        <input type="text" class="search-input" placeholder="Search..." />
        <button class="search-button">🔍</button>
      </div>
    </div>
    <div class="header-right">
      <div class="notification-icon">
        <span class="icon">🔔</span>
        <span class="notification-badge">3</span>
      </div>
      <div class="user-profile">
        <div class="avatar">JD</div>
        <div class="user-info">
          <div class="user-name">John Doe</div>
          <div class="user-role">Admin</div>
        </div>
      </div>
    </div>
  `;
  
  return header;
}

// Metric Card Component
function MetricCard({ title, value, change, period, isPositive, iconType, isAlert }) {
  const card = document.createElement('div');
  card.className = 'metric-card';
  if (isAlert) {
    card.classList.add('alert');
  }
  
  // Determine icon based on type
  let icon = '💰'; // Default
  switch (iconType) {
    case 'money':
      icon = '💰';
      break;
    case 'order':
      icon = '📦';
      break;
    case 'inventory':
      icon = '🏭';
      break;
    case 'message':
      icon = '💬';
      break;
    default:
      icon = '📊';
  }
  
  // Determine change indicator
  const changeClass = isPositive ? 'positive-change' : 'negative-change';
  
  card.innerHTML = `
    <div class="metric-icon">${icon}</div>
    <div class="metric-content">
      <div class="metric-title">${title}</div>
      <div class="metric-value">${value}</div>
      <div class="metric-change ${changeClass}">
        ${change} <span class="period">${period}</span>
      </div>
    </div>
  `;
  
  return card;
}

// Recommendation Card Component
function RecommendationCard({ title, description, impact, agent }) {
  const card = document.createElement('div');
  card.className = 'recommendation-card';
  
  // Determine impact class
  let impactClass = 'impact-medium';
  let impactIcon = '⚠️';
  
  switch (impact.toLowerCase()) {
    case 'high':
      impactClass = 'impact-high';
      impactIcon = '🔴';
      break;
    case 'medium':
      impactClass = 'impact-medium';
      impactIcon = '🟠';
      break;
    case 'low':
      impactClass = 'impact-low';
      impactIcon = '🟢';
      break;
  }
  
  card.innerHTML = `
    <div class="recommendation-header">
      <div class="recommendation-title">${title}</div>
      <div class="impact-indicator ${impactClass}">
        ${impactIcon} ${impact} impact
      </div>
    </div>
    <div class="recommendation-body">
      <p>${description}</p>
    </div>
    <div class="recommendation-footer">
      <div class="agent-info">
        <span class="agent-icon">🤖</span>
        <span class="agent-name">${agent}</span>
      </div>
      <button class="apply-button">Apply</button>
    </div>
  `;
  
  return card;
}

// Revenue Chart Component
function RevenueChart() {
  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-container';
  
  const chartHeader = document.createElement('div');
  chartHeader.className = 'dashboard-section-header';
  chartHeader.innerHTML = `
    <h2 class="dashboard-section-title">Revenue Trend</h2>
    <div class="chart-time-filter">
      <button class="time-filter active">Week</button>
      <button class="time-filter">Month</button>
      <button class="time-filter">Year</button>
    </div>
  `;
  
  const chartBody = document.createElement('div');
  chartBody.className = 'chart-body';
  chartBody.innerHTML = `
    <div class="chart">
      <div class="chart-bars">
        <div class="chart-bar">
          <div class="chart-point" data-value="65"></div>
          <div class="bar-label">Mon</div>
        </div>
        <div class="chart-bar">
          <div class="chart-point" data-value="40"></div>
          <div class="bar-label">Tue</div>
        </div>
        <div class="chart-bar">
          <div class="chart-point" data-value="85"></div>
          <div class="bar-label">Wed</div>
        </div>
        <div class="chart-bar">
          <div class="chart-point" data-value="70"></div>
          <div class="bar-label">Thu</div>
        </div>
        <div class="chart-bar">
          <div class="chart-point" data-value="90"></div>
          <div class="bar-label">Fri</div>
        </div>
        <div class="chart-bar">
          <div class="chart-point" data-value="50"></div>
          <div class="bar-label">Sat</div>
        </div>
        <div class="chart-bar">
          <div class="chart-point" data-value="45"></div>
          <div class="bar-label">Sun</div>
        </div>
      </div>
    </div>
    <div class="chart-summary">
      <div class="summary-item">
        <div class="summary-value">$12,480</div>
        <div class="summary-label">This Week</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">+18.6%</div>
        <div class="summary-label">vs Last Week</div>
      </div>
    </div>
  `;
  
  chartContainer.appendChild(chartHeader);
  chartContainer.appendChild(chartBody);
  
  return chartContainer;
}

// Integration Card Component
function IntegrationCard({ platform, icon, connected }) {
  const card = document.createElement('div');
  card.className = 'integration-card';
  if (connected) {
    card.classList.add('connected');
  } else {
    card.classList.add('disconnected');
  }
  
  const statusText = connected ? 'Connected' : 'Connect';
  const statusClass = connected ? 'status-connected' : 'status-disconnected';
  const buttonClass = connected ? 'disconnect-button' : 'connect-button';
  
  card.innerHTML = `
    <div class="integration-icon">${icon}</div>
    <div class="integration-info">
      <div class="integration-name">${platform}</div>
      <div class="integration-status ${statusClass}">${statusText}</div>
    </div>
    <button class="${buttonClass}">${connected ? 'Manage' : 'Connect'}</button>
  `;
  
  return card;
} 