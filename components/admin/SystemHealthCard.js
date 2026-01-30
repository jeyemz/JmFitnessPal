import React from 'react';

const SystemHealthCard = ({ title, value, statusText }) => {
  const dotColorClass = value >= 99.0 ? 'bg-green-500' : 'bg-orange-500'; // Green for high uptime, orange for slightly lower

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between" },
      React.createElement("div", { className: "flex items-start justify-between mb-4" },
        React.createElement("h3", { className: "text-sm uppercase text-gray-500 font-medium" }, title),
        React.createElement("span", { className: `w-3 h-3 rounded-full ${dotColorClass}` })
      ),
      React.createElement("div", null,
        React.createElement("p", { className: "text-4xl font-bold text-gray-900 mb-1" }, value, React.createElement("span", { className: "text-xl" }, "%")),
        React.createElement("p", { className: "text-sm text-gray-500" }, statusText)
      )
    )
  );
};

export default SystemHealthCard;