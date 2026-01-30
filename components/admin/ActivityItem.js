import React from 'react';

const ActivityItem = ({ activity }) => {
  return (
    React.createElement("div", { className: "flex items-start space-x-3" },
      React.createElement("div", { className: `flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${activity.color}` },
        activity.tenantInitials
      ),
      React.createElement("div", { className: "flex-1" },
        React.createElement("p", { className: "text-gray-800 font-medium" }, activity.tenant),
        React.createElement("p", { className: "text-gray-600 text-sm" }, activity.description)
      ),
      React.createElement("span", { className: "text-xs text-gray-500 whitespace-nowrap" }, activity.timestamp)
    )
  );
};

export default ActivityItem;