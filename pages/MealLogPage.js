import React, { useState, useEffect } from 'react';
import MealLogHeader from '../components/meallog/MealLogHeader.js';
import FoodSearchWithMeasurement from '../components/meallog/FoodSearchWithMeasurement.js';
import AIFoodScannerPanel from '../components/meallog/AIFoodScannerPanel.js';
import DailySummaryCards from '../components/meallog/DailySummaryCards.js';
import DailyMealBreakdownPanel from '../components/meallog/DailyMealBreakdownPanel.js';
import { foodLogAPI } from '../services/api.js';

const MealLogPage = ({ onNavigate, user, onLogout }) => {
  // Date state for navigation
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Format date for display
  const formatDisplayDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const options = { weekday: 'long', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }
  };

  // Format date for API calls (YYYY-MM-DD)
  const formatApiDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    // Don't allow future dates
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  // Check if selected date is today
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  
  const [dailySummary, setDailySummary] = useState({
    totalCalories: 0,
    protein: { value: 0, percentage: 0 },
    carbs: { value: 0, percentage: 0 },
    fats: { value: 0, percentage: 0 }
  });
  const [dayLogs, setDayLogs] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showScanner, setShowScanner] = useState(false);

  // Get user goals
  const userGoals = user?.goals || {};
  const proteinGoal = userGoals.proteinGoal || 150;
  const carbsGoal = userGoals.carbsGoal || 250;
  const fatGoal = userGoals.fatGoal || 65;

  // Fetch daily data for selected date
  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        const dateStr = formatApiDate(selectedDate);
        
        // Fetch daily summary for selected date
        const summaryResponse = await foodLogAPI.getDailySummary(dateStr);
        if (summaryResponse.summary) {
          const s = summaryResponse.summary;
          setDailySummary({
            totalCalories: s.intake || 0,
            protein: { 
              value: s.protein?.current || 0, 
              percentage: Math.min(100, Math.round((s.protein?.current || 0) / proteinGoal * 100))
            },
            carbs: { 
              value: s.carbs?.current || 0, 
              percentage: Math.min(100, Math.round((s.carbs?.current || 0) / carbsGoal * 100))
            },
            fats: { 
              value: s.fat?.current || 0, 
              percentage: Math.min(100, Math.round((s.fat?.current || 0) / fatGoal * 100))
            }
          });
        } else {
          // Reset summary if no data
          setDailySummary({
            totalCalories: 0,
            protein: { value: 0, percentage: 0 },
            carbs: { value: 0, percentage: 0 },
            fats: { value: 0, percentage: 0 }
          });
        }

        // Fetch logs for selected date (always use date param so we get log ids for edit/delete)
        const logsResponse = await foodLogAPI.getTodayLogs(dateStr);
        if (logsResponse.logs && logsResponse.logs.length > 0) {
          const grouped = logsResponse.logs.reduce((acc, log) => {
            const mealType = log.mealType.toLowerCase();
            if (!acc[mealType]) {
              acc[mealType] = { id: mealType, name: log.mealType, items: [], totalCalories: 0 };
            }
            acc[mealType].items.push({
              id: log.id,
              logId: log.id,
              name: log.foodName,
              foodName: log.foodName,
              calories: log.calories,
              protein: log.protein,
              carbs: log.carbs,
              fat: log.fat,
              servings: log.servings,
              servingSize: log.servingSize ?? 100,
              servingUnit: log.servingUnit || 'g',
              mealTypeId: log.mealTypeId,
              mealType: log.mealType,
              imageUrl: log.imageUrl,
              time: formatDisplayDate(selectedDate)
            });
            acc[mealType].totalCalories += log.calories;
            return acc;
          }, {});
          setDayLogs(Object.values(grouped));
        } else {
          setDayLogs([]);
        }
      } catch (error) {
        console.log('Could not fetch daily data:', error);
      }
    };

    fetchDailyData();
  }, [refreshKey, selectedDate, proteinGoal, carbsGoal, fatGoal]);

  const handleFoodAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteLog = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleUpdateLog = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    React.createElement("div", { className: "flex-1 p-4 sm:p-6 overflow-auto" },
      /* Header for Meal Log Page */
      React.createElement(MealLogHeader, {
        title: "Meal & Food Log",
        subtitle: "Track your daily nutrition",
        user: user,
        onLogout: onLogout
      }),

      /* Date Navigation */
      React.createElement("div", { className: "flex justify-center items-center mb-6" },
        React.createElement("div", { className: "flex items-center space-x-4 bg-white rounded-xl shadow-sm px-6 py-3 border border-gray-100" },
          /* Previous Day Button */
          React.createElement("button", {
            onClick: goToPreviousDay,
            className: "p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
          },
            React.createElement("svg", { 
              xmlns: "http://www.w3.org/2000/svg", 
              fill: "none", 
              viewBox: "0 0 24 24", 
              strokeWidth: 2, 
              stroke: "currentColor", 
              className: "w-5 h-5" 
            },
              React.createElement("path", { 
                strokeLinecap: "round", 
                strokeLinejoin: "round", 
                d: "M15.75 19.5L8.25 12l7.5-7.5" 
              })
            )
          ),
          
          /* Date Display */
          React.createElement("div", { className: "text-center min-w-[200px]" },
            React.createElement("p", { className: "text-lg font-bold text-gray-900" }, 
              formatDisplayDate(selectedDate)
            ),
            React.createElement("p", { className: "text-sm text-gray-500" }, 
              selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            )
          ),
          
          /* Next Day Button */
          React.createElement("button", {
            onClick: goToNextDay,
            disabled: isToday,
            className: `p-2 rounded-lg transition-colors ${
              isToday 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`
          },
            React.createElement("svg", { 
              xmlns: "http://www.w3.org/2000/svg", 
              fill: "none", 
              viewBox: "0 0 24 24", 
              strokeWidth: 2, 
              stroke: "currentColor", 
              className: "w-5 h-5" 
            },
              React.createElement("path", { 
                strokeLinecap: "round", 
                strokeLinejoin: "round", 
                d: "M8.25 4.5l7.5 7.5-7.5 7.5" 
              })
            )
          )
        )
      ),

      React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
        /* Left Column: Combined Search + AI Scan (only show for today) */
        React.createElement("div", { className: "lg:col-span-1 flex flex-col space-y-6" },
          isToday ? (
            showScanner ? (
              React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
                React.createElement("div", { className: "flex items-center justify-between mb-4" },
                  React.createElement("h2", { className: "text-xl font-bold text-gray-900" }, "Scan your food"),
                  React.createElement("button", {
                    onClick: () => setShowScanner(false),
                    className: "text-sm text-blue-600 hover:text-blue-700 font-medium"
                  }, "Back to search")
                ),
                React.createElement(AIFoodScannerPanel, { onFoodAdded: handleFoodAdded })
              )
            ) : (
              React.createElement(FoodSearchWithMeasurement, {
                onFoodAdded: handleFoodAdded,
                onAIScanClick: () => setShowScanner(true)
              })
            )
          ) : (
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
              React.createElement("p", { className: "text-gray-500 font-medium" }, "Viewing Past Date"),
              React.createElement("p", { className: "text-sm text-gray-400 mt-1" }, 
                "You can only add food to today's log."
              ),
              React.createElement("button", {
                onClick: () => setSelectedDate(new Date()),
                className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              },
                "Go to Today"
              )
            )
          )
        ),

        /* Right Column: Daily Summary and Meal Breakdown */
        React.createElement("div", { className: "lg:col-span-2 flex flex-col space-y-6" },
          React.createElement(DailySummaryCards, { summary: dailySummary }),
          React.createElement(DailyMealBreakdownPanel, {
            mealBreakdown: dayLogs,
            onDeleteLog: handleDeleteLog,
            onUpdateLog: handleUpdateLog,
            canEdit: isToday
          })
        )
      )
    )
  );
};

export default MealLogPage;
