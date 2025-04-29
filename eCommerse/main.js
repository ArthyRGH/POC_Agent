/**
 * Main JavaScript for AnalyticsHub Dashboard
 * Initializes the application and handles data loading
 */

import { 
  fetchStatistics, 
  fetchRevenueData, 
  fetchRecommendations, 
  fetchIntegrations 
} from './dataService.js';

// DOM Elements
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarElement = document.querySelector('.sidebar');
const periodButtons = document.querySelectorAll('.period-btn');
const statsCards = document.querySelectorAll('.stat-card');
const chartContainer = document.getElementById('revenue-chart');
const recommendationsContainer = document.getElementById('recommendations-list');
const integrationsContainer = document.getElementById('integrations-grid');
const totalRevenueEl = document.getElementById('total-revenue');
const avgRevenueEl = document.getElementById('avg-revenue');
const peakRevenueEl = document.getElementById('peak-revenue');

// Current state
let currentPeriod = 'monthly';
let revenueChart = null;

// Initialize the dashboard
async function initDashboard() {
  // Initialize event listeners
  setupEventListeners();
  
  // Load all initial data
  await Promise.all([
    loadStatistics(),
    loadRevenueChart(currentPeriod),
    loadRecommendations(),
    loadIntegrations()
  ]);
  
  // Remove loading state
  document.body.classList.remove('loading');
}

// Set up event listeners
function setupEventListeners() {
  // Sidebar toggle
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
    });
  }
  
  // Period buttons for chart
  periodButtons.forEach(button => {
    button.addEventListener('click', () => {
      const period = button.dataset.period;
      periodButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentPeriod = period;
      loadRevenueChart(period);
    });
  });
}

// Load statistics section
async function loadStatistics() {
  try {
    const stats = await fetchStatistics();
    
    // Update stats cards with real data
    if (statsCards.length > 0) {
      updateStatCard(statsCards[0], stats.users.total, stats.users.change, stats.users.trend);
      updateStatCard(statsCards[1], stats.sales.total, stats.sales.change, stats.sales.trend);
      updateStatCard(statsCards[2], stats.pageViews.total, stats.pageViews.change, stats.pageViews.trend);
      updateStatCard(statsCards[3], stats.conversionRate.total, stats.conversionRate.change, stats.conversionRate.trend);
    }
  } catch (error) {
    console.error('Failed to load statistics:', error);
    showErrorMessage('statistics');
  }
}

// Update a single stat card with data
function updateStatCard(card, value, change, trend) {
  if (!card) return;
  
  const valueElement = card.querySelector('.stat-value');
  const changeElement = card.querySelector('.stat-change');
  
  if (valueElement) valueElement.textContent = value;
  
  if (changeElement) {
    changeElement.textContent = `${change > 0 ? '+' : ''}${change}%`;
    changeElement.className = 'stat-change';
    changeElement.classList.add(trend === 'up' ? 'positive' : 'negative');
    
    // Update icon
    const iconElement = changeElement.querySelector('i');
    if (iconElement) {
      iconElement.className = trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
    }
  }
}

// Load and render revenue chart
async function loadRevenueChart(period) {
  try {
    const data = await fetchRevenueData(period);
    
    if (!chartContainer) return;
    
    // Update summary information
    if (totalRevenueEl) totalRevenueEl.textContent = data.total;
    if (avgRevenueEl) avgRevenueEl.textContent = data.average;
    if (peakRevenueEl) peakRevenueEl.textContent = data.peak;
    
    // Create or update chart
    renderRevenueChart(data.labels, data.values);
  } catch (error) {
    console.error('Failed to load revenue chart:', error);
    showErrorMessage('chart');
  }
}

// Render the revenue chart with Chart.js
function renderRevenueChart(labels, values) {
  // Check if chart already exists
  if (revenueChart) {
    revenueChart.data.labels = labels;
    revenueChart.data.datasets[0].data = values;
    revenueChart.update();
    return;
  }
  
  // Create new chart if the container exists
  if (!chartContainer) return;
  
  // Create chart context
  const ctx = chartContainer.getContext('2d');
  
  // Define chart colors based on CSS variables
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary').trim() || '#4361ee';
  const secondaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary-light').trim() || '#4361ee33';
  
  // Create new chart
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Revenue',
        data: values,
        backgroundColor: secondaryColor,
        borderColor: primaryColor,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: primaryColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
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
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: 10,
          titleColor: '#fff',
          titleFont: {
            size: 14
          },
          bodyColor: '#fff',
          bodyFont: {
            size: 13
          },
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `$${context.parsed.y.toLocaleString()}`;
            }
          }
        }
      }
    }
  });
}

// Load recommendations section
async function loadRecommendations() {
  if (!recommendationsContainer) return;
  
  try {
    const recommendations = await fetchRecommendations();
    
    // Clear container
    recommendationsContainer.innerHTML = '';
    
    // Render each recommendation
    recommendations.forEach(rec => {
      const impactClass = rec.impact === 'high' ? 'high-impact' : 'medium-impact';
      
      const recElement = document.createElement('div');
      recElement.className = `recommendation ${impactClass}`;
      recElement.innerHTML = `
        <h4>${rec.title}</h4>
        <p>${rec.description}</p>
        <div class="recommendation-meta">
          <span class="impact-badge ${impactClass}">${rec.impact}</span>
          <span class="category-badge">${rec.category}</span>
        </div>
      `;
      
      recommendationsContainer.appendChild(recElement);
    });
  } catch (error) {
    console.error('Failed to load recommendations:', error);
    showErrorMessage('recommendations');
  }
}

// Load integrations section
async function loadIntegrations() {
  if (!integrationsContainer) return;
  
  try {
    const integrations = await fetchIntegrations();
    
    // Clear container
    integrationsContainer.innerHTML = '';
    
    // Render each integration
    integrations.forEach(integration => {
      const statusClass = integration.status === 'active' ? 'active' : 'inactive';
      
      const integrationElement = document.createElement('div');
      integrationElement.className = 'integration-card';
      integrationElement.innerHTML = `
        <div class="integration-icon">
          <i class="fas fa-${integration.icon}"></i>
        </div>
        <div class="integration-info">
          <h4>${integration.name}</h4>
          <div class="integration-meta">
            <span class="status ${statusClass}">${integration.status}</span>
            <span class="last-sync">${integration.lastSync}</span>
          </div>
        </div>
      `;
      
      integrationsContainer.appendChild(integrationElement);
    });
  } catch (error) {
    console.error('Failed to load integrations:', error);
    showErrorMessage('integrations');
  }
}

// Show error message for failed data loading
function showErrorMessage(section) {
  let container;
  
  switch (section) {
    case 'statistics':
      container = document.querySelector('.stats-row');
      break;
    case 'chart':
      container = document.querySelector('.chart-section');
      break;
    case 'recommendations':
      container = recommendationsContainer;
      break;
    case 'integrations':
      container = integrationsContainer;
      break;
    default:
      return;
  }
  
  if (!container) return;
  
  const errorMessage = document.createElement('div');
  errorMessage.className = 'error-message';
  errorMessage.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <p>Failed to load data. Please try again later.</p>
    <button class="retry-btn">Retry</button>
  `;
  
  // Add retry button functionality
  const retryButton = errorMessage.querySelector('.retry-btn');
  if (retryButton) {
    retryButton.addEventListener('click', () => {
      errorMessage.remove();
      switch (section) {
        case 'statistics':
          loadStatistics();
          break;
        case 'chart':
          loadRevenueChart(currentPeriod);
          break;
        case 'recommendations':
          loadRecommendations();
          break;
        case 'integrations':
          loadIntegrations();
          break;
      }
    });
  }
  
  container.appendChild(errorMessage);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard); 