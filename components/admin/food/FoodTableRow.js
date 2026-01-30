import React from 'react';
import FoodSourceBadge from './FoodSourceBadge.js';
import FoodActionButtons from './FoodActionButtons.js';

const FoodTableRow = ({ food, onApprove, onReject }) => {
  return (
    React.createElement("tr", { className: "border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150", role: "row" },
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium" },
        React.createElement("p", null, food.name),
        React.createElement("p", { className: "text-xs text-gray-500" }, food.description)
      ),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600" }, food.calories, " kcal"),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600" }, food.protein, "g"),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600" }, food.carbs, "g"),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600" }, food.fats, "g"),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm" },
        React.createElement(FoodSourceBadge, { source: food.source })
      ),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium" },
        React.createElement(FoodActionButtons, { foodId: food.id, onApprove: onApprove, onReject: onReject, status: food.status })
      )
    )
  );
};

export default FoodTableRow;