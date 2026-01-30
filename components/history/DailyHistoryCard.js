
import React, { useState } from 'react';
import MealItem from '../dashboard/MealItem.js'; // Explicitly reference .js

// Removed Meal and DailyHistoryEntry interfaces

// Fix: Added onNavigate to props
const DailyHistoryCard = ({ entry, onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const today = new Date();

  const { date, caloriesConsumed, calorieGoal, goalStatus, mealsSummary, detailedMeals } = entry;

  const dateFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const dayOfMonth = date.getDate();
  const formattedDate = dateFormatter.format(date);
  const getRelativeDateString = (targetDate, referenceDate) => {
    const dayMs = 24 * 60 * 60 * 1000;
    const diffDays = Math.floor((referenceDate - targetDate) / dayMs);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const relativeDate = getRelativeDateString(date, today);

  const goalMet = goalStatus === 'met';
  const statusClasses = goalMet
    ? 'bg-green-100 text-green-700'
    : 'bg-orange-100 text-orange-700';
  const statusIcon = goalMet
    ? (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", className: "w-4 h-4 mr-1" },
        React.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z", clipRule: "evenodd" })
      )
    ) : (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", className: "w-4 h-4 mr-1" },
        React.createElement("path", { fillRule: "evenodd", d: "M8.484 2.223a.75.75 0 011.032 0L19.58 11.25a.75.75 0 01-.515 1.29H5.935a.75.75 0 01-.515-1.29L8.484 2.223zM10.975 14.5c.089-.447-.282-.9-.75-.9s-.839.453-.75.9l.25 1.25c.089.447.453.75.9.75s.811-.303.9-.75l.25-1.25z", clipRule: "evenodd" })
      )
    );

  const mealOrder = ['breakfast', 'lunch', 'snack', 'dinner'];

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
      React.createElement("div", { className: "flex items-center justify-between mb-4" },
        React.createElement("div", { className: "flex items-center" },
          React.createElement("div", { className: "bg-blue-50 text-blue-700 font-bold p-2 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0" },
            dayOfMonth
          ),
          React.createElement("div", null,
            React.createElement("p", { className: "font-semibold text-gray-900" }, formattedDate),
            React.createElement("p", { className: "text-sm text-gray-500" }, relativeDate)
          )
        ),

        React.createElement("div", { className: "flex items-center space-x-4" },
          React.createElement("div", { className: "text-right" },
            React.createElement("p", { className: "text-xs text-gray-500 uppercase font-medium" }, "Calories"),
            React.createElement("p", { className: "font-bold text-gray-900 text-lg" },
              caloriesConsumed.toLocaleString(), " ",
              React.createElement("span", { className: "text-sm text-gray-500" }, "/ ", calorieGoal.toLocaleString())
            )
          ),
          React.createElement("span", { className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClasses}`, "aria-label": goalMet ? 'Goal Met' : 'Over Goal' },
            statusIcon,
            goalMet ? 'Goal Met' : 'Over Goal'
          ),
          React.createElement("button", {
            onClick: () => setIsExpanded(!isExpanded),
            className: "p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200",
            "aria-expanded": isExpanded,
            "aria-controls": `detailed-breakdown-${entry.id}`,
            "aria-label": isExpanded ? 'Collapse detailed breakdown' : 'View detailed breakdown'
          },
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: `w-5 h-5 text-gray-600 ${isExpanded ? 'rotate-180' : ''} transition-transform duration-200` },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 15.75l7.5-7.5 7.5 7.5" })
            )
          )
        )
      ),

      React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4" },
        mealOrder.map((mealType) => mealsSummary[mealType] && (
          React.createElement("div", { key: mealType, className: "flex flex-col items-center p-2 bg-gray-50 rounded-lg" },
            React.createElement("span", { className: "text-xs uppercase text-gray-500 mb-1" }, mealType),
            React.createElement("span", { className: "text-sm font-medium text-gray-800" }, mealsSummary[mealType])
          )
        ))
      ),

      isExpanded && detailedMeals && detailedMeals.length > 0 && (
        React.createElement("div", { id: `detailed-breakdown-${entry.id}`, className: "mt-6 border-t border-gray-100 pt-4 animate-fade-in" },
          React.createElement("h3", { className: "text-lg font-bold text-gray-900 mb-4" }, "Detailed Breakdown"),
          React.createElement("div", { className: "space-y-2" },
            detailedMeals.map((meal) => (
              React.createElement(MealItem, { key: meal.id, meal: meal })
            ))
          )
        )
      ),

      isExpanded && !detailedMeals && (
        React.createElement("div", { id: `detailed-breakdown-${entry.id}`, className: "mt-6 border-t border-gray-100 pt-4 text-center text-gray-500 animate-fade-in" },
          "No detailed meals available for this day."
        )
      ),

      /* "View Detailed Breakdown" button (only if not expanded and has detailedMeals) */
      !isExpanded && detailedMeals && detailedMeals.length > 0 && (
         React.createElement("div", { className: "flex justify-center mt-4" },
         // Fix: Added children prop
         React.createElement("button", {
           onClick: () => setIsExpanded(true),
           className: "text-blue-600 hover:text-blue-700 flex items-center justify-center py-2 text-sm font-medium",
           "aria-controls": `detailed-breakdown-${entry.id}`,
           "aria-expanded": isExpanded
         },
           React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 mr-1" },
             React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" }),
             React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
           ),
           "View Detailed Breakdown"
         )
       )
      )
    )
  );
};

export default DailyHistoryCard;
