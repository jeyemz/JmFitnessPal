// API Service for JmFitnessPal
const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  login: async (email, password) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },
  
  register: async (userData) => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },
  
  getCurrentUser: async () => {
    return await apiCall('/auth/me');
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// ============================================================================
// USER API
// ============================================================================

export const userAPI = {
  getGoals: async () => {
    return await apiCall('/user/goals');
  },
  
  updateGoals: async (goals) => {
    return await apiCall('/user/goals', {
      method: 'PUT',
      body: JSON.stringify(goals)
    });
  }
};

// ============================================================================
// FOOD API (Local Database)
// ============================================================================

export const foodAPI = {
  search: async (query, limit = 20) => {
    return await apiCall(`/foods/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },
  
  getById: async (foodId) => {
    return await apiCall(`/foods/${foodId}`);
  },
  
  calculateNutrition: async (foodId, amount, unit = 'g') => {
    return await apiCall('/foods/calculate', {
      method: 'POST',
      body: JSON.stringify({ foodId, amount, unit })
    });
  }
};

// ============================================================================
// NUTRITION API (API Ninjas)
// ============================================================================

export const nutritionAPI = {
  // Search for foods using API Ninjas
  search: async (query) => {
    return await apiCall(`/nutrition/search?q=${encodeURIComponent(query)}`);
  },
  
  // Calculate nutrition based on custom amount
  calculate: async (food, amount, unit = 'g') => {
    return await apiCall('/nutrition/calculate', {
      method: 'POST',
      body: JSON.stringify({ food, amount, unit })
    });
  },
  
  // Save API food to local database
  saveToDatabase: async (foodData) => {
    return await apiCall('/nutrition/save', {
      method: 'POST',
      body: JSON.stringify(foodData)
    });
  }
};

// ============================================================================
// ADMIN NUTRITION API
// ============================================================================

export const adminNutritionAPI = {
  // Get cache statistics
  getCacheStats: async () => {
    return await apiCall('/admin/nutrition/cache-stats');
  },
  
  // Clear nutrition cache
  clearCache: async () => {
    return await apiCall('/admin/nutrition/clear-cache', {
      method: 'POST'
    });
  },
  
  // Get all API-sourced foods
  getApiFoods: async () => {
    return await apiCall('/admin/nutrition/api-foods');
  },
  
  // Test API Ninjas connection
  testConnection: async (query = 'apple') => {
    return await apiCall(`/admin/nutrition/search-test?q=${encodeURIComponent(query)}`);
  }
};

// ============================================================================
// FOOD LOG API
// ============================================================================

export const foodLogAPI = {
  logFood: async (foodId, mealTypeId, servings, date = null) => {
    return await apiCall('/food-logs', {
      method: 'POST',
      body: JSON.stringify({ foodId, mealTypeId, servings, date })
    });
  },
  
  // Log food with direct nutrition data (for API Ninjas foods)
  logFoodWithNutrition: async ({ mealTypeId, servings, nutritionData, date = null }) => {
    return await apiCall('/food-logs', {
      method: 'POST',
      body: JSON.stringify({ mealTypeId, servings, nutritionData, date })
    });
  },
  
  getTodayLogs: async () => {
    return await apiCall('/food-logs/today');
  },
  
  getDailySummary: async (date = null) => {
    const endpoint = date ? `/daily-summary?date=${date}` : '/daily-summary';
    return await apiCall(endpoint);
  },
  
  // Get history with pagination
  getHistory: async (days = 30) => {
    return await apiCall(`/food-logs/history?days=${days}`);
  },
  
  // Delete a food log entry
  deleteLog: async (logId) => {
    return await apiCall(`/food-logs/${logId}`, {
      method: 'DELETE'
    });
  }
};

// ============================================================================
// PROFILE API
// ============================================================================

export const profileAPI = {
  // Get user profile
  getProfile: async () => {
    return await apiCall('/user/profile');
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    return await apiCall('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },
  
  // Deactivate account
  deactivateAccount: async () => {
    return await apiCall('/user/deactivate', {
      method: 'POST'
    });
  }
};

// ============================================================================
// ADMIN API
// ============================================================================

export const adminAPI = {
  getAllUsers: async () => {
    return await apiCall('/admin/users');
  }
};

export default {
  auth: authAPI,
  user: userAPI,
  food: foodAPI,
  nutrition: nutritionAPI,
  foodLog: foodLogAPI,
  profile: profileAPI,
  admin: adminAPI,
  adminNutrition: adminNutritionAPI
};
