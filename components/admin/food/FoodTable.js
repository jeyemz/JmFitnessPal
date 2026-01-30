import React from 'react';
import FoodTableRow from './FoodTableRow.js';
import Pagination from '../users/Pagination.js'; // Reusing Pagination component
import { FOOD_CATEGORIES, FOOD_SOURCES } from '../../../data/adminFoodData.js';

const FoodTable = ({
  foodItems,
  totalResults,
  resultsPerPage,
  currentPage,
  onPageChange,
  onSort,
  onApproveFood,
  onRejectFood,
  onSearchTermChange,
  searchTerm,
  onCategoryFilterChange,
  onSourceFilterChange,
  selectedCategory,
  selectedSource,
}) => {
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const tableHeaders = [
    { key: 'name', label: 'Food Name' },
    { key: 'calories', label: 'Calories' },
    { key: 'protein', label: 'Protein' },
    { key: 'carbs', label: 'Carbs' },
    { key: 'fats', label: 'Fats' },
    { key: 'source', label: 'Source' },
    { key: 'actions', label: 'Actions' },
  ];

  const renderSortIcon = (columnKey) => {
    // Placeholder for sort icon, actual sorting logic would be implemented in parent
    return (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 ml-1 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 9l4-4 4 4m0 6l-4 4-4-4" })
      )
    );
  };

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
      React.createElement("div", { className: "mb-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4" },
        React.createElement("div", { className: "relative w-full md:w-auto flex-grow" },
          React.createElement("input", {
            type: "text",
            placeholder: "Search food names, brands, or IDs...",
            className: "pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 w-full",
            value: searchTerm,
            onChange: (e) => onSearchTermChange(e.target.value),
            "aria-label": "Search food items"
          }),
          React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" })
          )
        ),
        React.createElement("div", { className: "flex items-center space-x-4 w-full md:w-auto" },
          React.createElement("div", { className: "relative w-1/2 md:w-auto" },
            React.createElement("select", {
              className: "block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-full leading-tight focus:outline-none focus:bg-white focus:border-blue-500",
              onChange: (e) => onCategoryFilterChange(e.target.value),
              value: selectedCategory,
              "aria-label": "Filter by category"
            },
              FOOD_CATEGORIES.map((category) => (
                React.createElement("option", { key: category, value: category }, category)
              ))
            ),
            React.createElement("div", { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700" },
              React.createElement("svg", { className: "fill-current h-4 w-4", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" },
                React.createElement("path", { d: "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.043 6.871 4.636 8.278z" })
              )
            )
          ),
          React.createElement("div", { className: "relative w-1/2 md:w-auto" },
            React.createElement("select", {
              className: "block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-full leading-tight focus:outline-none focus:bg-white focus:border-blue-500",
              onChange: (e) => onSourceFilterChange(e.target.value),
              value: selectedSource,
              "aria-label": "Filter by source"
            },
              FOOD_SOURCES.map((source) => (
                React.createElement("option", { key: source, value: source }, source)
              ))
            ),
            React.createElement("div", { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700" },
              React.createElement("svg", { className: "fill-current h-4 w-4", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" },
                React.createElement("path", { d: "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.043 6.871 4.636 8.278z" })
              )
            )
          ),
          React.createElement("button", { className: "p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200", "aria-label": "More filters" },
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0M3.75 18H7.5m3-6h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0M3.75 12H7.5" })
            )
          )
        )
      ),

      React.createElement("div", { className: "overflow-x-auto" },
        React.createElement("table", { className: "min-w-full divide-y divide-gray-200", role: "table", "aria-label": "Food items list" },
          React.createElement("thead", { className: "bg-gray-50" },
            React.createElement("tr", { role: "row" },
              tableHeaders.map((header) => (
                React.createElement("th", {
                  key: header.key,
                  scope: "col",
                  className: `px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${header.key === 'actions' ? 'text-right' : ''}`,
                  onClick: () => onSort(header.key),
                  "aria-sort": "none", // Placeholder, actual sort state would be managed
                  tabIndex: 0,
                  role: "columnheader"
                },
                  React.createElement("div", { className: "flex items-center" },
                    header.label,
                    header.key !== 'actions' && renderSortIcon(header.key)
                  )
                )
              ))
            )
          ),
          React.createElement("tbody", { className: "bg-white divide-y divide-gray-200", role: "rowgroup" },
            foodItems.length > 0 ? (
              foodItems.map((food) => (
                React.createElement(FoodTableRow, {
                  key: food.id,
                  food: food,
                  onApprove: onApproveFood,
                  onReject: onRejectFood
                })
              ))
            ) : (
              React.createElement("tr", null,
                React.createElement("td", { colSpan: tableHeaders.length, className: "px-6 py-8 text-center text-sm text-gray-500" }, "No food items yet.")
              )
            )
          )
        )
      ),

      React.createElement("div", { className: "mt-6 flex justify-between items-center" },
        React.createElement("div", { className: "text-sm text-gray-600", "aria-live": "polite" },
          "Showing ", totalResults === 0 ? 0 : (currentPage - 1) * resultsPerPage + 1, " to ", totalResults === 0 ? 0 : Math.min(currentPage * resultsPerPage, totalResults), " of ", totalResults, " entries"
        ),
        totalPages > 1 && React.createElement(Pagination, { currentPage: currentPage, totalPages: totalPages, onPageChange: onPageChange })
      )
    )
  );
};

export default FoodTable;
