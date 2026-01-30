import React from 'react';
// Removed import of SearchResultFoodItem as it's a TypeScript type

const SearchResultItem = ({ item, onAddItem }) => {
  return (
    React.createElement("div", { className: "flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200" },
      React.createElement("div", { className: "flex items-center" },
        item.iconUrl && (
          React.createElement("div", { className: `w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${item.iconBgColor || 'bg-gray-100'}` },
            React.createElement("img", { src: item.iconUrl, alt: item.name, className: "w-6 h-6" })
          )
        ) ,
        React.createElement("div", null,
          React.createElement("p", { className: "font-semibold text-gray-800" }, item.name),
          React.createElement("p", { className: "text-sm text-gray-500" }, item.description)
        )
      ),
      React.createElement("button", {
        onClick: () => onAddItem && onAddItem(item),
        className: "p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200",
        "aria-label": `Add ${item.name}`
      },
        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2.5, stroke: "currentColor", className: "w-5 h-5" },
          React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" })
        )
      )
    )
  );
};

export default SearchResultItem;