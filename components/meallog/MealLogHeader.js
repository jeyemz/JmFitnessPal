import React from 'react';
import DashboardTopBar from '../dashboard/DashboardTopBar.js';

const MealLogHeader = ({ title, subtitle, user, onLogout }) => {
  return React.createElement(DashboardTopBar, {
    title: title,
    subtitle: subtitle,
    showSearchBar: false,
    user: user,
    onLogout: onLogout
  });
};

export default MealLogHeader;
