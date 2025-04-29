/**
 * dataService.js - Service for handling data operations in the AnalyticsHub dashboard
 * This module serves as a central point for fetching data and processing responses 
 */

class DataService {
  constructor() {
    // Base API URL - would be replaced with actual API endpoint in production
    this.baseUrl = 'https://api.analyticshub.example/v1';
    
    // Mock data for development
    this.mockData = {
      statistics: {
        users: { total: 8724, change: 12.5 },
        sales: { total: 574899, change: 8.2 },
        pageViews: { total: 259843, change: -3.1 },
        conversionRate: { total: 3.6, change: 1.8 }
      },
      revenue: {
        week: this._generateRevenueData(7),
        month: this._generateRevenueData(30),
        quarter: this._generateRevenueData(90),
        year: this._generateRevenueData(12, true)
      },
      recommendations: [
        {
          id: 1,
          title: 'Increase ad budget for campaign XYZ',
          category: 'Advertising',
          impact: 'high',
          description: 'Based on current ROAS of 320%, we recommend increasing budget by 25%.'
        },
        {
          id: 2,
          title: 'Optimize product pricing',
          category: 'Pricing',
          impact: 'medium',
          description: 'A/B testing suggests a 5% price increase would not affect conversion rates.'
        },
        {
          id: 3,
          title: 'Schedule social posts during peak hours',
          category: 'Social Media',
          impact: 'low',
          description: 'Engagement increases by 34% when posting between 7-9 PM.'
        }
      ],
      integrations: [
        {
          id: 1,
          name: 'Google Analytics',
          status: 'active',
          lastSync: '2023-05-15T14:23:10Z',
          icon: 'chart-pie'
        },
        {
          id: 2,
          name: 'Shopify',
          status: 'active',
          lastSync: '2023-05-15T16:15:22Z',
          icon: 'shopping-cart'
        },
        {
          id: 3,
          name: 'Mailchimp',
          status: 'inactive',
          lastSync: '2023-05-10T09:45:32Z',
          icon: 'envelope'
        }
      ],
      notifications: [
        {
          id: 1,
          message: 'Traffic spike detected on landing page',
          timestamp: '2023-05-15T18:23:19Z',
          type: 'alert'
        },
        {
          id: 2,
          message: 'Weekly report available for download',
          timestamp: '2023-05-15T08:00:00Z',
          type: 'info'
        },
        {
          id: 3,
          message: 'New integration available: TikTok Analytics',
          timestamp: '2023-05-14T12:32:45Z',
          type: 'info'
        }
      ]
    };
  }

  /**
   * Helper method to generate random revenue data for charts
   * @param {number} points - Number of data points to generate
   * @param {boolean} isYearly - If true, generates yearly data by month
   * @returns {Object} - Formatted data for charts
   */
  _generateRevenueData(points, isYearly = false) {
    const data = {
      labels: [],
      datasets: []
    };

    const values = [];
    let totalRevenue = 0;
    let average = 0;
    let peak = 0;

    if (isYearly) {
      // Generate monthly data for a year
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data.labels = months;

      for (let i = 0; i < 12; i++) {
        const value = Math.floor(Math.random() * 50000) + 25000;
        values.push(value);
        totalRevenue += value;
        peak = Math.max(peak, value);
      }
    } else {
      // Generate daily data
      for (let i = 0; i < points; i++) {
        if (points === 7) {
          // Week - use days
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          data.labels = days;
        } else {
          // Use numbers for month and quarter
          data.labels.push(i + 1);
        }
        
        const value = Math.floor(Math.random() * 5000) + 1000;
        values.push(value);
        totalRevenue += value;
        peak = Math.max(peak, value);
      }
    }

    average = totalRevenue / points;

    data.datasets.push({
      label: 'Revenue',
      data: values,
      backgroundColor: 'rgba(67, 97, 238, 0.2)',
      borderColor: '#4361ee',
      borderWidth: 2,
      tension: 0.4,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#4361ee',
      pointBorderWidth: 2,
      pointRadius: 4
    });

    return {
      chartData: data,
      summary: {
        total: totalRevenue,
        average: average,
        peak: peak
      }
    };
  }

  /**
   * Simulate API request with a delay
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} - Resolves to response data
   */
  async _request(endpoint, options = {}) {
    // Simulate network delay
    const delay = Math.floor(Math.random() * 500) + 300;
    const mockResponseMap = {
      '/statistics': this.mockData.statistics,
      '/revenue': this.mockData.revenue,
      '/revenue/week': this.mockData.revenue.week,
      '/revenue/month': this.mockData.revenue.month,
      '/revenue/quarter': this.mockData.revenue.quarter,
      '/revenue/year': this.mockData.revenue.year,
      '/recommendations': this.mockData.recommendations,
      '/integrations': this.mockData.integrations,
      '/notifications': this.mockData.notifications
    };

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Random failure for error handling testing (5% chance)
        if (Math.random() < 0.05) {
          reject({
            status: 500,
            message: 'API Error: Could not retrieve data'
          });
          return;
        }
        
        if (mockResponseMap[endpoint]) {
          resolve(mockResponseMap[endpoint]);
        } else {
          reject({
            status: 404,
            message: `API Error: Endpoint ${endpoint} not found`
          });
        }
      }, delay);
    });
  }

  /**
   * Get dashboard statistics
   * @returns {Promise} - Resolves to statistics data
   */
  async getStatistics() {
    return this._request('/statistics');
  }

  /**
   * Get revenue data for the specified period
   * @param {string} period - week, month, quarter, or year
   * @returns {Promise} - Resolves to revenue data
   */
  async getRevenue(period = 'week') {
    return this._request(`/revenue/${period}`);
  }

  /**
   * Get all recommendations
   * @returns {Promise} - Resolves to recommendation data
   */
  async getRecommendations() {
    return this._request('/recommendations');
  }

  /**
   * Get integration status
   * @returns {Promise} - Resolves to integrations data
   */
  async getIntegrations() {
    return this._request('/integrations');
  }

  /**
   * Get notifications
   * @returns {Promise} - Resolves to notifications data
   */
  async getNotifications() {
    return this._request('/notifications');
  }

  /**
   * Search across data
   * @param {string} query - Search query
   * @returns {Promise} - Resolves to search results
   */
  async search(query) {
    // In a real implementation, this would query the backend
    // For mock data, we'll just filter the existing data
    if (!query || query.length < 2) {
      return Promise.resolve([]);
    }

    const normQuery = query.toLowerCase();
    const results = [];

    // Search recommendations
    this.mockData.recommendations.forEach(rec => {
      if (rec.title.toLowerCase().includes(normQuery) || 
          rec.description.toLowerCase().includes(normQuery) ||
          rec.category.toLowerCase().includes(normQuery)) {
        results.push({
          type: 'recommendation',
          id: rec.id,
          title: rec.title,
          category: rec.category
        });
      }
    });

    // Search integrations
    this.mockData.integrations.forEach(int => {
      if (int.name.toLowerCase().includes(normQuery)) {
        results.push({
          type: 'integration',
          id: int.id,
          title: int.name,
          category: 'Integration'
        });
      }
    });

    // Simulate delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(results);
      }, 300);
    });
  }
}

// Export a singleton instance
export default new DataService(); 