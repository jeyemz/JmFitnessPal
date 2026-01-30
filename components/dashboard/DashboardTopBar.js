import React from 'react';

const DashboardTopBar = ({ title, subtitle, showSearchBar = true, searchPlaceholder = "Search logs..." }) => {
  const user = { name: 'No user', role: 'Member', avatar: '' };

  return (
    React.createElement("div", { className: "flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100" },
      React.createElement("div", null,
        React.createElement("h1", { className: "text-3xl font-bold text-gray-900" }, title),
        subtitle && React.createElement("p", { className: "text-md text-gray-500" }, subtitle)
      ),
      React.createElement("div", { className: "flex items-center space-x-4" },
        showSearchBar && (
          React.createElement("div", { className: "relative" },
            React.createElement("input", {
              type: "text",
              placeholder: searchPlaceholder,
              className: "pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 w-64",
              "aria-label": "Quick search"
            }),
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" })
            )
          )
        ),
        React.createElement("button", { className: "p-2 rounded-full bg-white hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200", "aria-label": "Notifications" },
          React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6 text-gray-600" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.04 5.455 1.31m5.714 0a24.248 24.248 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" })
          )
        ),
        React.createElement("div", { className: "flex items-center space-x-2" },
          React.createElement("div", { className: "text-right" },
            React.createElement("p", { className: "text-sm font-semibold text-gray-900" }, user.name),
            React.createElement("p", { className: "text-xs text-gray-500" }, user.role)
          ),
          user.avatar ? (
            React.createElement("img", {
              src: user.avatar,
              alt: "User Avatar",
              className: "w-9 h-9 rounded-full object-cover"
            })
          ) : (
            React.createElement("div", { className: "w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs", "aria-label": "User Avatar" }, "—")
          )
        )
      )
    )
  );
};

export default DashboardTopBar;
