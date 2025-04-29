import supabase from './supabaseClient.js';

// Test element styling
const styles = {
  success: 'color: green; background: #eeffee; padding: 10px; margin: 5px; border-radius: 5px; border-left: 4px solid green;',
  error: 'color: red; background: #ffeeee; padding: 10px; margin: 5px; border-radius: 5px; border-left: 4px solid red;',
  info: 'color: #0066cc; background: #e6f7ff; padding: 10px; margin: 5px; border-radius: 5px; border-left: 4px solid #0066cc;',
  container: 'max-width: 800px; margin: 20px auto; font-family: Arial, sans-serif; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);',
  header: 'background: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px; border-left: 4px solid #4361ee;',
  table: 'width: 100%; border-collapse: collapse; margin: 10px 0;',
  th: 'background: #f1f1f1; padding: 10px; text-align: left; border-bottom: 2px solid #ddd;',
  td: 'padding: 8px; border-bottom: 1px solid #ddd;',
  button: 'background: #4361ee; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin: 5px;'
};

// Create a results container
document.body.innerHTML += `
<div style="${styles.container}">
  <div style="${styles.header}">
    <h1>Supabase Connection Test</h1>
    <p>Testing connection to project: ${supabase.supabaseUrl}</p>
  </div>
  <div id="test-results"></div>
  <button id="run-all-tests" style="${styles.button}">Run All Tests</button>
</div>
`;

const resultsContainer = document.getElementById('test-results');
const runAllButton = document.getElementById('run-all-tests');

// Function to add test result
function addResult(title, status, message, data = null) {
  const style = status === 'success' ? styles.success : (status === 'info' ? styles.info : styles.error);
  
  let html = `
    <div style="${style}">
      <h3>${title}</h3>
      <p>${message}</p>
  `;
  
  if (data && Array.isArray(data) && data.length > 0) {
    html += `<table style="${styles.table}">
      <thead>
        <tr>
          ${Object.keys(data[0]).map(key => `<th style="${styles.th}">${key}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.slice(0, 3).map(row => `
          <tr>
            ${Object.values(row).map(val => `<td style="${styles.td}">${val !== null ? val : 'null'}</td>`).join('')}
          </tr>
        `).join('')}
        ${data.length > 3 ? `<tr><td colspan="${Object.keys(data[0]).length}" style="${styles.td}">...and ${data.length - 3} more rows</td></tr>` : ''}
      </tbody>
    </table>`;
  }
  
  html += `</div>`;
  resultsContainer.innerHTML += html;
}

// Test functions for each table
async function testUserStatistics() {
  try {
    const { data, error } = await supabase.from('user_statistics').select('*');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      addResult(
        'User Statistics', 
        'success', 
        `Successfully fetched user statistics. Found ${data.length} record(s).`,
        data
      );
    } else {
      addResult(
        'User Statistics', 
        'info', 
        'Table exists but no data found.'
      );
    }
  } catch (err) {
    addResult(
      'User Statistics', 
      'error', 
      `Error: ${err.message}`,
    );
  }
}

async function testRevenueData() {
  try {
    const { data, error } = await supabase.from('revenue_data').select('*').limit(10);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      addResult(
        'Revenue Data', 
        'success', 
        `Successfully fetched revenue data. Found ${data.length} records (showing first 10).`,
        data
      );
    } else {
      addResult(
        'Revenue Data', 
        'info', 
        'Table exists but no data found.'
      );
    }
  } catch (err) {
    addResult(
      'Revenue Data', 
      'error', 
      `Error: ${err.message}`,
    );
  }
}

async function testRecommendations() {
  try {
    const { data, error } = await supabase.from('recommendations').select('*');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      addResult(
        'Recommendations', 
        'success', 
        `Successfully fetched recommendations. Found ${data.length} record(s).`,
        data
      );
    } else {
      addResult(
        'Recommendations', 
        'info', 
        'Table exists but no data found.'
      );
    }
  } catch (err) {
    addResult(
      'Recommendations', 
      'error', 
      `Error: ${err.message}`,
    );
  }
}

async function testIntegrations() {
  try {
    const { data, error } = await supabase.from('integrations').select('*');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      addResult(
        'Integrations', 
        'success', 
        `Successfully fetched integrations. Found ${data.length} record(s).`,
        data
      );
    } else {
      addResult(
        'Integrations', 
        'info', 
        'Table exists but no data found.'
      );
    }
  } catch (err) {
    addResult(
      'Integrations', 
      'error', 
      `Error: ${err.message}`,
    );
  }
}

async function testNotifications() {
  try {
    const { data, error } = await supabase.from('notifications').select('*');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      addResult(
        'Notifications', 
        'success', 
        `Successfully fetched notifications. Found ${data.length} record(s).`,
        data
      );
    } else {
      addResult(
        'Notifications', 
        'info', 
        'Table exists but no data found.'
      );
    }
  } catch (err) {
    addResult(
      'Notifications', 
      'error', 
      `Error: ${err.message}`,
    );
  }
}

async function testSalesData() {
  try {
    const { data, error } = await supabase.from('sales_data').select('*').limit(10);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      addResult(
        'Sales Data', 
        'success', 
        `Successfully fetched sales data. Found ${data.length} records (showing first 10).`,
        data
      );
    } else {
      addResult(
        'Sales Data', 
        'info', 
        'Table exists but no data found.'
      );
    }
  } catch (err) {
    addResult(
      'Sales Data', 
      'error', 
      `Error: ${err.message}`,
    );
  }
}

async function testProducts() {
  try {
    const { data, error } = await supabase.from('products').select('*');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      addResult(
        'Products', 
        'success', 
        `Successfully fetched products. Found ${data.length} record(s).`,
        data
      );
    } else {
      addResult(
        'Products', 
        'info', 
        'Table exists but no data found.'
      );
    }
  } catch (err) {
    addResult(
      'Products', 
      'error', 
      `Error: ${err.message}`,
    );
  }
}

async function testCustomers() {
  try {
    const { data, error } = await supabase.from('customers').select('*').limit(10);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      addResult(
        'Customers', 
        'success', 
        `Successfully fetched customers. Found ${data.length} records (showing first 10).`,
        data
      );
    } else {
      addResult(
        'Customers', 
        'info', 
        'Table exists but no data found.'
      );
    }
  } catch (err) {
    addResult(
      'Customers', 
      'error', 
      `Error: ${err.message}`,
    );
  }
}

async function testViews() {
  try {
    const views = [
      { name: 'revenue_by_source', query: supabase.from('revenue_by_source').select('*') },
      { name: 'revenue_by_day', query: supabase.from('revenue_by_day').select('*') },
      { name: 'product_performance', query: supabase.from('product_performance').select('*') }
    ];
    
    for (const view of views) {
      const { data, error } = await view.query;
      
      if (error) {
        addResult(
          `View: ${view.name}`, 
          'error', 
          `Error: ${error.message}`,
        );
        continue;
      }
      
      if (data && data.length > 0) {
        addResult(
          `View: ${view.name}`, 
          'success', 
          `Successfully queried view. Found ${data.length} record(s).`,
          data
        );
      } else {
        addResult(
          `View: ${view.name}`, 
          'info', 
          'View exists but no data returned.'
        );
      }
    }
  } catch (err) {
    addResult(
      'Database Views', 
      'error', 
      `Error: ${err.message}`,
    );
  }
}

// Function to run all tests
async function runAllTests() {
  resultsContainer.innerHTML = ''; // Clear previous results
  
  // Start with basic connection test
  try {
    const { data, error } = await supabase.from('user_statistics').select('count');
    
    if (error) {
      addResult(
        'Basic Connection Test', 
        'error', 
        `Failed to connect to Supabase: ${error.message}`
      );
      return;
    }
    
    addResult(
      'Basic Connection Test', 
      'success', 
      'Successfully connected to Supabase!'
    );
    
    // Run all individual tests
    await testUserStatistics();
    await testRevenueData();
    await testRecommendations();
    await testIntegrations();
    await testNotifications();
    await testSalesData();
    await testProducts();
    await testCustomers();
    await testViews();
    
  } catch (err) {
    addResult(
      'Connection Error', 
      'error', 
      `Unexpected error: ${err.message}`
    );
  }
}

// Attach click event to the button
runAllButton.addEventListener('click', runAllTests);

// Initial test on page load
runAllTests(); 