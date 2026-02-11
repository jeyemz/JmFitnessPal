import React, { useState } from 'react';
import Button from '../Button.js';

const AdminHeader = ({ title, subtitle, onPrimaryButtonClick, primaryButtonText, showSearchBar = false, searchPlaceholder = "Search...", user, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Use actual user data or fallback
  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Admin';
  const displayRole = user?.role || 'admin';
  const displayAvatar = user?.avatar;
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'A';

  return (
    React.createElement("div", { className: "flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100" },
      React.createElement("div", { className: "min-w-0" },
        React.createElement("h1", { className: "text-2xl sm:text-3xl font-bold text-gray-900 truncate" }, title),
        subtitle && React.createElement("p", { className: "text-sm sm:text-md text-gray-500 mt-0.5" }, subtitle)
      ),
      React.createElement("div", { className: "flex items-center space-x-4" },
        showSearchBar && (
          React.createElement("div", { className: "relative" },
            React.createElement("input", {
              type: "text",
              placeholder: searchPlaceholder,
              className: "pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 w-64"
            }),
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" })
            )
          )
        ),
        
        /* Profile Section with Dropdown */
        React.createElement("div", { className: "relative" },
          React.createElement("button", {
            onClick: () => setShowProfileMenu(!showProfileMenu),
            className: "flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
          },
            React.createElement("div", { className: "text-right" },
              React.createElement("p", { className: "text-sm font-semibold text-gray-900" }, displayName),
              React.createElement("p", { className: "text-xs text-gray-500 capitalize" }, displayRole)
            ),
            displayAvatar ? (
              React.createElement("img", {
                src: displayAvatar,
                alt: "Avatar",
                className: "w-9 h-9 rounded-full object-cover"
              })
            ) : (
              React.createElement("div", { className: "w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm" }, 
                initials || '?'
              )
            ),
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 text-gray-400" },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 8.25l-7.5 7.5-7.5-7.5" })
            )
          ),
          
          /* Dropdown Menu */
          showProfileMenu && (
            React.createElement("div", { className: "absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50" },
              React.createElement("div", { className: "px-4 py-2 border-b border-gray-100" },
                React.createElement("p", { className: "text-sm font-medium text-gray-900" }, displayName),
                React.createElement("p", { className: "text-xs text-gray-500" }, user?.email)
              ),
              React.createElement("button", {
                onClick: () => {
                  setShowProfileMenu(false);
                  if (onLogout) onLogout();
                },
                className: "w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              },
                React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 mr-2" },
                  React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" })
                ),
                "Logout"
              )
            )
          )
        ),
        
        onPrimaryButtonClick && primaryButtonText && React.createElement(Button, { variant: "primary", onClick: onPrimaryButtonClick, className: "py-2 px-5 text-sm flex items-center" },
          React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: "w-5 h-5 mr-2" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" })
          ),
          primaryButtonText
        )
      )
    )
  );
};

export default AdminHeader;
