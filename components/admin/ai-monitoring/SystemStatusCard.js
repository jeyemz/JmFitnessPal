import React from 'react';

const SystemStatusCard = ({ status }) => {
  let textColorClass = '';
  switch (status) {
    case 'Healthy':
      textColorClass = 'text-green-600';
      break;
    case 'Warning':
      textColorClass = 'text-orange-600';
      break;
    case 'Critical':
      textColorClass = 'text-red-600';
      break;
    default:
      textColorClass = 'text-gray-600';
  }

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between" },
      React.createElement("h3", { className: "text-sm uppercase text-gray-500 font-medium mb-4" }, "SYSTEM STATUS"),
      React.createElement("p", { className: `text-6xl font-extrabold ${textColorClass}` }, `${status}.`)
    )
  );
};

export default SystemStatusCard;
