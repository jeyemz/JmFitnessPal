import React from 'react';
import LoggedFoodItem from './LoggedFoodItem.js';
// Removed import of MealCategoryData as it's a TypeScript type

const MealCategorySection = ({ category }) => {
  return (
    React.createElement("div", { className: "mb-8 last:mb-0" },
      React.createElement("div", { className: "flex justify-between items-center mb-4" },
        React.createElement("div", { className: "flex items-center" },
          category.icon && React.createElement("span", { className: "mr-2" }, category.icon),
          React.createElement("h3", { className: "text-xl font-bold text-gray-900" }, category.name)
        ),
        React.createElement("span", { className: "text-lg font-bold text-gray-900" }, category.totalCalories.toLocaleString(), " kcal")
      ),
      React.createElement("div", { className: "space-y-3" },
        category.items.map((item) => (
          React.createElement(LoggedFoodItem, { key: item.id, item: item })
        ))
      )
    )
  );
};

export default MealCategorySection;