
import React, { useState, useEffect } from 'react';
import CalorieProgressCard from './CalorieProgressCard.js';
import MacroProgressCard from './MacroProgressCard.js';
import MealLog from './MealLog.js';
import FoodScannerCard from './FoodScannerCard.js';
import DashboardTopBar from './DashboardTopBar.js';
import { foodLogAPI } from '../../services/api.js';

const MainDashboardContent = ({ onNavigate, user, onLogout }) => {
  const today = new Date();
  // Fix: Used literal types for Intl.DateTimeFormatOptions properties
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);
  
  // Get calorie and macro goals from user object (passed from login)
  const userGoals = user?.goals || {};
  const calorieGoal = userGoals.dailyCalorieGoal || 2000;
  const proteinGoal = userGoals.proteinGoal || 150;
  const carbsGoal = userGoals.carbsGoal || 250;
  const fatGoal = userGoals.fatGoal || 65;

  // State for daily summary (intake values from API)
  const [dailySummary, setDailySummary] = useState({
    intake: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  // State for today's meal logs
  const [todayMeals, setTodayMeals] = useState([]);

  // Fetch daily summary and today's logs on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [summaryRes, logsRes] = await Promise.all([
          foodLogAPI.getDailySummary(),
          foodLogAPI.getTodayLogs()
        ]);
        if (summaryRes.summary) {
          setDailySummary({
            intake: summaryRes.summary.intake || 0,
            protein: summaryRes.summary.protein?.current || 0,
            carbs: summaryRes.summary.carbs?.current || 0,
            fat: summaryRes.summary.fat?.current || 0
          });
        }
        if (logsRes.logs && logsRes.logs.length > 0) {
          setTodayMeals(logsRes.logs.map((log) => ({
            id: log.id,
            name: log.foodName,
            time: log.mealType,
            imageUrl: log.imageUrl,
            calories: Math.round(log.calories || 0),
            protein: Math.round(log.protein || 0),
            carbs: Math.round(log.carbs || 0),
            fat: Math.round(log.fat || 0),
            isVerified: false,
            entryType: log.mealType
          })));
        } else {
          setTodayMeals([]);
        }
      } catch (error) {
        console.log('Could not fetch dashboard data:', error);
      }
    };

    fetchData();
  }, [user]);

  // Build summary object with user's goals
  const summary = {
    intake: dailySummary.intake,
    goal: calorieGoal,
    protein: { current: dailySummary.protein, goal: proteinGoal },
    carbs: { current: dailySummary.carbs, goal: carbsGoal },
    fat: { current: dailySummary.fat, goal: fatGoal }
  };

  return (
    React.createElement("div", { className: "flex-1 p-4 sm:p-6 overflow-auto" },
      /* Dashboard Header */
      React.createElement(DashboardTopBar, { title: "Daily Dashboard", subtitle: formattedDate, showSearchBar: false, user: user, onLogout: onLogout }),

      /* Daily Summary Grid */
      React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6" },
        React.createElement(CalorieProgressCard, { intake: summary.intake, goal: summary.goal }),
        React.createElement(MacroProgressCard, {
          icon: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 6V3.75A2.25 2.25 0 0013.5 1.5H10.5a2.25 2.25 0 00-2.25 2.25V6m-1.5 9V9a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0122.5 9v7.5M16.5 12h-6m6 0a2.25 2.25 0 002.25-2.25V10.5a2.25 2.25 0 00-2.25-2.25H9.75A2.25 2.25 0 007.5 10.5v1.5m6-1.5a2.25 2.25 0 012.25-2.25h-6M10.5 20.25h.008v.008H10.5v-.008zm.375 0h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008z" })),
          title: "Protein",
          currentValue: summary.protein.current,
          goalValue: summary.protein.goal,
          unit: "g",
          progressBarColor: "bg-orange-500"
        }),
        React.createElement(MacroProgressCard, {
          icon: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" })),
          title: "Carbs",
          currentValue: summary.carbs.current,
          goalValue: summary.carbs.goal,
          unit: "g",
          progressBarColor: "bg-blue-500"
        }),
        React.createElement(MacroProgressCard, {
          icon: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" }), React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" })),
          title: "Fats",
          currentValue: summary.fat.current,
          goalValue: summary.fat.goal,
          unit: "g",
          progressBarColor: "bg-green-500"
        })
      ),

      /* Meals and AI Scanner */
      React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" },
        React.createElement(MealLog, { onNavigate: onNavigate, meals: todayMeals }),
        React.createElement(FoodScannerCard, null)
      )
    )
  );
};

export default MainDashboardContent;
