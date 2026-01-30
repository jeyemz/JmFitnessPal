import React from 'react';
import ActivityItem from './ActivityItem.js';

const RecentActivityCard = ({ activityData, onViewAll }) => {
  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex flex-col" },
      React.createElement("div", { className: "flex justify-between items-center mb-6" },
        React.createElement("h3", { className: "text-xl font-bold text-gray-900" }, "Recent Activity"),
        React.createElement("button", { onClick: onViewAll, className: "text-blue-600 hover:underline text-sm font-medium" },
          "View All"
        )
      ),
      React.createElement("div", { className: "space-y-4 flex-grow overflow-auto pr-2" },
        activityData.length > 0 ? (
          activityData.map((activity) => (
            React.createElement(ActivityItem, { key: activity.id, activity: activity })
          ))
        ) : (
          React.createElement("p", { className: "text-sm text-gray-500" }, "No recent activity yet.")
        )
      )
    )
  );
};

export default RecentActivityCard;
