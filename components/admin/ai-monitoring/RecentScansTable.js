import React from 'react';
import ScanTableRow from './ScanTableRow.js'; // Ensure correct import path

const RecentScansTable = ({ scans, onEditScan, showAllScans, onViewAllLogs }) => {
  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
      React.createElement("div", { className: "overflow-x-auto" },
        React.createElement("table", { className: "min-w-full divide-y divide-gray-200", role: "table", "aria-label": "Recent AI Scans" },
          React.createElement("thead", { className: "bg-gray-50" },
            React.createElement("tr", { role: "row" },
              React.createElement("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Food Name"),
              React.createElement("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Calories"),
              React.createElement("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Confidence"),
              React.createElement("th", { scope: "col", className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Action")
            )
          ),
          React.createElement("tbody", { className: "bg-white divide-y divide-gray-200", role: "rowgroup" },
            scans.map((scan) => (
              React.createElement(ScanTableRow, { key: scan.id, scan: scan, onEditScan: onEditScan })
            ))
          )
        )
      ),

      React.createElement("div", { className: "mt-6 flex justify-between items-center text-sm text-gray-600" },
        React.createElement("p", null, "Showing ", scans.length, " most recent scans"),
        !showAllScans &&
          React.createElement("button", { onClick: onViewAllLogs, className: "text-blue-600 hover:underline font-medium" }, "View All Logs")
      )
    )
  );
};

export default RecentScansTable;
