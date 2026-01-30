import React from 'react';

const OverviewMetricCard = ({ title, value, change, changePeriod, status, icon }) => {
  const isGrowth = status === 'growth';
  const changeColorClass = isGrowth ? 'text-green-500' : 'text-red-500';
  const arrowIcon = isGrowth ? (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 inline-block mr-1" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 18L9 11.25l4.309 4.309a1.125 1.125 0 001.995 0l1.755-1.755m-1.755 0L21.75 10.5m0 0l-7.5-7.5" })
    )
  ) : (
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 inline-block mr-1 rotate-180" },
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 18L9 11.25l4.309 4.309a1.125 1.125 0 001.995 0l1.755-1.755m-1.755 0L21.75 10.5m0 0l-7.5-7.5" })
    )
  );

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between" },
      React.createElement("div", { className: "flex items-start justify-between mb-4" },
        React.createElement("h3", { className: "text-sm uppercase text-gray-500 font-medium" }, title),
        icon && React.createElement("div", { className: "flex-shrink-0" }, icon)
      ),
      React.createElement("div", { className: "flex items-end justify-between" },
        React.createElement("div", null,
          React.createElement("p", { className: "text-4xl font-bold text-gray-900" }, value.toLocaleString()),
          change && changePeriod && React.createElement("p", { className: `text-sm font-semibold flex items-center mt-2 ${changeColorClass}` },
            arrowIcon,
            change, "% ", changePeriod
          )
        )
      )
    )
  );
};

export default OverviewMetricCard;