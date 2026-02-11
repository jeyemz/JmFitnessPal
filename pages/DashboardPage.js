import React from 'react';
import Sidebar from '../components/dashboard/Sidebar.js';
import MainDashboardContent from '../components/dashboard/MainDashboardContent.js';
import HistoryPage from './HistoryPage.js';
import MealLogPage from './MealLogPage.js';
import ProfilePage from './ProfilePage.js';
import { DASHBOARD_NAV_LINKS } from '../constants.js';

const DashboardPage = ({ onNavigate, currentPage, onLogout, user, onUserUpdate }) => {
  const handleNavigate = (page) => {
    onNavigate(page);
  };

  return (
    React.createElement(React.Fragment, null,
      React.createElement("div", { className: "flex flex-col lg:flex-row min-h-screen bg-gray-100" },
        /* Desktop sidebar */
        React.createElement("div", { className: "hidden lg:block" },
          React.createElement(Sidebar, { onNavigate: handleNavigate, currentPage: currentPage, onLogout: onLogout, user: user })
        ),
        React.createElement("div", { className: "flex-1 w-full pb-16 lg:pb-0" },
          /* Main Content Area based on currentPage */
          currentPage === 'dashboard' && React.createElement(MainDashboardContent, { onNavigate: handleNavigate, user: user, onLogout: onLogout }),
          currentPage === 'meal-log' && React.createElement(MealLogPage, { onNavigate: handleNavigate, user: user, onLogout: onLogout }),
          currentPage === 'history' && React.createElement(HistoryPage, { onNavigate: handleNavigate, user: user, onLogout: onLogout }),
          currentPage === 'profile' && React.createElement(ProfilePage, { onNavigate: handleNavigate, user: user, onUserUpdate: onUserUpdate, onLogout: onLogout })
        )
      ),

      /* Mobile bottom navigation bar */
      React.createElement("nav", { className: "lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-inner" },
        React.createElement("div", { className: "flex justify-around" },
          DASHBOARD_NAV_LINKS.map((link) =>
            React.createElement("button", {
              key: link.name,
              type: "button",
              onClick: () => handleNavigate(link.href),
              className: `flex flex-col items-center justify-center flex-1 py-2 text-xs ${
                currentPage === link.href ? 'text-blue-600 font-semibold' : 'text-gray-500'
              }`
            },
              React.createElement("span", { className: "mb-0.5" }, link.icon),
              React.createElement("span", { className: "leading-tight" }, link.name)
            )
          )
        )
      )
    )
  );
};

export default DashboardPage;
