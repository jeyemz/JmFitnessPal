import React from 'react';
import ConfidenceBadge from './ConfidenceBadge.js'; // Ensure correct import path

const ScanTableRow = ({ scan, onEditScan }) => {
  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent row click from triggering (if it were clickable)
    onEditScan(scan.id);
  };

  return (
    React.createElement("tr", { className: "border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150", role: "row" },
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium" },
        React.createElement("div", { className: "flex items-center" },
          React.createElement("img", { src: scan.imageUrl, alt: scan.foodName, className: "w-10 h-10 rounded-lg object-cover mr-4" }),
          scan.foodName
        )
      ),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600" }, `${scan.calories} kcal`),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm" },
        React.createElement(ConfidenceBadge, { level: scan.confidence })
      ),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium" },
        React.createElement("button", { onClick: handleEditClick, className: "text-blue-600 hover:text-blue-900", "aria-label": `Edit ${scan.foodName}` }, "Edit")
      )
    )
  );
};

export default ScanTableRow;
