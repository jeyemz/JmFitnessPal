import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    React.createElement("div", { className: "flex items-center justify-end space-x-2 text-sm font-medium text-gray-700" },
      React.createElement("button", {
        onClick: () => onPageChange(currentPage - 1),
        disabled: currentPage === 1,
        className: "p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      },
        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
          React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 19.5L8.25 12l7.5-7.5" })
        )
      ),
      pages.map((page) => (
        React.createElement("button", {
          key: page,
          onClick: () => onPageChange(page),
          className: `px-3 py-1.5 rounded-md ${
            page === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
          } transition-colors`
        },
          page
        )
      )),
      React.createElement("button", {
        onClick: () => onPageChange(currentPage + 1),
        disabled: currentPage === totalPages,
        className: "p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      },
        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
          React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.25 4.5l7.5 7.5-7.5 7.5" })
        )
      )
    )
  );
};

export default Pagination;