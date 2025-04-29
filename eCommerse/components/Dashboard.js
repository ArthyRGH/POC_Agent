// No imports in browser-based React
// import React from 'react';
// import './Dashboard.css';
// import MetricCard from './MetricCard';
// import Header from './Header';
// import RecommendationCard from './RecommendationCard';
// import RevenueChart from './RevenueChart';
// import IntegrationCard from './IntegrationCard';

function Dashboard() {
  return (
    <div className="dashboard">
      <Header title="Dashboard Overview" />
      
      <div className="dashboard-content">
        <div className="metrics-row">
          <MetricCard 
            title="Revenue"
            value="$157,240"
            change="+12%"
            period="from last period"
            icon="dollar"
          />
          
          <MetricCard 
            title="Orders"
            value="1,254"
            change="+8%"
            period="from last period"
            icon="order"
          />
          
          <MetricCard 
            title="Inventory Alerts"
            value="9"
            icon="inventory"
            isAlert={true}
          />
        </div>
        
        <div className="metrics-row">
          <MetricCard 
            title="Customer Tickets"
            value="28"
            change="+5"
            period="from last period"
            icon="message"
          />

          <MetricCard 
            title="Customer Satisfaction"
            value="97%"
            change="-3"
            period="from last period"
            icon="customer"
            isNegative={true}
          />
        </div>
        
        <div className="dashboard-section">
          <h2>Revenue Performance</h2>
          <RevenueChart />
        </div>
        
        <div className="dashboard-section">
          <h2>AI Recommendations</h2>
          <div className="recommendations-list">
            <RecommendationCard
              title="Inventory Optimization"
              description="Reduce stock levels for low-performing SKUs to improve cash flow"
              agent="INV Agent"
              impact="high"
            />
            
            <RecommendationCard
              title="Price Adjustment"
              description="Increase prices for high-demand products with low price sensitivity"
              agent="PRICING Agent"
              impact="medium"
            />
            
            <RecommendationCard
              title="Marketing Campaign"
              description="Launch retargeting campaign for abandoned carts"
              agent="MARK Agent"
              impact="high"
            />
          </div>
        </div>
        
        <div className="dashboard-section">
          <h2>Platform Integrations</h2>
          <div className="integrations-list">
            <IntegrationCard 
              platform="Shopify"
              status="connected"
              icon="shopify"
            />
            <IntegrationCard 
              platform="WooCommerce"
              status="connected"
              icon="woocommerce"
            />
            <IntegrationCard 
              platform="Google Analytics"
              status="connected"
              icon="google"
            />
            <button className="add-integration-button">
              Add New Integration
            </button>
          </div>
        </div>
        
        <div className="dashboard-section">
          <h2>AI Agent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="agent-avatar" style={{backgroundColor: '#E3F2FD'}}>I</div>
              <div className="activity-content">
                <div className="activity-header">
                  <h3>INV Agent</h3>
                  <span className="activity-time">10 min ago</span>
                </div>
                <p>Adjusted inventory for 15 SKUs</p>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="agent-avatar" style={{backgroundColor: '#E8F5E9'}}>P</div>
              <div className="activity-content">
                <div className="activity-header">
                  <h3>PRICING Agent</h3>
                  <span className="activity-time">25 min ago</span>
                </div>
                <p>Updated pricing for summer collection</p>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="agent-avatar" style={{backgroundColor: '#F3E5F5'}}>C</div>
              <div className="activity-content">
                <div className="activity-header">
                  <h3>CX Agent</h3>
                  <span className="activity-time">40 min ago</span>
                </div>
                <p>Resolved 5 customer support tickets</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-section">
          <h2>Recent Orders</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#ORD-5392</td>
                <td>John Doe</td>
                <td>Oct 21, 2023</td>
                <td><span className="status-badge success">Delivered</span></td>
                <td>$129.99</td>
              </tr>
              <tr>
                <td>#ORD-5391</td>
                <td>Sarah Miller</td>
                <td>Oct 21, 2023</td>
                <td><span className="status-badge warning">Processing</span></td>
                <td>$89.50</td>
              </tr>
              <tr>
                <td>#ORD-5390</td>
                <td>Michael Johnson</td>
                <td>Oct 20, 2023</td>
                <td><span className="status-badge primary">Shipped</span></td>
                <td>$245.75</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// No export default in browser-based React
// export default Dashboard; 