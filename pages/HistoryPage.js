import React, { useState, useEffect } from 'react';
import DashboardTopBar from '../components/dashboard/DashboardTopBar.js';
import Button from '../components/Button.js';
import { foodLogAPI } from '../services/api.js';

const HistoryPage = ({ onNavigate, user, onLogout }) => {
  const [historyEntries, setHistoryEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysToLoad, setDaysToLoad] = useState(30);
  const [expandedEntries, setExpandedEntries] = useState(new Set());

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

  const toggleExpanded = (entryId) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
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
        showSearchBar: false,
        user: user,
        onLogout: onLogout
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
      React.createElement("div", { className: "space-y-4" },
        historyEntries.length > 0 ? (
          historyEntries.map((entry) => (
            React.createElement("div", { 
              key: entry.id, 
              className: "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            },
              /* Entry Header - Always visible */
              React.createElement("div", { className: "p-6" },
                /* Date and Calories */
                React.createElement("div", { className: "flex items-baseline justify-between gap-3 mb-4" },
                  React.createElement("div", { className: "min-w-0" },
                    React.createElement("h3", { className: "text-lg font-bold text-gray-900 truncate" },
                      formatDate(entry.date)
                    ),
                    React.createElement("span", { className: "text-sm text-gray-500" },
                      entry.date
                    )
                  ),
                  React.createElement("div", { className: "text-right flex-shrink-0" },
                    React.createElement("p", { className: "text-2xl font-bold text-blue-600 whitespace-nowrap" },
                      `${Math.round(entry.totalCalories)} cal`
                    ),
                    React.createElement("p", { className: "text-xs text-gray-500" }, 
                      `${entry.caloriePercentage}% of goal`
                    )
                  )
                ),

                /* Macro Summary - Compact */
                React.createElement("div", { className: "grid grid-cols-3 gap-3" },
                  React.createElement("div", { className: "bg-orange-50 rounded-lg p-3 text-center" },
                    React.createElement("p", { className: "text-lg font-bold text-orange-600" },
                      `${Math.round(entry.protein)}g`
                    ),
                    React.createElement("p", { className: "text-xs text-gray-500" }, "Protein")
                  ),
                  React.createElement("div", { className: "bg-green-50 rounded-lg p-3 text-center" },
                    React.createElement("p", { className: "text-lg font-bold text-green-600" },
                      `${Math.round(entry.carbs)}g`
                    ),
                    React.createElement("p", { className: "text-xs text-gray-500" }, "Carbs")
                  ),
                  React.createElement("div", { className: "bg-purple-50 rounded-lg p-3 text-center" },
                    React.createElement("p", { className: "text-lg font-bold text-purple-600" },
                      `${Math.round(entry.fat)}g`
                    ),
                    React.createElement("p", { className: "text-xs text-gray-500" }, "Fat")
                  )
                )
              ),

              /* View Details Button */
              React.createElement("button", {
                onClick: () => toggleExpanded(entry.id),
                className: "w-full py-3 text-sm text-blue-600 hover:bg-blue-50 font-medium border-t border-gray-100 flex items-center justify-center transition-colors"
              },
                expandedEntries.has(entry.id) ? "Hide Details" : "View Full Details",
                React.createElement("svg", { 
                  xmlns: "http://www.w3.org/2000/svg", 
                  fill: "none", 
                  viewBox: "0 0 24 24", 
                  strokeWidth: 2, 
                  stroke: "currentColor", 
                  className: `w-4 h-4 ml-1 transition-transform ${expandedEntries.has(entry.id) ? 'rotate-180' : ''}`
                },
                  React.createElement("path", { 
                    strokeLinecap: "round", 
                    strokeLinejoin: "round", 
                    d: "M19.5 8.25l-7.5 7.5-7.5-7.5" 
                  })
                )
              ),

              /* Expanded Details - Foods for each meal */
              expandedEntries.has(entry.id) && entry.meals && Object.keys(entry.meals).length > 0 && (
                React.createElement("div", { className: "border-t border-gray-100 bg-gray-50 p-6" },
                  Object.entries(entry.meals).map(([mealName, mealData]) => (
                    React.createElement("div", { key: mealName, className: "mb-4 last:mb-0" },
                      React.createElement("div", { className: "flex justify-between items-center mb-2" },
                        React.createElement("h4", { className: "font-semibold text-gray-900" }, mealName),
                        React.createElement("span", { className: "text-sm text-blue-600 font-medium" },
                          `${Math.round(mealData.totalCalories)} cal`
                        )
                      ),
                      React.createElement("div", { className: "space-y-2" },
                        mealData.foods && mealData.foods.map((food, idx) => (
                          React.createElement("div", { 
                            key: idx, 
                            className: "flex justify-between items-center py-2 px-3 bg-white rounded-lg text-sm"
                          },
                            React.createElement("span", { className: "text-gray-700" }, food.name),
                            React.createElement("span", { className: "text-gray-500" }, 
                              `${Math.round(food.calories)} cal`
                            )
                          )
                        ))
                      )
                    )
                  ))
                )
              ),

              /* No meals message */
              expandedEntries.has(entry.id) && (!entry.meals || Object.keys(entry.meals).length === 0) && (
                React.createElement("div", { className: "border-t border-gray-100 bg-gray-50 p-6 text-center text-gray-500" },
                  "No meal details available for this day"
                )
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
              onClick: () => onNavigate('meal-log'),
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
