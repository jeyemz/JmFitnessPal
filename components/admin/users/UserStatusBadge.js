import React from 'react';

const UserStatusBadge = ({ status }) => {
  let bgColor, textColor, dotColor;

  switch (status) {
    case 'active':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      dotColor = 'bg-green-500';
      break;
    case 'inactive':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-700';
      dotColor = 'bg-gray-400';
      break;
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      dotColor = 'bg-yellow-500';
      break;
    case 'suspended':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      dotColor = 'bg-red-500';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-700';
      dotColor = 'bg-gray-400';
  }

  return (
    React.createElement("span", { className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}` },
      React.createElement("span", { className: `w-2 h-2 rounded-full ${dotColor} mr-1.5` }),
      status.charAt(0).toUpperCase() + status.slice(1)
    )
  );
};

export default UserStatusBadge;