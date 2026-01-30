import React from 'react';
import DashboardTopBar from '../dashboard/DashboardTopBar.js';

const MealLogHeader = ({ title, subtitle }) => {
  return React.createElement(DashboardTopBar, {
    title: title,
    subtitle: subtitle,
    showSearchBar: true,
    searchPlaceholder: "Search foods..."
  });
};

export default MealLogHeader;
