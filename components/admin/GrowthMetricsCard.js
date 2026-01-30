import React, { useState } from 'react';

const GrowthMetricsCard = ({ mealLoggingData, userRetentionData }) => {
  const [activePeriod, setActivePeriod] = useState('90Days'); // '30Days' or '90Days'

  const renderMetric = (data) => {
    if (!data) {
      return React.createElement("div", { className: "flex items-center text-sm text-gray-500" }, "No data yet.");
    }

    const isIncrease = data.status === 'increase' || data.status === 'improvement';
    const changeColorClass = isIncrease ? 'text-green-500' : 'text-red-500';
    const arrowIcon = isIncrease ? (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 inline-block -rotate-45" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" })
      )
    ) : (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 inline-block rotate-135" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" })
      )
    );

    return (
      React.createElement("div", { className: "flex items-start" },
        React.createElement("div", { className: "p-3 rounded-full bg-gray-100 mr-4" },
          data.icon ? React.cloneElement(data.icon, { className: data.icon.props.className + ' opacity-80' }) : React.createElement("span", { className: "text-gray-400 text-xs" }, "—")
        ),
        React.createElement("div", null,
          React.createElement("p", { className: "text-sm uppercase text-gray-500 font-medium" }, data.label),
          React.createElement("p", { className: "text-3xl font-bold text-gray-900" }, data.value.toLocaleString(), data.label.includes('Retention') ? '%' : ''),
          React.createElement("p", { className: `text-sm font-semibold flex items-center ${changeColorClass}` },
            arrowIcon,
            data.change, "% ", data.periodText
          )
        )
      )
    );
  };

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
      React.createElement("div", { className: "flex justify-between items-center mb-6" },
        React.createElement("h3", { className: "text-xl font-bold text-gray-900" }, "Growth Metrics"),
        React.createElement("div", { className: "flex space-x-2" },
          React.createElement("button", {
            onClick: () => setActivePeriod('30Days'),
            className: `px-4 py-1 rounded-full text-sm font-medium ${
              activePeriod === '30Days' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`
          },
            "30 Days"
          ),
          React.createElement("button", {
            onClick: () => setActivePeriod('90Days'),
            className: `px-4 py-1 rounded-full text-sm font-medium ${
              activePeriod === '90Days' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`
          },
            "90 Days"
          )
        )
      ),

      React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8" },
        renderMetric(mealLoggingData),
        renderMetric(userRetentionData)
      )
    )
  );
};

export default GrowthMetricsCard;
