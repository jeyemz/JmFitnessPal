import React from 'react';

const PlatformGrowthChart = ({ data, currentMonthChange }) => {
  if (!data || data.length === 0) {
    return (
      React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex flex-col" },
        React.createElement("div", { className: "flex justify-between items-center mb-6" },
          React.createElement("h3", { className: "text-xl font-bold text-gray-900" }, "Platform Growth"),
          React.createElement("span", { className: "bg-gray-100 text-gray-600 text-sm font-semibold px-3 py-1 rounded-full" }, currentMonthChange || "No data")
        ),
        React.createElement("p", { className: "text-gray-600 text-sm mb-4" }, "User acquisition over the last 6 months"),
        React.createElement("div", { className: "flex-grow h-48 w-full flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-lg" },
          "No growth data yet."
        )
      )
    );
  }

  // Find max value for scaling placeholder chart
  const maxUsers = Math.max(...data.map(d => d.users));
  const minUsers = Math.min(...data.map(d => d.users));

  // Normalize data points to a 0-100 range for SVG path drawing
  const normalizedData = data.map(d => ({
    month: d.month,
    // Ensure at least 1 unit difference to prevent division by zero or flat lines with no range
    normalizedUsers: maxUsers === minUsers ? 50 : ((d.users - minUsers) / (maxUsers - minUsers)) * 100,
  }));

  // Create SVG path points
  const points = normalizedData.map((d, i) => {
    const x = (i / (normalizedData.length - 1)) * 100;
    const y = 100 - d.normalizedUsers; // Invert Y for SVG (0,0 is top-left)
    return `${x},${y}`;
  }).join(' ');

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex flex-col" },
      React.createElement("div", { className: "flex justify-between items-center mb-6" },
        React.createElement("h3", { className: "text-xl font-bold text-gray-900" }, "Platform Growth"),
        React.createElement("span", { className: "bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full" },
          currentMonthChange
        )
      ),
      React.createElement("p", { className: "text-gray-600 text-sm mb-4" }, "User acquisition over the last 6 months"),

      /* Placeholder Chart */
      React.createElement("div", { className: "flex-grow relative h-48 w-full" },
        React.createElement("svg", { className: "w-full h-full", viewBox: "0 0 100 100", preserveAspectRatio: "none" },
          /* Grid Lines (optional, for visual guide) */
          React.createElement("line", { x1: "0", y1: "0", x2: "100", y2: "0", stroke: "#e5e7eb", strokeWidth: "0.5" }),
          React.createElement("line", { x1: "0", y1: "25", x2: "100", y2: "25", stroke: "#e5e7eb", strokeWidth: "0.5" }),
          React.createElement("line", { x1: "0", y1: "50", x2: "100", y2: "50", stroke: "#e5e7eb", strokeWidth: "0.5" }),
          React.createElement("line", { x1: "0", y1: "75", x2: "100", y2: "75", stroke: "#e5e7eb", strokeWidth: "0.5" }),
          React.createElement("line", { x1: "0", y1: "100", x2: "100", y2: "100", stroke: "#e5e7eb", strokeWidth: "0.5" }),

          /* Line Chart Path */
          React.createElement("polyline", {
            fill: "none",
            stroke: "#3b82f6",
            strokeWidth: "2",
            points: points
          }),

          /* Fill under the curve */
          React.createElement("polygon", {
            fill: "url(#chartGradient)",
            points: `0,100 ${points} 100,100`
          }),

          /* Gradient Definition */
          React.createElement("defs", null,
            React.createElement("linearGradient", { id: "chartGradient", x1: "0", x2: "0", y1: "0", y2: "1" },
              React.createElement("stop", { offset: "0%", stopColor: "#3b82f6", stopOpacity: "0.3" }),
              React.createElement("stop", { offset: "100%", stopColor: "#3b82f6", stopOpacity: "0" })
            )
          )
        ),
      ),

      /* X-axis labels (Months) */
      React.createElement("div", { className: "flex justify-between text-xs text-gray-500 mt-2 px-2" },
        data.map((d, index) => (
          React.createElement("span", { key: index, className: "text-center flex-1" }, d.month)
        ))
      )
    )
  );
};

export default PlatformGrowthChart;
