import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize the Supabase client
const supabaseUrl = 'https://zasoqfubvheyssdqprbl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphc29xZnVidmhleXNzZHFwcmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NTYwMzQsImV4cCI6MjA2MDUzMjAzNH0.8KWkOifzAMjdyo1xs3o9m7cMlOOh23GPaH5dGDiqtCo';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

async function testConnection() {
  const { data, error } = await supabase.from('user_statistics').select('count');
  console.log('Connection test:', { data, error });
}
testConnection(); 