
import React from 'react';
import MealItem from './MealItem.js';

const MealLog = ({ onNavigate, meals = [] }) => {
  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
      React.createElement("div", { className: "flex justify-between items-center mb-4" },
        React.createElement("h2", { className: "text-xl font-bold text-gray-900" }, "Today's Meals"),
        React.createElement("button", { 
          onClick: () => onNavigate && onNavigate('history'),
          className: "text-blue-600 hover:underline text-sm font-medium cursor-pointer"
        },
          "View History"
        )
      ),
      React.createElement("div", { className: "space-y-2 mb-6" },
        meals.length > 0 ? (
          meals.map((meal) => (
            React.createElement(MealItem, { key: meal.id, meal: meal })
          ))
        ) : (
          React.createElement("p", { className: "text-sm text-gray-500" }, "No meals logged yet.")
        )
      ),
      React.createElement("button", {
        type: "button",
        onClick: () => onNavigate && onNavigate('meal-log'),
        className: "w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-colors"
      },
        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2.5, stroke: "currentColor", className: "w-5 h-5" },
          React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" })
        ),
        "Log Meal"
      )
    )
  );
};

export default MealLog;
