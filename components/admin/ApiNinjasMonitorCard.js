import React, { useState, useEffect } from 'react';
import { adminNutritionAPI } from '../../services/api.js';

// USDA FoodData Central Monitor Card (formerly ApiNinjasMonitorCard)
const ApiNinjasMonitorCard = () => {
  const [cacheStats, setCacheStats] = useState(null);
  const [apiFoods, setApiFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsResponse, foodsResponse] = await Promise.all([
        adminNutritionAPI.getCacheStats(),
        adminNutritionAPI.getApiFoods()
      ]);
      
      setCacheStats(statsResponse.cacheStats);
      setApiFoods(foodsResponse.foods || []);
    } catch (error) {
      console.error('Failed to fetch USDA FDC data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await adminNutritionAPI.testConnection('apple');
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm('Are you sure you want to clear the API cache?')) return;
    
    setIsClearing(true);
    try {
      await adminNutritionAPI.clearCache();
      setMessage({ type: 'success', text: 'Cache cleared successfully!' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clear cache' });
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading) {
    return (
      React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
        React.createElement("div", { className: "animate-pulse" },
          React.createElement("div", { className: "h-6 bg-gray-200 rounded w-1/3 mb-4" }),
          React.createElement("div", { className: "space-y-3" },
            React.createElement("div", { className: "h-4 bg-gray-200 rounded" }),
            React.createElement("div", { className: "h-4 bg-gray-200 rounded w-5/6" })
          )
        )
      )
    );
  }

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
      /* Header */
      React.createElement("div", { className: "flex justify-between items-center mb-6" },
        React.createElement("div", null,
          React.createElement("h2", { className: "text-xl font-bold text-gray-900" }, "USDA FoodData Central"),
          React.createElement("p", { className: "text-sm text-gray-500" }, "Monitor nutritional data API")
        ),
        React.createElement("div", { className: "flex items-center space-x-2" },
          React.createElement("button", {
            onClick: handleTestConnection,
            disabled: isTesting,
            className: "px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50"
          }, isTesting ? "Testing..." : "Test Connection"),
          React.createElement("button", {
            onClick: handleClearCache,
            disabled: isClearing,
            className: "px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
          }, isClearing ? "Clearing..." : "Clear Cache")
        )
      ),

      /* Message */
      message.text && (
        React.createElement("div", { 
          className: `mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }` 
        }, message.text)
      ),

      /* Test Result */
      testResult && (
        React.createElement("div", { 
          className: `mb-4 p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}` 
        },
          React.createElement("div", { className: "flex items-center space-x-2" },
            testResult.success ? (
              React.createElement("svg", { className: "w-5 h-5 text-green-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" })
              )
            ) : (
              React.createElement("svg", { className: "w-5 h-5 text-red-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })
              )
            ),
            React.createElement("span", { className: testResult.success ? "text-green-700" : "text-red-700" }, 
              testResult.message
            )
          ),
          testResult.sampleResult && (
            React.createElement("div", { className: "mt-2 text-sm text-gray-600" },
              React.createElement("p", null, `Sample: ${testResult.sampleResult.name} - ${testResult.sampleResult.calories} cal`)
            )
          )
        )
      ),

      /* Cache Stats */
      cacheStats && (
        React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" },
          React.createElement("div", { className: "bg-blue-50 rounded-lg p-4 text-center" },
            React.createElement("p", { className: "text-2xl font-bold text-blue-700" }, cacheStats.total_entries),
            React.createElement("p", { className: "text-xs text-gray-600" }, "Total Cached")
          ),
          React.createElement("div", { className: "bg-green-50 rounded-lg p-4 text-center" },
            React.createElement("p", { className: "text-2xl font-bold text-green-700" }, cacheStats.valid_entries),
            React.createElement("p", { className: "text-xs text-gray-600" }, "Valid Entries")
          ),
          React.createElement("div", { className: "bg-orange-50 rounded-lg p-4 text-center" },
            React.createElement("p", { className: "text-2xl font-bold text-orange-700" }, cacheStats.expired_entries),
            React.createElement("p", { className: "text-xs text-gray-600" }, "Expired")
          ),
          React.createElement("div", { className: "bg-purple-50 rounded-lg p-4 text-center" },
            React.createElement("p", { className: "text-2xl font-bold text-purple-700" }, `${cacheStats.cache_ttl_seconds}s`),
            React.createElement("p", { className: "text-xs text-gray-600" }, "Cache TTL")
          )
        )
      ),

      /* API-Sourced Foods Table */
      React.createElement("div", null,
        React.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-3" }, 
          `Saved API Foods (${apiFoods.length})`
        ),
        apiFoods.length > 0 ? (
          React.createElement("div", { className: "overflow-x-auto" },
            React.createElement("table", { className: "min-w-full divide-y divide-gray-200" },
              React.createElement("thead", { className: "bg-gray-50" },
                React.createElement("tr", null,
                  React.createElement("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" }, "Food Name"),
                  React.createElement("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" }, "Calories"),
                  React.createElement("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" }, "Protein"),
                  React.createElement("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" }, "Carbs"),
                  React.createElement("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" }, "Fat"),
                  React.createElement("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" }, "Added By")
                )
              ),
              React.createElement("tbody", { className: "bg-white divide-y divide-gray-200" },
                apiFoods.slice(0, 10).map((food) => (
                  React.createElement("tr", { key: food.id, className: "hover:bg-gray-50" },
                    React.createElement("td", { className: "px-4 py-3 text-sm font-medium text-gray-900" }, food.name),
                    React.createElement("td", { className: "px-4 py-3 text-sm text-gray-600" }, `${food.calories} kcal`),
                    React.createElement("td", { className: "px-4 py-3 text-sm text-gray-600" }, `${food.protein}g`),
                    React.createElement("td", { className: "px-4 py-3 text-sm text-gray-600" }, `${food.carbs}g`),
                    React.createElement("td", { className: "px-4 py-3 text-sm text-gray-600" }, `${food.fat}g`),
                    React.createElement("td", { className: "px-4 py-3 text-sm text-gray-500" }, food.addedBy || 'System')
                  )
                ))
              )
            )
          )
        ) : (
          React.createElement("p", { className: "text-sm text-gray-500 text-center py-4" }, 
            "No foods have been saved from USDA FDC yet."
          )
        )
      )
    )
  );
};

export default ApiNinjasMonitorCard;
