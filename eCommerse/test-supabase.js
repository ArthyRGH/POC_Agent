import supabase from './supabaseClient.js';

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('user_statistics').select('*').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      
      // Show error message
      let errorMessage = `
      <div style="color: red; padding: 20px; background: #ffeeee; margin: 20px; border-radius: 5px;">
        <h3>❌ Supabase Connection Failed</h3>
        <p>Error: ${error.message}</p>
        <p>Code: ${error.code}</p>
        <p>Check browser console for details</p>
      </div>`;
      
      // If the error is about missing tables, provide SQL to create them
      if (error.code === '42P01') {
        errorMessage += `
        <div style="padding: 20px; background: #f8f9fa; margin: 20px; border-radius: 5px; font-family: monospace;">
          <h3>🔧 Missing Tables - SQL to Create</h3>
          <p>The tables required by this application don't exist in your Supabase database yet.</p>
          <p>To fix this issue, go to your Supabase dashboard → SQL Editor, and run this SQL:</p>
          
          <pre style="background: #f1f1f1; padding: 15px; border-radius: 5px; overflow-x: auto;">
-- Create user_statistics table
CREATE TABLE IF NOT EXISTS user_statistics (
  id SERIAL PRIMARY KEY,
  total_users INTEGER NOT NULL,
  active_users INTEGER NOT NULL,
  new_users INTEGER NOT NULL,
  change_percentage DECIMAL(5,2) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO user_statistics (total_users, active_users, new_users, change_percentage) 
VALUES (8724, 5621, 394, 12.5);

-- Create revenue_data table
CREATE TABLE IF NOT EXISTS revenue_data (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  source VARCHAR(50) NOT NULL
);

-- Insert sample data for last 30 days
INSERT INTO revenue_data (date, amount, source)
SELECT 
  CURRENT_DATE - (n || ' days')::INTERVAL,
  (RANDOM() * 5000 + 1000)::DECIMAL(10,2),
  (ARRAY['direct', 'referral', 'organic', 'social', 'email'])[floor(random() * 5) + 1]
FROM generate_series(0, 29) AS n;

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  impact VARCHAR(20) NOT NULL,
  description TEXT NOT NULL
);

-- Insert sample recommendations
INSERT INTO recommendations (title, category, impact, description) VALUES
('Increase ad budget for campaign XYZ', 'Advertising', 'high', 'Based on current ROAS of 320%, we recommend increasing budget by 25%.'),
('Optimize product pricing', 'Pricing', 'medium', 'A/B testing suggests a 5% price increase would not affect conversion rates.'),
('Schedule social posts during peak hours', 'Social Media', 'low', 'Engagement increases by 34% when posting between 7-9 PM.');

-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  icon VARCHAR(50) NOT NULL
);

-- Insert sample integrations
INSERT INTO integrations (name, status, last_sync, icon) VALUES
('Google Analytics', 'active', NOW() - INTERVAL '2 HOURS', 'chart-pie'),
('Shopify', 'active', NOW() - INTERVAL '30 MINUTES', 'shopping-cart'),
('Mailchimp', 'inactive', NOW() - INTERVAL '5 DAYS', 'envelope');
          </pre>
        </div>
        
        <div style="padding: 15px; background: #e6f7ff; margin: 20px; border-radius: 5px;">
          <h3>📝 Instructions</h3>
          <ol>
            <li>Log in to the <a href="https://app.supabase.com" target="_blank">Supabase Dashboard</a></li>
            <li>Select your project</li>
            <li>Go to the SQL Editor tab</li>
            <li>Paste the SQL above</li>
            <li>Click "Run" to execute</li>
            <li>Come back and refresh this page</li>
          </ol>
        </div>`;
      }
      
      document.body.innerHTML += errorMessage;
    } else {
      console.log('Supabase connection successful!', data);
      document.body.innerHTML += `<div style="color: green; padding: 20px; background: #eeffee; margin: 20px; border-radius: 5px;">
        <h3>✅ Supabase Connection Successful!</h3>
        <p>Successfully connected to Supabase</p>
        <p>Check browser console for data</p>
      </div>`;
    }
  } catch (err) {
    console.error('Unexpected error testing Supabase connection:', err);
    document.body.innerHTML += `<div style="color: red; padding: 20px; background: #ffeeee; margin: 20px; border-radius: 5px;">
      <h3>❌ Supabase Connection Error</h3>
      <p>Error: ${err.message}</p>
      <p>Check browser console for details</p>
    </div>`;
  }
}

testSupabaseConnection(); 