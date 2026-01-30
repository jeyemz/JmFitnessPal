import React from 'react';

const SystemHealthOverviewCard = ({ title, value, statusText, status }) => {
  let dotColorClass = '';
  let textColorClass = '';

  switch (status) {
    case 'good':
      dotColorClass = 'bg-green-500';
      textColorClass = 'text-green-700';
      break;
    case 'warning':
      dotColorClass = 'bg-orange-500';
      textColorClass = 'text-orange-700';
      break;
    case 'critical':
      dotColorClass = 'bg-red-500';
      textColorClass = 'text-red-700';
      break;
    default:
      dotColorClass = 'bg-gray-400';
      textColorClass = 'text-gray-600';
  }

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between" },
      React.createElement("div", { className: "flex items-start justify-between mb-4" },
        React.createElement("h3", { className: "text-sm uppercase text-gray-500 font-medium" }, title),
        React.createElement("span", { className: `w-3 h-3 rounded-full ${dotColorClass}` })
      ),
      React.createElement("div", null,
        React.createElement("p", { className: "text-4xl font-bold text-gray-900 mb-1" }, value, React.createElement("span", { className: "text-xl" }, "%")),
        React.createElement("p", { className: `text-sm ${textColorClass}` }, statusText)
      )
    )
  );
};

export default SystemHealthOverviewCard;