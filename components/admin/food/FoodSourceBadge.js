import React from 'react';

const FoodSourceBadge = ({ source }) => {
  let bgColor, textColor, dotColor;

  if (source.startsWith('AI Analysis')) {
    bgColor = 'bg-purple-100';
    textColor = 'text-purple-800';
    dotColor = 'bg-purple-500';
  } else { // User Submitted
    bgColor = 'bg-orange-100';
    textColor = 'text-orange-800';
    dotColor = 'bg-orange-500';
  }

  return (
    React.createElement("span", { className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}` },
      React.createElement("span", { className: `w-2 h-2 rounded-full ${dotColor} mr-1.5` }),
      source
    )
  );
};

export default FoodSourceBadge;