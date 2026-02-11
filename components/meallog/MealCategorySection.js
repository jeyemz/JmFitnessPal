import React from 'react';
import LoggedFoodItem from './LoggedFoodItem.js';
// Removed import of MealCategoryData as it's a TypeScript type

const MealCategorySection = ({ category, onDeleteLog, onUpdateLog, canEdit }) => {
  return (
    React.createElement("div", { className: "mb-8 last:mb-0" },
      React.createElement("div", { className: "flex items-baseline justify-between mb-4" },
        React.createElement("div", { className: "flex items-center gap-2 min-w-0" },
          category.icon && React.createElement("span", { className: "flex-shrink-0" }, category.icon),
          React.createElement("h3", { className: "text-lg sm:text-xl font-bold text-gray-900 truncate" }, category.name)
        ),
        React.createElement("div", { className: "ml-4 flex-shrink-0" },
          React.createElement("span", { className: "text-sm sm:text-base font-semibold text-gray-900 whitespace-nowrap" },
            (category.totalCalories || 0).toLocaleString(), " cal"
          )
        )
      ),
      React.createElement("div", { className: "space-y-3" },
        category.items.map((item) => (
          React.createElement(LoggedFoodItem, {
            key: item.id,
            item: item,
            onDeleteLog: onDeleteLog,
            onUpdateLog: onUpdateLog,
            canEdit: canEdit
          })
        ))
      )
    )
  );
};

export default MealCategorySection;