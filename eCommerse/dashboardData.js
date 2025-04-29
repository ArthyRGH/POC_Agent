import supabase from './supabaseClient.js';

// Fetch user statistics
export async function fetchUserStats() {
  const { data, error } = await supabase
    .from('user_statistics')
    .select('*')
    .single();
  
  if (error) {
    console.error('Error fetching user statistics:', error);
    return null;
  }
  
  return data;
}

// Fetch revenue data
export async function fetchRevenueData() {
  const { data, error } = await supabase
    .from('revenue_data')
    .select('*')
    .order('date', { ascending: true });
  
  if (error) {
    console.error('Error fetching revenue data:', error);
    return [];
  }
  
  return data;
}

// Fetch recommendations
export async function fetchRecommendations() {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .limit(5);
  
  if (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
  
  return data;
}

// Fetch integrations
export async function fetchIntegrations() {
  const { data, error } = await supabase
    .from('integrations')
    .select('*');
  
  if (error) {
    console.error('Error fetching integrations:', error);
    return [];
  }
  
  return data;
} 