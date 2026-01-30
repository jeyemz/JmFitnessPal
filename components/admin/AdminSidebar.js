import React from 'react';
import NavLink from '../NavLink.js';
import { ADMIN_NAV_LINKS } from '../../constants.js';

const AdminSidebar = ({ onNavigate, currentPage = 'admin-dashboard', onLogout, user }) => {
  // Get user display info
  const displayName = user?.nickname || user?.firstName || 'Admin';
  const roleDisplay = user?.role === 'admin' ? 'Administrator' : user?.role || 'Admin';
  const avatarUrl = user?.avatar;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    React.createElement("div", { className: "w-64 bg-white shadow-md flex flex-col justify-between py-6 px-4 relative z-10 min-h-screen" },
      /* Top Section: Logo and Navigation */
      React.createElement("div", null,
        /* Logo */
        React.createElement("div", { className: "flex items-center mb-10 pl-2" },
          React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            className: "w-8 h-8 text-blue-600 mr-2"
          },
            React.createElement("path", {
              d: "M3 9a2 2 0 012-2h1V6a2 2 0 114 0v1h4V6a2 2 0 114 0v1h1a2 2 0 012 2v2a2 2 0 01-2 2h-1v1a2 2 0 11-4 0v-1H10v1a2 2 0 11-4 0v-1H5a2 2 0 01-2-2V9zm3 0v2h12V9H6z"
            })
          ),
          React.createElement("div", null,
            React.createElement("h1", { className: "text-xl font-bold text-gray-900" }, "JmFitnessPal"),
            React.createElement("p", { className: "text-xs text-gray-500 uppercase tracking-wider" }, "ADMIN PANEL")
          )
        ),

        /* Navigation */
        React.createElement("nav", { className: "space-y-2" },
          ADMIN_NAV_LINKS.map((link) => (
            React.createElement(NavLink, {
              key: link.name,
              href: "#",
              onClick: () => onNavigate(link.href),
              className: `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                currentPage === link.href
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`,
              "aria-current": currentPage === link.href ? 'page' : undefined
            },
              link.icon && React.createElement("span", { className: "mr-3" }, link.icon),
              link.name
            )
          ))
        )
      ),

      React.createElement("div", { className: "mt-auto border-t border-gray-200 pt-6 px-2" },
        React.createElement("div", { className: "flex items-center space-x-3" },
          avatarUrl ? (
            React.createElement("img", {
              src: avatarUrl,
              alt: displayName,
              className: "w-10 h-10 rounded-full object-cover"
            })
          ) : (
            React.createElement("div", { 
              className: "w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold text-sm", 
              "aria-label": "Admin Avatar" 
            }, initials)
          ),
          React.createElement("div", null,
            React.createElement("p", { className: "font-semibold text-gray-900 text-sm" }, displayName),
            React.createElement("p", { className: "text-xs text-gray-500" }, roleDisplay)
          )
        ),
        React.createElement("button", {
          type: "button",
          onClick: () => onLogout && onLogout(),
          className: "mt-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-200",
          "aria-label": "Log out"
        }, "Log out")
      )
    )
  );
};

export default AdminSidebar;
