import React from 'react';
import MealCategorySection from './MealCategorySection.js';
import Button from '../Button.js';
// Removed import of MealCategoryData as it's a TypeScript type

const DailyMealBreakdownPanel = ({ mealBreakdown }) => {
  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
      mealBreakdown.length > 0 ? (
        mealBreakdown.map((category) => (
          React.createElement(React.Fragment, { key: category.id },
            React.createElement(MealCategorySection, { category: category }),
            category.id === 'm3' && category.items.length === 0 && ( // Assuming 'm3' is Dinner
              React.createElement("div", { className: "flex justify-center mt-6 mb-4" },
                React.createElement(Button, { variant: "primary", className: "text-sm py-3 px-6", onClick: () => console.log('Log Dinner clicked from Meal Breakdown') },
                  React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2.5, stroke: "currentColor", className: "w-5 h-5 mr-2" },
                    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" })
                  ),
                  "Log Dinner"
                )
              )
            )
          )
        ))
      ) : (
        React.createElement("p", { className: "text-sm text-gray-500 text-center" }, "No meals logged yet.")
      )
    )
  );
};

export default DailyMealBreakdownPanel;
