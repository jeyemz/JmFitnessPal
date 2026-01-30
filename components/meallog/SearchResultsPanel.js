import React from 'react';
import SearchResultItem from './SearchResultItem.js';
// Removed import of SearchResultFoodItem as it's a TypeScript type

const SearchResultsPanel = ({ results }) => {
  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
      React.createElement("div", { className: "flex justify-between items-center mb-4" },
        React.createElement("h2", { className: "text-xl font-bold text-gray-900" }, "Search Results"),
        React.createElement("a", { href: "#", className: "text-blue-600 hover:underline text-sm font-medium flex items-center" },
          React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 mr-1" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" })
          ),
          "Add Custom Food"
        )
      ),
      React.createElement("div", { className: "space-y-3" },
        results.length > 0 ? (
          results.map((item) => (
            React.createElement(SearchResultItem, { key: item.id, item: item, onAddItem: (addedItem) => console.log('Add item:', addedItem) })
          ))
        ) : (
          React.createElement("p", { className: "text-sm text-gray-500" }, "No results yet.")
        )
      )
    )
  );
};

export default SearchResultsPanel;
