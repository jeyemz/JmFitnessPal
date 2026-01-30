
import React, { useState, useEffect } from 'react';
import DashboardTopBar from '../components/dashboard/DashboardTopBar.js';
import Button from '../components/Button.js';
import { foodLogAPI } from '../services/api.js';

const HistoryPage = ({ onNavigate, user }) => {
  const [historyEntries, setHistoryEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysToLoad, setDaysToLoad] = useState(30);

  // Get user goals for percentage calculations
  const userGoals = user?.goals || {};
  const proteinGoal = userGoals.proteinGoal || 150;
  const carbsGoal = userGoals.carbsGoal || 250;
  const fatGoal = userGoals.fatGoal || 65;

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await foodLogAPI.getHistory(daysToLoad);
        if (response.history) {
          setHistoryEntries(response.history);
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError('Failed to load history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [daysToLoad]);

  const handleLoadMore = () => {
    setDaysToLoad(prev => prev + 30);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    React.createElement("div", { className: "flex-1 p-6 overflow-auto" },
      /* Header Section */
      React.createElement(DashboardTopBar, { 
        title: "Your History", 
        subtitle: "Review your daily nutritional journey",
        showSearchBar: false 
      }),

      /* Loading State */
      isLoading && historyEntries.length === 0 && (
        React.createElement("div", { className: "flex justify-center items-center py-12" },
          React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" })
        )
      ),

      /* Error State */
      error && (
        React.createElement("div", { className: "bg-red-50 text-red-600 p-4 rounded-lg mb-6" },
          error
        )
      ),

      /* History Entries */
      React.createElement("div", { className: "space-y-6" },
        historyEntries.length > 0 ? (
          historyEntries.map((entry) => (
            React.createElement("div", { 
              key: entry.id, 
              className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            },
              /* Date Header */
              React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("h3", { className: "text-lg font-bold text-gray-900" },
                  formatDate(entry.date)
                ),
                React.createElement("span", { className: "text-sm text-gray-500" },
                  entry.date
                )
              ),

              /* Calorie Progress Bar */
              React.createElement("div", { className: "mb-4" },
                React.createElement("div", { className: "flex justify-between text-sm mb-1" },
                  React.createElement("span", { className: "font-medium text-gray-700" }, "Calories"),
                  React.createElement("span", { className: "text-gray-600" },
                    `${Math.round(entry.totalCalories)} / ${entry.calorieGoal} kcal`
                  )
                ),
                React.createElement("div", { className: "w-full bg-gray-200 rounded-full h-3" },
                  React.createElement("div", {
                    className: `h-3 rounded-full transition-all ${
                      entry.caloriePercentage >= 100 ? 'bg-red-500' : 
                      entry.caloriePercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`,
                    style: { width: `${Math.min(100, entry.caloriePercentage)}%` }
                  })
                )
              ),

              /* Macro Summary */
              React.createElement("div", { className: "grid grid-cols-3 gap-4 mb-4" },
                /* Protein */
                React.createElement("div", { className: "bg-orange-50 rounded-lg p-3 text-center" },
                  React.createElement("p", { className: "text-lg font-bold text-orange-600" },
                    `${Math.round(entry.protein)}g`
                  ),
                  React.createElement("p", { className: "text-xs text-gray-600" }, "Protein"),
                  React.createElement("div", { className: "w-full bg-orange-100 rounded-full h-1.5 mt-1" },
                    React.createElement("div", {
                      className: "h-1.5 rounded-full bg-orange-500",
                      style: { width: `${Math.min(100, (entry.protein / proteinGoal) * 100)}%` }
                    })
                  )
                ),
                /* Carbs */
                React.createElement("div", { className: "bg-green-50 rounded-lg p-3 text-center" },
                  React.createElement("p", { className: "text-lg font-bold text-green-600" },
                    `${Math.round(entry.carbs)}g`
                  ),
                  React.createElement("p", { className: "text-xs text-gray-600" }, "Carbs"),
                  React.createElement("div", { className: "w-full bg-green-100 rounded-full h-1.5 mt-1" },
                    React.createElement("div", {
                      className: "h-1.5 rounded-full bg-green-500",
                      style: { width: `${Math.min(100, (entry.carbs / carbsGoal) * 100)}%` }
                    })
                  )
                ),
                /* Fat */
                React.createElement("div", { className: "bg-purple-50 rounded-lg p-3 text-center" },
                  React.createElement("p", { className: "text-lg font-bold text-purple-600" },
                    `${Math.round(entry.fat)}g`
                  ),
                  React.createElement("p", { className: "text-xs text-gray-600" }, "Fat"),
                  React.createElement("div", { className: "w-full bg-purple-100 rounded-full h-1.5 mt-1" },
                    React.createElement("div", {
                      className: "h-1.5 rounded-full bg-purple-500",
                      style: { width: `${Math.min(100, (entry.fat / fatGoal) * 100)}%` }
                    })
                  )
                )
              ),

              /* Meal Breakdown */
              entry.meals && Object.keys(entry.meals).length > 0 && (
                React.createElement("div", { className: "border-t border-gray-100 pt-4" },
                  React.createElement("p", { className: "text-sm font-medium text-gray-700 mb-3" }, "Meals"),
                  React.createElement("div", { className: "space-y-2" },
                    Object.entries(entry.meals).map(([mealName, mealData]) => (
                      React.createElement("div", { 
                        key: mealName, 
                        className: "flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                      },
                        React.createElement("div", null,
                          React.createElement("span", { className: "font-medium text-gray-800" }, mealName),
                          React.createElement("span", { className: "text-sm text-gray-500 ml-2" },
                            `(${mealData.foods.length} items)`
                          )
                        ),
                        React.createElement("span", { className: "text-blue-600 font-semibold" },
                          `${Math.round(mealData.totalCalories)} kcal`
                        )
                      )
                    ))
                  )
                )
              ),

              /* View Details Button */
              React.createElement("button", {
                onClick: () => onNavigate('mealLog'),
                className: "mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              },
                "View Full Details"
              )
            )
          ))
        ) : !isLoading && (
          React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center" },
            React.createElement("svg", { 
              xmlns: "http://www.w3.org/2000/svg", 
              fill: "none", 
              viewBox: "0 0 24 24", 
              strokeWidth: 1.5, 
              stroke: "currentColor", 
              className: "w-12 h-12 text-gray-300 mx-auto mb-3" 
            },
              React.createElement("path", { 
                strokeLinecap: "round", 
                strokeLinejoin: "round", 
                d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" 
              })
            ),
            React.createElement("p", { className: "text-gray-500" }, "No history entries yet."),
            React.createElement("p", { className: "text-sm text-gray-400 mt-1" }, 
              "Start logging your meals to see your history here."
            ),
            React.createElement("button", {
              onClick: () => onNavigate('mealLog'),
              className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            },
              "Log Your First Meal"
            )
          )
        )
      ),

      /* Load More Button */
      historyEntries.length > 0 && (
        React.createElement("div", { className: "mt-8 flex justify-center" },
          React.createElement(Button, { 
            variant: "outline", 
            onClick: handleLoadMore,
            disabled: isLoading
          },
            isLoading ? "Loading..." : "Load Older History"
          )
        )
      )
    )
  );
};

export default HistoryPage;
