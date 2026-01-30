import React from 'react';

const FoodOverviewCard = ({ title, value, subtext, change, period, isPercentage, progressBarWidth }) => {
  const isPositiveChange = change > 0;
  const changeColorClass = isPositiveChange ? 'text-green-500' : 'text-red-500';
  const arrowIcon = isPositiveChange ? (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 inline-block -rotate-45" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" })
    )
  ) : (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 inline-block rotate-135" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" })
    )
  );

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between" },
      React.createElement("div", { className: "flex items-center justify-between mb-2" },
        React.createElement("h3", { className: "text-sm uppercase text-gray-500 font-medium" }, title)
      ),
      React.createElement("div", { className: "flex items-end justify-between" },
        React.createElement("div", null,
          React.createElement("p", { className: "text-4xl font-bold text-gray-900" }, value.toLocaleString(), isPercentage ? '%' : ''),
          subtext && React.createElement("p", { className: "text-sm text-gray-500 mt-1" }, subtext)
        ),
        change && (
          React.createElement("p", { className: `text-sm font-semibold flex items-center ${changeColorClass}` },
            arrowIcon,
            Math.abs(change).toLocaleString(),
            " ",
            period
          )
        )
      ),
      progressBarWidth && (
        React.createElement("div", { className: "w-full bg-gray-200 rounded-full h-2.5 mt-4" },
          React.createElement("div", {
            className: "bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out",
            style: { width: `${progressBarWidth}%` }
          })
        )
      )
    )
  );
};

export default FoodOverviewCard;