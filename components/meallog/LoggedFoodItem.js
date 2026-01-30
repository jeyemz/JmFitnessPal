import React from 'react';
// Removed import of LoggedFoodItemData as it's a TypeScript type

const LoggedFoodItem = ({ item }) => {
  return (
    React.createElement("div", { className: "flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors duration-200" },
      React.createElement("div", { className: "flex items-center" },
        React.createElement("img", { src: item.imageUrl, alt: item.name, className: "w-12 h-12 rounded-lg object-cover mr-4 flex-shrink-0" }),
        React.createElement("div", null,
          React.createElement("p", { className: "font-semibold text-gray-800" }, item.name),
          React.createElement("div", { className: "flex items-center text-xs text-gray-500 mt-1" },
            item.description && React.createElement("span", { className: "mr-2" }, item.description),
            item.isVerified && (
              React.createElement("span", { className: "flex items-center text-green-700" },
                React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", className: "w-3 h-3 mr-1" },
                  React.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z", clipRule: "evenodd" })
                ),
                "AI Verified"
              )
            )
          )
        )
      ),
      React.createElement("div", { className: "text-right" },
        React.createElement("p", { className: "font-bold text-gray-900" }, item.calories, " kcal"),
        React.createElement("p", { className: "text-xs text-gray-600" },
          item.protein, "g P \u2022 ", item.carbs, "g C \u2022 ", item.fat, "g F"
        )
      )
    )
  );
};

export default LoggedFoodItem;