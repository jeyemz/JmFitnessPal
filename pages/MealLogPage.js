import React, { useState, useEffect } from 'react';
import MealLogHeader from '../components/meallog/MealLogHeader.js';
import FoodSearchWithMeasurement from '../components/meallog/FoodSearchWithMeasurement.js';
import AIFoodScannerPanel from '../components/meallog/AIFoodScannerPanel.js';
import DailySummaryCards from '../components/meallog/DailySummaryCards.js';
import DailyMealBreakdownPanel from '../components/meallog/DailyMealBreakdownPanel.js';
import { foodLogAPI } from '../services/api.js';

const MealLogPage = ({ onNavigate, user }) => {
  const today = new Date();
  // Fix: Used literal types for Intl.DateTimeFormatOptions properties
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);
  
  const [dailySummary, setDailySummary] = useState({
    totalCalories: 0,
    protein: { value: 0, percentage: 0 },
    carbs: { value: 0, percentage: 0 },
    fats: { value: 0, percentage: 0 }
  });
  const [todayLogs, setTodayLogs] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get user goals
  const userGoals = user?.goals || {};
  const proteinGoal = userGoals.proteinGoal || 150;
  const carbsGoal = userGoals.carbsGoal || 250;
  const fatGoal = userGoals.fatGoal || 65;

  // Fetch daily data
  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        // Fetch daily summary
        const summaryResponse = await foodLogAPI.getDailySummary();
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
        }

        // Fetch today's logs
        const logsResponse = await foodLogAPI.getTodayLogs();
        if (logsResponse.logs) {
          // Group by meal type
          const grouped = logsResponse.logs.reduce((acc, log) => {
            const mealType = log.mealType.toLowerCase();
            if (!acc[mealType]) {
              acc[mealType] = { name: log.mealType, items: [], totalCalories: 0 };
            }
            acc[mealType].items.push({
              id: log.id,
              name: log.foodName,
              calories: log.calories,
              time: 'Today'
            });
            acc[mealType].totalCalories += log.calories;
            return acc;
          }, {});
          setTodayLogs(Object.values(grouped));
        }
      } catch (error) {
        console.log('Could not fetch daily data');
      }
    };

    fetchDailyData();
  }, [refreshKey, proteinGoal, carbsGoal, fatGoal]);

  const handleFoodAdded = () => {
    // Trigger refresh of daily data
    setRefreshKey(prev => prev + 1);
  };

  return (
    React.createElement("div", { className: "flex-1 p-6 overflow-auto" },
      /* Header for Meal Log Page */
      React.createElement(MealLogHeader, {
        title: "Meal & Food Log",
        subtitle: formattedDate
      }),

      React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
        /* Left Column: Food Search with Measurement and AI Scanner */
        React.createElement("div", { className: "lg:col-span-1 flex flex-col space-y-6" },
          React.createElement(FoodSearchWithMeasurement, { onFoodAdded: handleFoodAdded }),
          React.createElement(AIFoodScannerPanel, null)
        ),

        /* Right Column: Daily Summary and Meal Breakdown */
        React.createElement("div", { className: "lg:col-span-2 flex flex-col space-y-6" },
          React.createElement(DailySummaryCards, { summary: dailySummary }),
          React.createElement(DailyMealBreakdownPanel, { mealBreakdown: todayLogs })
        )
      )
    )
  );
};

export default MealLogPage;
