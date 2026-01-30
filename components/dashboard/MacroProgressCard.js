import React from 'react';

const MacroProgressCard = ({
  icon,
  title,
  currentValue,
  goalValue,
  unit,
  progressBarColor,
}) => {
  const percentage = Math.min(100, (currentValue / goalValue) * 100);

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col" },
      React.createElement("div", { className: "flex justify-between items-center mb-4" },
        React.createElement("div", { className: `p-2 rounded-full ${progressBarColor.replace('bg-', 'bg-').replace('500', '100')}` },
          React.cloneElement(icon, { className: `w-6 h-6 ${progressBarColor.replace('bg-', 'text-')}` })
        ),
        React.createElement("span", { className: `text-sm font-semibold ${progressBarColor.replace('bg-', 'text-')}` }, Math.round(percentage), "%")
      ),
      React.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, title),
      React.createElement("p", { className: "text-sm text-gray-600 mb-4" },
        currentValue, unit, " / ", goalValue, unit
      ),
      React.createElement("div", { className: "w-full bg-gray-200 rounded-full h-2.5" },
        React.createElement("div", {
          className: `h-2.5 rounded-full transition-all duration-500 ease-out ${progressBarColor}`,
          style: { width: `${percentage}%` }
        })
      )
    )
  );
};

export default MacroProgressCard;