-- CommercePilot AI Dashboard Database Setup
-- This script creates all required tables and populates them with sample data

-- User Statistics Table
CREATE TABLE IF NOT EXISTS user_statistics (
  id SERIAL PRIMARY KEY,
  total_users INTEGER NOT NULL,
  active_users INTEGER NOT NULL,
  new_users INTEGER NOT NULL,
  change_percentage DECIMAL(5,2) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for user statistics
INSERT INTO user_statistics (total_users, active_users, new_users, change_percentage) 
VALUES (8724, 5621, 394, 12.5);

-- Revenue Data Table
CREATE TABLE IF NOT EXISTS revenue_data (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  source VARCHAR(50) NOT NULL
);

-- Insert sample data for last 30 days of revenue
INSERT INTO revenue_data (date, amount, source)
SELECT 
  CURRENT_DATE - (n || ' days')::INTERVAL,
  (RANDOM() * 5000 + 1000)::DECIMAL(10,2),
  (ARRAY['direct', 'referral', 'organic', 'social', 'email'])[floor(random() * 5) + 1]
FROM generate_series(0, 29) AS n;

-- Recommendations Table
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

-- Integrations Table
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

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type VARCHAR(20) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE
);

-- Insert sample notifications
INSERT INTO notifications (message, timestamp, type, is_read) VALUES
('Traffic spike detected on landing page', NOW() - INTERVAL '2 HOURS', 'alert', false),
('Weekly report available for download', NOW() - INTERVAL '12 HOURS', 'info', true),
('New integration available: TikTok Analytics', NOW() - INTERVAL '2 DAYS', 'info', false);

-- Sales Data Table (for detailed sales reporting)
CREATE TABLE IF NOT EXISTS sales_data (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  customer_id INTEGER,
  region VARCHAR(50)
);

-- Insert sample sales data
INSERT INTO sales_data (date, product_id, quantity, total_amount, customer_id, region)
SELECT
  CURRENT_DATE - (floor(random() * 30) || ' days')::INTERVAL,
  floor(random() * 10) + 1,
  floor(random() * 5) + 1,
  (random() * 200 + 50)::DECIMAL(10,2),
  floor(random() * 100) + 1,
  (ARRAY['North', 'South', 'East', 'West', 'Central'])[floor(random() * 5) + 1]
FROM generate_series(1, 100);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  inventory INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample products
INSERT INTO products (name, category, price, inventory) VALUES
('Premium Analytics Suite', 'Software', 299.99, 999),
('Basic Analytics Package', 'Software', 99.99, 999),
('Data Visualization Pro', 'Software', 149.99, 999),
('Marketing Insights Bundle', 'Service', 499.99, 99),
('Custom Dashboard Setup', 'Service', 899.99, 50),
('Analytics API Access (Monthly)', 'Subscription', 49.99, 999),
('Enterprise Solution', 'Software', 1299.99, 50),
('Consulting Session (1 hour)', 'Service', 199.99, 200),
('Data Import Service', 'Service', 349.99, 100),
('Interactive Reports Package', 'Software', 249.99, 500);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  company VARCHAR(100),
  industry VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_purchase TIMESTAMP WITH TIME ZONE,
  lifetime_value DECIMAL(12,2) DEFAULT 0
);

-- Insert sample customers
INSERT INTO customers (name, email, company, industry, created_at, last_purchase, lifetime_value)
SELECT
  'Customer ' || n,
  'customer' || n || '@example.com',
  CASE WHEN n % 3 = 0 THEN 'Company ' || n ELSE NULL END,
  (ARRAY['Technology', 'Retail', 'Healthcare', 'Finance', 'Education', 'Manufacturing'])[floor(random() * 6) + 1],
  NOW() - (floor(random() * 365) || ' days')::INTERVAL,
  CASE WHEN random() > 0.2 THEN NOW() - (floor(random() * 30) || ' days')::INTERVAL ELSE NULL END,
  (random() * 2000 + 100)::DECIMAL(12,2)
FROM generate_series(1, 50) AS n;

-- Create views for dashboard data

-- Revenue by source view
CREATE OR REPLACE VIEW revenue_by_source AS
SELECT 
  source, 
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count
FROM revenue_data
GROUP BY source;

-- Revenue by day view
CREATE OR REPLACE VIEW revenue_by_day AS
SELECT 
  date,
  SUM(amount) as daily_total
FROM revenue_data
GROUP BY date
ORDER BY date;

-- Product performance view
CREATE OR REPLACE VIEW product_performance AS
SELECT 
  p.id,
  p.name,
  p.category,
  COUNT(s.id) as sales_count,
  SUM(s.quantity) as units_sold,
  SUM(s.total_amount) as revenue,
  p.price,
  p.inventory
FROM products p
LEFT JOIN sales_data s ON p.id = s.product_id
GROUP BY p.id, p.name, p.category, p.price, p.inventory; 