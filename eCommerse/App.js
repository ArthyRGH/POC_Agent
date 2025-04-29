/**
 * app.js - Main application script for AnalyticsHub dashboard
 * Handles UI interactions, initializes charts, and loads data
 */

import dataService from './dataService.js';

// DOM elements
const dashboardElements = {
  // Sidebar elements
  sidebar: document.querySelector('.sidebar'),
  sidebarToggle: document.querySelector('.mobile-menu-toggle'),
  
  // Statistics cards
  statsCards: {
    users: document.querySelector('#total-users-value'),
    usersChange: document.querySelector('#total-users-change'),
    sales: document.querySelector('#total-sales-value'),
    salesChange: document.querySelector('#total-sales-change'),
    pageViews: document.querySelector('#page-views-value'),
    pageViewsChange: document.querySelector('#page-views-change'),
    conversionRate: document.querySelector('#conversion-rate-value'),
    conversionRateChange: document.querySelector('#conversion-rate-change')
  },
  
  // Revenue chart elements
  revenueChart: document.querySelector('#revenue-chart'),
  revenuePeriodButtons: document.querySelectorAll('.time-filter-btn'),
  revenueSummary: {
    total: document.querySelector('#revenue-total'),
    average: document.querySelector('#revenue-average'),
    peak: document.querySelector('#revenue-peak')
  },
  
  // Recommendations and integrations
  recommendationsList: document.querySelector('#recommendations-list'),
  integrationsList: document.querySelector('#integrations-list'),
  
  // Search
  searchInput: document.querySelector('#search-input'),
  searchResults: document.querySelector('#search-results')
};

// Chart instances
let revenueChartInstance = null;

/**
 * Initialize the dashboard
 */
async function initDashboard() {
  setupEventListeners();
  await loadDashboardData();
}

/**
 * Set up event listeners for interactive elements
 */
function setupEventListeners() {
  // Mobile menu toggle
  if (dashboardElements.sidebarToggle) {
    dashboardElements.sidebarToggle.addEventListener('click', () => {
      dashboardElements.sidebar.classList.toggle('sidebar-open');
    });
  }
  
  // Revenue period filter buttons
  dashboardElements.revenuePeriodButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      // Remove active class from all buttons
      dashboardElements.revenuePeriodButtons.forEach(btn => 
        btn.classList.remove('active'));
        
      // Add active class to clicked button
      e.target.classList.add('active');
      
      // Load revenue data for the selected period
      const period = e.target.dataset.period;
      await loadRevenueData(period);
    });
  });
  
  // Search functionality
  if (dashboardElements.searchInput) {
    dashboardElements.searchInput.addEventListener('input', debounce(async (e) => {
      const query = e.target.value.trim();
      await performSearch(query);
    }, 300));
  }
}

/**
 * Load all data for the dashboard
 */
async function loadDashboardData() {
  try {
    // Load statistics
    await loadStatistics();
    
    // Load revenue data with 'week' as default
    await loadRevenueData('week');
    
    // Load recommendations
    await loadRecommendations();
    
    // Load integrations
    await loadIntegrations();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Error loading dashboard data. Please try again.', 'error');
  }
}

/**
 * Load and display statistics
 */
async function loadStatistics() {
  try {
    const stats = await dataService.getStatistics();
    
    // Update statistics cards
    updateStatisticCard('users', stats.users);
    updateStatisticCard('sales', stats.sales);
    updateStatisticCard('pageViews', stats.pageViews);
    updateStatisticCard('conversionRate', stats.conversionRate);
  } catch (error) {
    console.error('Error loading statistics:', error);
    showNotification('Could not load statistics data', 'error');
  }
}

/**
 * Update a single statistic card with data
 * @param {string} cardName - The name of the card to update
 * @param {Object} data - The data for the card
 */
function updateStatisticCard(cardName, data) {
  const valueElement = dashboardElements.statsCards[cardName];
  const changeElement = dashboardElements.statsCards[cardName + 'Change'];
  
  if (valueElement) {
    // Format value based on the statistic type
    let formattedValue;
    if (cardName === 'conversionRate') {
      formattedValue = data.total.toFixed(1) + '%';
    } else if (cardName === 'sales') {
      formattedValue = formatCurrency(data.total);
    } else {
      formattedValue = formatNumber(data.total);
    }
    
    valueElement.textContent = formattedValue;
  }
  
  if (changeElement) {
    // Set change percentage and direction
    changeElement.textContent = `${data.change > 0 ? '+' : ''}${data.change}%`;
    
    // Add appropriate class for styling
    changeElement.classList.remove('positive-change', 'negative-change');
    changeElement.classList.add(data.change >= 0 ? 'positive-change' : 'negative-change');
  }
}

/**
 * Load and display revenue data for the given period
 * @param {string} period - Time period (week, month, quarter, year)
 */
async function loadRevenueData(period) {
  try {
    const revenueData = await dataService.getRevenue(period);
    
    // Update chart
    updateRevenueChart(revenueData.chartData);
    
    // Update summary
    updateRevenueSummary(revenueData.summary);
  } catch (error) {
    console.error(`Error loading ${period} revenue data:`, error);
    showNotification(`Could not load ${period} revenue data`, 'error');
  }
}

/**
 * Update or create the revenue chart
 * @param {Object} chartData - Data for the chart
 */
function updateRevenueChart(chartData) {
  const ctx = dashboardElements.revenueChart.getContext('2d');
  
  // Destroy previous chart instance if it exists
  if (revenueChartInstance) {
    revenueChartInstance.destroy();
  }
  
  // Create new chart
  revenueChartInstance = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0,0,0,0.05)'
          },
          ticks: {
            callback: function(value) {
              return '$' + (value >= 1000 ? value/1000 + 'k' : value);
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Revenue: ' + formatCurrency(context.parsed.y);
            }
          }
        }
      }
    }
  });
}

/**
 * Update the revenue summary section
 * @param {Object} summary - Revenue summary data
 */
function updateRevenueSummary(summary) {
  dashboardElements.revenueSummary.total.textContent = formatCurrency(summary.total);
  dashboardElements.revenueSummary.average.textContent = formatCurrency(summary.average);
  dashboardElements.revenueSummary.peak.textContent = formatCurrency(summary.peak);
}

/**
 * Load and display recommendations
 */
async function loadRecommendations() {
  try {
    const recommendations = await dataService.getRecommendations();
    
    // Clear current list
    dashboardElements.recommendationsList.innerHTML = '';
    
    // Add recommendations to the list
    recommendations.forEach(rec => {
      const recElement = document.createElement('div');
      recElement.className = 'recommendation-item';
      
      // Create impact badge
      const impactBadge = document.createElement('span');
      impactBadge.className = `impact-badge ${rec.impact}`;
      impactBadge.textContent = rec.impact;
      
      // Create recommendation content
      recElement.innerHTML = `
        <div class="recommendation-header">
          <h4>${rec.title}</h4>
          ${impactBadge.outerHTML}
        </div>
        <p class="recommendation-description">${rec.description}</p>
        <div class="recommendation-footer">
          <span class="recommendation-category">${rec.category}</span>
        </div>
      `;
      
      dashboardElements.recommendationsList.appendChild(recElement);
    });
  } catch (error) {
    console.error('Error loading recommendations:', error);
    showNotification('Could not load recommendations', 'error');
  }
}

/**
 * Load and display integrations
 */
async function loadIntegrations() {
  try {
    const integrations = await dataService.getIntegrations();
    
    // Clear current list
    dashboardElements.integrationsList.innerHTML = '';
    
    // Add integrations to the list
    integrations.forEach(integration => {
      const integrationElement = document.createElement('div');
      integrationElement.className = 'integration-item';
      
      const statusClass = integration.status === 'active' ? 'status-active' : 'status-inactive';
      
      integrationElement.innerHTML = `
        <div class="integration-icon">
          <i class="fas fa-${integration.icon}"></i>
        </div>
        <div class="integration-details">
          <h4>${integration.name}</h4>
          <div class="integration-status ${statusClass}">
            ${integration.status}
          </div>
          <div class="integration-last-sync">
            Last sync: ${formatDate(integration.lastSync)}
          </div>
        </div>
      `;
      
      dashboardElements.integrationsList.appendChild(integrationElement);
    });
  } catch (error) {
    console.error('Error loading integrations:', error);
    showNotification('Could not load integrations', 'error');
  }
}

/**
 * Perform search across dashboard data
 * @param {string} query - Search query
 */
async function performSearch(query) {
  // Clear results if query is empty
  if (!query) {
    dashboardElements.searchResults.innerHTML = '';
    dashboardElements.searchResults.classList.add('hidden');
    return;
  }
  
  try {
    const results = await dataService.search(query);
    
    // Show results container
    dashboardElements.searchResults.classList.remove('hidden');
    
    // Clear previous results
    dashboardElements.searchResults.innerHTML = '';
    
    // If no results found
    if (results.length === 0) {
      dashboardElements.searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
      return;
    }
    
    // Display results
    results.forEach(result => {
      const resultElement = document.createElement('div');
      resultElement.className = 'search-result-item';
      
      resultElement.innerHTML = `
        <div class="search-result-title">${result.title}</div>
        <div class="search-result-category">${result.category}</div>
      `;
      
      dashboardElements.searchResults.appendChild(resultElement);
    });
  } catch (error) {
    console.error('Error performing search:', error);
  }
}

/**
 * Show a notification message
 * @param {string} message - The message to show
 * @param {string} type - The type of notification (info, success, warning, error)
 */
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remove after timeout
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}

/**
 * Format a number with thousands separators
 * @param {number} value - The number to format
 * @returns {string} Formatted number
 */
function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format a currency value
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format a date string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
}

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize the dashboard when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initDashboard); 