document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle functionality
    const sidebarToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-visible');
        });
    }
    
    // Time filter functionality
    const timeFilters = document.querySelectorAll('.time-filter');
    
    timeFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remove active class from all filters
            timeFilters.forEach(f => f.classList.remove('active'));
            
            // Add active class to clicked filter
            this.classList.add('active');
            
            // Update chart data based on selected time period
            updateChartData(this.dataset.period);
        });
    });
    
    // Initialize chart with default data
    initializeChart();
    
    // Simulate loading data for the chart
    function initializeChart() {
        // This is where you would initialize your chart library
        // For demonstration, we'll just set up dummy data
        const chartBars = document.querySelector('.chart-bars');
        
        if (chartBars) {
            // Clear existing bars
            chartBars.innerHTML = '';
            
            // Generate random data for our chart
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const currentMonth = new Date().getMonth();
            
            // Use last 6 months
            const labels = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
            
            // Generate random data
            const data = labels.map(() => Math.floor(Math.random() * 80) + 20);
            
            // Create bars
            labels.forEach((month, index) => {
                const barHeight = data[index];
                const bar = document.createElement('div');
                bar.className = 'chart-bar';
                bar.style.height = `${barHeight}%`;
                
                const label = document.createElement('div');
                label.className = 'chart-bar-label';
                label.textContent = month;
                
                const value = document.createElement('div');
                value.className = 'chart-bar-value';
                value.textContent = `$${(barHeight * 1000).toLocaleString()}`;
                
                bar.appendChild(label);
                bar.appendChild(value);
                chartBars.appendChild(bar);
            });
            
            // Update summary data
            updateSummaryData(data);
        }
    }
    
    function updateChartData(period) {
        // In a real app, this would fetch data based on the selected time period
        // For demonstration, we'll just generate new random data
        const chartBars = document.querySelector('.chart-bars');
        
        if (chartBars) {
            // Clear existing bars
            chartBars.innerHTML = '';
            
            let labels = [];
            let barCount = 6;
            
            // Set up labels based on selected period
            switch(period) {
                case 'week':
                    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    barCount = 7;
                    break;
                case 'month':
                    // Generate last 30 days
                    labels = Array.from({length: 30}, (_, i) => i + 1);
                    barCount = 30;
                    break;
                case 'quarter':
                    // Generate last 3 months
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const currentMonth = new Date().getMonth();
                    labels = months.slice(Math.max(0, currentMonth - 2), currentMonth + 1);
                    barCount = 3;
                    break;
                case 'year':
                default:
                    // Use months
                    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    barCount = 12;
                    break;
            }
            
            // Ensure we don't have too many bars
            if (period === 'month') {
                // For month view, group days into weeks
                const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
                labels = weekLabels.slice(0, Math.ceil(labels.length / 7));
                barCount = labels.length;
            }
            
            // Generate random data
            const data = Array.from({length: barCount}, () => Math.floor(Math.random() * 80) + 20);
            
            // Create bars
            for (let i = 0; i < barCount; i++) {
                const label = labels[i % labels.length];
                const barHeight = data[i];
                
                const bar = document.createElement('div');
                bar.className = 'chart-bar';
                bar.style.height = `${barHeight}%`;
                
                const labelElement = document.createElement('div');
                labelElement.className = 'chart-bar-label';
                labelElement.textContent = label;
                
                const value = document.createElement('div');
                value.className = 'chart-bar-value';
                value.textContent = `$${(barHeight * 1000).toLocaleString()}`;
                
                bar.appendChild(labelElement);
                bar.appendChild(value);
                chartBars.appendChild(bar);
            }
            
            // Update summary data
            updateSummaryData(data);
        }
    }
    
    function updateSummaryData(data) {
        // Calculate summary data
        const total = data.reduce((sum, value) => sum + value, 0);
        const average = total / data.length;
        const max = Math.max(...data);
        
        // Update DOM elements
        const totalElement = document.querySelector('.summary-value[data-summary="total"]');
        const averageElement = document.querySelector('.summary-value[data-summary="average"]');
        const peakElement = document.querySelector('.summary-value[data-summary="peak"]');
        
        if (totalElement) {
            totalElement.textContent = `$${(total * 1000).toLocaleString()}`;
        }
        
        if (averageElement) {
            averageElement.textContent = `$${Math.round(average * 1000).toLocaleString()}`;
        }
        
        if (peakElement) {
            peakElement.textContent = `$${(max * 1000).toLocaleString()}`;
        }
    }
    
    // Toggle recommendation details
    const recommendationCards = document.querySelectorAll('.recommendation-card');
    
    recommendationCards.forEach(card => {
        const description = card.querySelector('.recommendation-description');
        
        if (description) {
            // Store original text
            const originalText = description.textContent;
            const fullText = originalText;
            
            // Truncate if longer than 100 characters
            if (originalText.length > 100) {
                description.textContent = originalText.substring(0, 100) + '...';
                
                card.addEventListener('click', function() {
                    const currentText = description.textContent;
                    
                    if (currentText.includes('...')) {
                        description.textContent = fullText;
                    } else {
                        description.textContent = originalText.substring(0, 100) + '...';
                    }
                });
            }
        }
    });
    
    // Integration connect/disconnect buttons
    const connectButtons = document.querySelectorAll('.connect-button');
    const disconnectButtons = document.querySelectorAll('.disconnect-button');
    
    connectButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const card = this.closest('.integration-card');
            const statusElement = card.querySelector('.integration-status');
            
            this.style.display = 'none';
            card.querySelector('.disconnect-button').style.display = 'block';
            
            if (statusElement) {
                statusElement.textContent = 'Connected';
                statusElement.classList.remove('status-disconnected');
                statusElement.classList.add('status-connected');
            }
        });
    });
    
    disconnectButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const card = this.closest('.integration-card');
            const statusElement = card.querySelector('.integration-status');
            
            this.style.display = 'none';
            card.querySelector('.connect-button').style.display = 'block';
            
            if (statusElement) {
                statusElement.textContent = 'Disconnected';
                statusElement.classList.remove('status-connected');
                statusElement.classList.add('status-disconnected');
            }
        });
    });
    
    // Show notification dropdown
    const notificationIcon = document.querySelector('.notification-icon');
    
    if (notificationIcon) {
        notificationIcon.addEventListener('click', function() {
            // Toggle notification dropdown (would be implemented in real app)
            alert('Notifications would open here');
        });
    }
    
    // Apply button click handler
    const applyButtons = document.querySelectorAll('.apply-button');
    
    applyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // In a real app, this would apply the recommendation
            const recommendationTitle = this.closest('.recommendation-card').querySelector('.recommendation-title').textContent;
            alert(`Applied recommendation: ${recommendationTitle}`);
        });
    });
}); 