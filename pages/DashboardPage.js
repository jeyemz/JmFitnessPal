import React from 'react';
import Sidebar from '../components/dashboard/Sidebar.js';
import MainDashboardContent from '../components/dashboard/MainDashboardContent.js';
import HistoryPage from './HistoryPage.js';
import MealLogPage from './MealLogPage.js';
import ProfilePage from './ProfilePage.js';
import GoalsPage from './GoalsPage.js';

const DashboardPage = ({ onNavigate, currentPage, onLogout, user, onUserUpdate }) => {
  return (
    React.createElement("div", { className: "flex min-h-screen bg-gray-100" },
      React.createElement(Sidebar, { onNavigate: onNavigate, currentPage: currentPage, onLogout: onLogout, user: user }),
      React.createElement("div", { className: "flex-1" },
        /* Main Content Area based on currentPage */
        currentPage === 'dashboard' && React.createElement(MainDashboardContent, { onNavigate: onNavigate, user: user }),
        currentPage === 'meal-log' && React.createElement(MealLogPage, { onNavigate: onNavigate, user: user }),
        currentPage === 'history' && React.createElement(HistoryPage, { onNavigate: onNavigate, user: user }),
        currentPage === 'goals' && React.createElement(GoalsPage, { onNavigate: onNavigate, user: user }),
        currentPage === 'profile' && React.createElement(ProfilePage, { onNavigate: onNavigate, user: user, onUserUpdate: onUserUpdate })
      )
    )
  );
};

export default DashboardPage;
