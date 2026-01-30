import React from 'react';

const MetricCard = ({ title, value, subLabel, subText, icon, change, status }) => {
  const isGrowth = status === 'growth';
  const changeColorClass = isGrowth ? 'text-green-500' : 'text-red-500';
  const arrowIcon = isGrowth ? (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 inline-block" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" })
    )
  ) : (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 inline-block" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" })
    )
  );

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between" },
      React.createElement("div", { className: "flex items-start justify-between mb-4" },
        React.createElement("h3", { className: "text-sm uppercase text-gray-500 font-medium" }, title),
        subLabel && React.createElement("span", { className: "text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700" }, subLabel)
      ),
      React.createElement("div", { className: "flex items-end justify-between" },
        React.createElement("div", null,
          React.createElement("p", { className: "text-4xl font-bold text-gray-900" }, value.toLocaleString()),
          subText && React.createElement("p", { className: "text-sm text-gray-500 mt-1" }, subText)
        ),
        change && (
          React.createElement("p", { className: `text-sm font-semibold flex items-center ${changeColorClass}` },
            arrowIcon,
            change, "%"
          )
        ),
        icon && React.createElement("div", { className: "flex-shrink-0" }, icon)
      )
    )
  );
};

export default MetricCard;