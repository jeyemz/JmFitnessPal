import React from 'react';

const FoodStatusTabs = ({ activeTab, onTabChange, pendingCount }) => {
  const tabs = [
    { key: 'all', label: 'All Items' },
    { key: 'verified', label: 'Verified' },
    { key: 'pending', label: 'Pending Approval', showBadge: true, badgeCount: pendingCount },
  ];

  return (
    React.createElement("div", { className: "flex space-x-4 border-b border-gray-200 mb-6" },
      tabs.map((tab) => (
        React.createElement("button", {
          key: tab.key,
          onClick: () => onTabChange(tab.key),
          className: `relative px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none ${
            activeTab === tab.key
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`
        },
          tab.label,
          tab.showBadge && tab.badgeCount > 0 && (
            React.createElement("span", { className: "absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center" },
              tab.badgeCount
            )
          )
        )
      ))
    )
  );
};

export default FoodStatusTabs;