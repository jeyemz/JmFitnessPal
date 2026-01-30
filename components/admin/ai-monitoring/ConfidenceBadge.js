import React from 'react';

const ConfidenceBadge = ({ level }) => {
  let bgColor, textColor;

  switch (level) {
    case 'High':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'Medium':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      break;
    case 'Low':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }

  return (
    React.createElement("span", { className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}` }, level)
  );
};

export default ConfidenceBadge;
