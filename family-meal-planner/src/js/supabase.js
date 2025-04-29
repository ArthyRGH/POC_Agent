import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { 
  cacheData, 
  getCachedData, 
  addPendingChange, 
  getPendingChanges, 
  markChangeAsSynced,
  removeSyncedChanges,
  isOnline 
} from './indexedDB.js';

// Initialize the Supabase client
// Replace with your own Supabase URL and anon key
const supabaseUrl = 'https://agvvkzsakrftkrqemfop.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFndnZrenNha3JmdGtycWVtZm9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NjY4MjcsImV4cCI6MjA2MTM0MjgyN30.-d8knn3iq-IDRZvdxW9VBTf95TTLaZg5fr5M9ABakaY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication functions
async function signUp(email, password, firstName, lastName) {
  if (!isOnline()) {
    return { data: null, error: new Error('Cannot sign up while offline') };
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName
      }
    }
  });
  
  return { data, error };
}

async function signIn(email, password) {
  if (!isOnline()) {
    return { data: null, error: new Error('Cannot sign in while offline') };
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
}

async function signOut() {
  if (!isOnline()) {
    // We can still "sign out" locally even if offline
    localStorage.removeItem('supabase.auth.token');
    return { error: null };
  }
  
  const { error } = await supabase.auth.signOut();
  return { error };
}

async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

// Recipe functions
async function getRecipes(userId) {
  try {
    if (isOnline()) {
      // Online - fetch from Supabase
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (data) {
        // Cache the data for offline use
        await cacheData('recipes', data);
      }
      
      return { data, error };
    } else {
      // Offline - get from local cache
      console.log('Offline mode: Getting recipes from cache');
      const allRecipes = await getCachedData('recipes');
      const userRecipes = allRecipes.filter(recipe => recipe.user_id === userId);
      
      return { 
        data: userRecipes, 
        error: null,
        isOffline: true 
      };
    }
  } catch (error) {
    console.error('Error getting recipes:', error);
    
    // Fallback to cache if there's an error
    const allRecipes = await getCachedData('recipes');
    const userRecipes = allRecipes.filter(recipe => recipe.user_id === userId);
    
    return { 
      data: userRecipes, 
      error: null,
      isOffline: true 
    };
  }
}

async function getRecipe(recipeId) {
  try {
    if (isOnline()) {
      // Online - fetch from Supabase
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients(
            id,
            quantity,
            unit,
            notes,
            ingredients(id, name, category)
          )
        `)
        .eq('id', recipeId)
        .single();
      
      if (data) {
        // Cache the data for offline use
        await cacheData('recipes', data);
      }
      
      return { data, error };
    } else {
      // Offline - get from local cache
      console.log('Offline mode: Getting recipe from cache');
      const recipe = await getCachedData('recipes', recipeId);
      
      return { 
        data: recipe, 
        error: null,
        isOffline: true 
      };
    }
  } catch (error) {
    console.error('Error getting recipe:', error);
    
    // Fallback to cache if there's an error
    const recipe = await getCachedData('recipes', recipeId);
    
    return { 
      data: recipe, 
      error: null,
      isOffline: true 
    };
  }
}

async function createRecipe(recipeData) {
  if (isOnline()) {
    // Online - send to Supabase
    const { data, error } = await supabase
      .from('recipes')
      .insert(recipeData)
      .select();
    
    if (data) {
      // Cache the data for offline use
      await cacheData('recipes', data[0]);
    }
    
    return { data, error };
  } else {
    // Offline - store locally and add to pending changes
    console.log('Offline mode: Creating recipe locally');
    
    // Generate a temporary ID
    const tempId = 'temp_' + Date.now();
    const recipeWithTempId = {
      ...recipeData,
      id: tempId,
      created_at: new Date().toISOString()
    };
    
    // Store in local cache
    await cacheData('recipes', recipeWithTempId);
    
    // Add to pending changes
    await addPendingChange({
      type: 'create',
      entity: 'recipes',
      data: recipeData // Original data without temp ID
    });
    
    return { 
      data: [recipeWithTempId], 
      error: null,
      isOffline: true 
    };
  }
}

async function updateRecipe(recipeId, recipeData) {
  const { data, error } = await supabase
    .from('recipes')
    .update(recipeData)
    .eq('id', recipeId)
    .select();
  
  return { data, error };
}

async function deleteRecipe(recipeId) {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId);
  
  return { error };
}

// Ingredient functions
async function getIngredients() {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('name');
  
  return { data, error };
}

async function addRecipeIngredient(recipeIngredientData) {
  const { data, error } = await supabase
    .from('recipe_ingredients')
    .insert(recipeIngredientData)
    .select();
  
  return { data, error };
}

// Meal plan functions
async function getMealPlans(userId) {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });
  
  return { data, error };
}

async function getMealPlan(mealPlanId) {
  const { data, error } = await supabase
    .from('meal_plans')
    .select(`
      *,
      meal_plan_items(
        id,
        meal_date,
        meal_type,
        notes,
        recipes(id, title, preparation_time, cooking_time, servings)
      )
    `)
    .eq('id', mealPlanId)
    .single();
  
  return { data, error };
}

async function createMealPlan(mealPlanData) {
  const { data, error } = await supabase
    .from('meal_plans')
    .insert(mealPlanData)
    .select();
  
  return { data, error };
}

async function addMealPlanItem(mealPlanItemData) {
  const { data, error } = await supabase
    .from('meal_plan_items')
    .insert(mealPlanItemData)
    .select();
  
  return { data, error };
}

// Shopping list functions
async function getShoppingLists(userId) {
  const { data, error } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
}

async function getShoppingList(shoppingListId) {
  const { data, error } = await supabase
    .from('shopping_lists')
    .select(`
      *,
      shopping_list_items(
        id,
        quantity,
        unit,
        purchased,
        notes,
        ingredients(id, name, category)
      )
    `)
    .eq('id', shoppingListId)
    .single();
  
  return { data, error };
}

async function createShoppingList(shoppingListData) {
  const { data, error } = await supabase
    .from('shopping_lists')
    .insert(shoppingListData)
    .select();
  
  return { data, error };
}

async function updateShoppingListItem(itemId, updateData) {
  const { data, error } = await supabase
    .from('shopping_list_items')
    .update(updateData)
    .eq('id', itemId)
    .select();
  
  return { data, error };
}

async function generateShoppingListFromMealPlan(mealPlanId, title) {
  // This would need a server-side function in Supabase to aggregate ingredients
  // For now, we'll implement this on the client side
  // This is a placeholder function
  return { error: new Error('Not implemented yet') };
}

// Test connection function with offline support
async function testConnection() {
  if (!isOnline()) {
    console.log('Offline: Cannot test connection');
    return { success: false, message: 'You are currently offline' };
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Connection test failed:', error);
      return { success: false, message: error.message };
    }
    
    console.log('Connection test successful:', data);
    return { success: true, message: 'Connection successful!' };
  } catch (error) {
    console.error('Connection test error:', error);
    return { success: false, message: error.message };
  }
}

// Sync function to process pending changes when back online
async function syncPendingChanges() {
  if (!isOnline()) {
    console.log('Cannot sync while offline');
    return { success: false };
  }
  
  const pendingChanges = await getPendingChanges();
  if (pendingChanges.length === 0) {
    console.log('No pending changes to sync');
    return { success: true, processed: 0 };
  }
  
  console.log(`Syncing ${pendingChanges.length} pending changes`);
  
  let processed = 0;
  const errors = [];
  
  // Process each change
  for (const change of pendingChanges) {
    if (change.synced) continue;
    
    try {
      let result;
      
      switch (change.type) {
        case 'create':
          result = await supabase
            .from(change.entity)
            .insert(change.data)
            .select();
          break;
        
        case 'update':
          result = await supabase
            .from(change.entity)
            .update(change.data)
            .eq('id', change.id)
            .select();
          break;
          
        case 'delete':
          result = await supabase
            .from(change.entity)
            .delete()
            .eq('id', change.id);
          break;
      }
      
      if (result.error) {
        errors.push({ change, error: result.error });
      } else {
        await markChangeAsSynced(change.id);
        processed++;
      }
    } catch (error) {
      errors.push({ change, error });
    }
  }
  
  await removeSyncedChanges();
  
  return { 
    success: errors.length === 0,
    processed,
    errors: errors.length > 0 ? errors : null
  };
}

// Event listener for when the app comes back online
document.addEventListener('appOnline', async () => {
  console.log('App is back online, syncing changes...');
  const result = await syncPendingChanges();
  console.log('Sync result:', result);
});

// Export all functions
export default supabase;
export {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getIngredients,
  addRecipeIngredient,
  getMealPlans,
  getMealPlan,
  createMealPlan,
  addMealPlanItem,
  getShoppingLists,
  getShoppingList,
  createShoppingList,
  updateShoppingListItem,
  generateShoppingListFromMealPlan,
  testConnection,
  syncPendingChanges,
  isOnline
};
