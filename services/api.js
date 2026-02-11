// API Service for JmFitnessPal
// Use VITE_API_URL in .env to point to a specific backend; otherwise use same-origin /api (Vite proxy in dev, nginx/etc in prod).
function getApiBaseUrl() {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  if (typeof window !== 'undefined' && window.location) return `${window.location.origin}/api`;
  return 'http://127.0.0.1:5000/api';
}
const API_BASE_URL = getApiBaseUrl();

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
      headers: { ...getAuthHeaders(), ...(options.headers || {}) }
    });
    
    let data;
    try {
      data = await response.json();
    } catch (_) {
      // Server returned non-JSON (e.g. HTML error page)
      throw new Error(response.statusText || 'Server error. Please try again.');
    }
    
    if (!response.ok) {
      const message = data.error || data.msg || data.message || (data.errors && String(data.errors)) || 'API request failed';
      if (response.status >= 500 && data) console.error('API error response:', data);
      const err = new Error(typeof message === 'string' ? message : 'API request failed');
      if (response.status === 401) {
        authAPI.logout();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
        }
      }
      throw err;
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    // "Failed to fetch" = backend unreachable (not running, wrong URL, or network)
    const msg = error && error.message;
    if (msg === 'Failed to fetch' || (error && error.name === 'TypeError' && msg && msg.includes('fetch'))) {
      const base = API_BASE_URL.replace(/\/api\/?$/, '');
      throw new Error(`Cannot connect to the server. Make sure the backend is running at ${base} and /api is proxied to it (or set VITE_API_URL in .env).`);
    }
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
  
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (_) { /* ignore */ }
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

  calculateGoals: async () => {
    return await apiCall('/user/goals/calculate');
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
// NUTRITION API (USDA FoodData Central)
// ============================================================================

export const nutritionAPI = {
  // Search for foods using USDA FoodData Central
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
  
  // Save USDA food to local database
  saveToDatabase: async (foodData) => {
    return await apiCall('/nutrition/save', {
      method: 'POST',
      body: JSON.stringify(foodData)
    });
  }
};

// ============================================================================
// ADMIN NUTRITION API (USDA FoodData Central)
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
  
  // Test USDA FoodData Central connection
  testConnection: async (query = 'apple') => {
    return await apiCall(`/admin/nutrition/search-test?q=${encodeURIComponent(query)}`);
  }
};

// ============================================================================
// FOOD SCAN API (LogMeal Food AI - Image Recognition)
// ============================================================================

export const foodScanAPI = {
  // Analyze a food image and get nutritional data. Pass { debug: true } to get raw LogMeal API response.
  analyzeImage: async (imageBase64, options = {}) => {
    return await apiCall('/food-scan/analyze', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64, debug: !!options.debug })
    });
  },
  
  // Search for foods using Edamam NLP (alternative to USDA)
  search: async (query) => {
    return await apiCall(`/food-scan/search?q=${encodeURIComponent(query)}`);
  },
  
  // Check Edamam API status
  getStatus: async () => {
    return await apiCall('/food-scan/status');
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
  
  // Log food with direct nutrition data (for USDA FDC foods)
  logFoodWithNutrition: async ({ mealTypeId, servings, nutritionData, date = null, source = 'api' }) => {
    return await apiCall('/food-logs', {
      method: 'POST',
      body: JSON.stringify({ mealTypeId, servings, nutritionData, date, source })
    });
  },
  
  getTodayLogs: async (date = null) => {
    const endpoint = date ? `/food-logs/today?date=${encodeURIComponent(date)}` : '/food-logs/today';
    return await apiCall(endpoint);
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
  },

  // Update a food log entry (amountGrams or servings, mealTypeId)
  updateLog: async (logId, { amountGrams, servings, mealTypeId }) => {
    return await apiCall(`/food-logs/${logId}`, {
      method: 'PUT',
      body: JSON.stringify({ amountGrams, servings, mealTypeId })
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

// Admin Food Database (manual add + Excel import)
export const adminFoodAPI = {
  createFood: async (foodData) => {
    return await apiCall('/admin/foods', {
      method: 'POST',
      body: JSON.stringify(foodData)
    });
  },
  importExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/foods/import-excel`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Import failed');
    return data;
  }
};

export const adminAPI = {
  getAllUsers: async () => {
    return await apiCall('/admin/users');
  },
  getRecentActivity: async () => {
    return await apiCall('/admin/activity');
  },
  deactivateUser: async (userId) => {
    return await apiCall(`/admin/users/${userId}/deactivate`, { method: 'POST' });
  },
  activateUser: async (userId) => {
    return await apiCall(`/admin/users/${userId}/activate`, { method: 'POST' });
  },
  deleteUser: async (userId) => {
    return await apiCall(`/admin/users/${userId}`, { method: 'DELETE' });
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
  adminNutrition: adminNutritionAPI,
  adminFood: adminFoodAPI
};
