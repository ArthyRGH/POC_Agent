document.addEventListener('DOMContentLoaded', function() {
  // Toggle sidebar
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  
  if (menuToggle && sidebar && mainContent) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded');
    });
  }
  
  // Handle mobile sidebar
  const handleMobileView = () => {
    if (window.innerWidth <= 576) {
      sidebar && sidebar.classList.add('collapsed');
      mainContent && mainContent.classList.add('expanded');
    }
  };
  
  // Call initially and on resize
  handleMobileView();
  window.addEventListener('resize', handleMobileView);
  
  // Time filter for charts
  const timeFilters = document.querySelectorAll('.time-filter');
  if (timeFilters.length) {
    timeFilters.forEach(filter => {
      filter.addEventListener('click', function() {
        // Remove active class from all filters
        timeFilters.forEach(f => f.classList.remove('active'));
        // Add active class to clicked filter
        this.classList.add('active');
        
        // Update chart data based on filter
        updateChartData(this.dataset.period);
      });
    });
  }
  
  // Sample chart data
  const chartData = {
    week: [40, 65, 75, 50, 60, 80, 70],
    month: [55, 40, 65, 70, 60, 55, 70, 65, 75, 60, 65, 70, 75, 80, 70, 60, 65, 70, 75, 65, 60, 70, 75, 80, 70, 65, 60, 55],
    year: [50, 55, 60, 65, 70, 65, 60, 65, 70, 75, 80, 75]
  };
  
  // Function to update chart
  function updateChartData(period) {
    const chartContainer = document.querySelector('.chart-bars');
    if (!chartContainer) return;
    
    const data = chartData[period] || chartData.week;
    const maxValue = Math.max(...data);
    
    // Clear existing bars
    chartContainer.innerHTML = '';
    
    // Create new bars
    data.forEach((value, index) => {
      const height = (value / maxValue) * 100;
      const label = period === 'week' ? 
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] :
        period === 'month' ? 
          `${index + 1}` :
          ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index];
      
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      
      const point = document.createElement('div');
      point.className = 'chart-point';
      point.style.height = `${height}%`;
      point.dataset.value = value;
      
      const barLabel = document.createElement('div');
      barLabel.className = 'bar-label';
      barLabel.textContent = label;
      
      bar.appendChild(point);
      bar.appendChild(barLabel);
      chartContainer.appendChild(bar);
    });
    
    // Update summary
    updateSummary(period, data);
  }
  
  // Function to update summary
  function updateSummary(period, data) {
    const totalElement = document.getElementById('summaryTotal');
    const averageElement = document.getElementById('summaryAverage');
    const changeElement = document.getElementById('summaryChange');
    
    if (!totalElement || !averageElement || !changeElement) return;
    
    const total = data.reduce((sum, value) => sum + value, 0);
    const average = (total / data.length).toFixed(1);
    const change = ((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(1);
    
    totalElement.textContent = `$${total.toLocaleString()}`;
    averageElement.textContent = `$${average}`;
    
    changeElement.textContent = `${change}%`;
    if (change >= 0) {
      changeElement.classList.remove('negative-change');
      changeElement.classList.add('positive-change');
    } else {
      changeElement.classList.remove('positive-change');
      changeElement.classList.add('negative-change');
    }
  }
  
  // Initialize chart with weekly data
  const weekFilter = document.querySelector('.time-filter[data-period="week"]');
  if (weekFilter) {
    weekFilter.classList.add('active');
    updateChartData('week');
  }
  
  // Connect/Disconnect integration buttons
  const connectButtons = document.querySelectorAll('.connect-button');
  const disconnectButtons = document.querySelectorAll('.disconnect-button');
  
  connectButtons.forEach(button => {
    button.addEventListener('click', function() {
      const card = this.closest('.integration-card');
      if (card) {
        card.classList.remove('disconnected');
        card.classList.add('connected');
        
        const status = card.querySelector('.integration-status');
        if (status) {
          status.textContent = 'Connected';
          status.classList.remove('status-disconnected');
          status.classList.add('status-connected');
        }
        
        this.style.display = 'none';
        const disconnectBtn = card.querySelector('.disconnect-button');
        if (disconnectBtn) {
          disconnectBtn.style.display = 'block';
        }
      }
    });
  });
  
  disconnectButtons.forEach(button => {
    button.addEventListener('click', function() {
      const card = this.closest('.integration-card');
      if (card) {
        card.classList.remove('connected');
        card.classList.add('disconnected');
        
        const status = card.querySelector('.integration-status');
        if (status) {
          status.textContent = 'Disconnected';
          status.classList.remove('status-connected');
          status.classList.add('status-disconnected');
        }
        
        this.style.display = 'none';
        const connectBtn = card.querySelector('.connect-button');
        if (connectBtn) {
          connectBtn.style.display = 'block';
        }
      }
    });
  });
  
  // Notification click handler
  const notificationIcon = document.querySelector('.notification-icon');
  if (notificationIcon) {
    notificationIcon.addEventListener('click', function() {
      alert('Notifications feature coming soon!');
    });
  }
  
  // User profile click handler
  const userProfile = document.querySelector('.user-profile');
  if (userProfile) {
    userProfile.addEventListener('click', function() {
      alert('User profile settings coming soon!');
    });
  }
  
  // Apply recommendation button handler
  const applyButtons = document.querySelectorAll('.apply-button');
  applyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const card = this.closest('.recommendation-card');
      if (card) {
        const title = card.querySelector('.recommendation-title');
        alert(`Applying recommendation: ${title ? title.textContent : 'Selected recommendation'}`);
        card.style.opacity = '0.5';
        this.textContent = 'Applied';
        this.disabled = true;
      }
    });
  });
  
  // Search functionality
  const searchInput = document.querySelector('.search-input');
  const searchButton = document.querySelector('.search-button');
  
  if (searchInput && searchButton) {
    searchButton.addEventListener('click', function() {
      performSearch(searchInput.value);
    });
    
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch(this.value);
      }
    });
  }
  
  function performSearch(query) {
    if (query.trim() === '') {
      alert('Please enter a search term');
      return;
    }
    
    alert(`Searching for: ${query}\nSearch results will be implemented in the next version.`);
  }
}); 