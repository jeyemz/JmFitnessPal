import React from 'react';

const SummaryCard = ({
  title,
  value,
  unit,
  percentage,
  colorClass,
  valueClassName = 'text-2xl',
}) => {
  const finalPercentage = Math.min(100, Math.max(0, percentage));
  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100" },
      React.createElement("p", { className: "text-sm uppercase text-gray-500 font-medium mb-2" }, title),
      React.createElement("p", { className: `${valueClassName} font-bold ${colorClass} mb-3` },
        value.toLocaleString(), " ",
        React.createElement("span", { className: "text-base text-gray-500" }, unit)
      ),
      React.createElement("div", { className: "w-full bg-gray-200 rounded-full h-2" },
        React.createElement("div", {
          className: `h-2 rounded-full transition-all duration-500 ease-out ${colorClass.replace('text-', 'bg-')}`,
          style: { width: `${finalPercentage}%` }
        })
      )
    )
  );
};

export default SummaryCard;