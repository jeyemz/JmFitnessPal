import React from 'react';
import AdminSidebar from '../components/admin/AdminSidebar.js';
import AdminHeader from '../components/admin/AdminHeader.js';
import ApiNinjasMonitorCard from '../components/admin/ApiNinjasMonitorCard.js';
import { ADMIN_NAV_LINKS } from '../constants.js';

const AdminAIMonitoringPage = ({ onNavigate, currentPage, onLogout, user }) => {
  const handleNavigate = (page) => {
    onNavigate(page);
  };

  return (
    React.createElement(
      React.Fragment,
      null,
      React.createElement(
        "div",
        { className: "flex min-h-screen bg-gray-100" },
        React.createElement(
          "div",
          { className: "hidden lg:block" },
          React.createElement(AdminSidebar, {
            onNavigate: handleNavigate,
            currentPage,
            onLogout,
            user
          })
        ),
        React.createElement(
          "div",
          { className: "flex-1 p-6 pb-16 lg:pb-6 overflow-auto" },
          React.createElement(AdminHeader, {
            title: "API Monitoring",
            subtitle: "Monitor USDA FoodData Central API integration",
            showSearchBar: false,
            user: user,
            onLogout: onLogout
          }),

          /* USDA FoodData Central Integration Monitor */
          React.createElement(
            "div",
            { className: "mb-6" },
            React.createElement(ApiNinjasMonitorCard, null)
          ),

          /* API Info Card */
          React.createElement(
            "div",
            {
              className:
                "bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            },
            React.createElement(
              "h3",
              { className: "text-lg font-bold text-gray-900 mb-4" },
              "About USDA FoodData Central"
            ),
            React.createElement(
              "div",
              { className: "prose text-gray-600 text-sm" },
              React.createElement(
                "p",
                { className: "mb-3" },
                "The USDA FoodData Central API provides comprehensive nutritional data for foods. This integration allows users to search and log foods with accurate nutritional information."
              ),
              React.createElement(
                "div",
                { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" },
                React.createElement(
                  "div",
                  { className: "bg-gray-50 rounded-lg p-4" },
                  React.createElement(
                    "p",
                    {
                      className:
                        "font-medium text-gray-900 mb-2"
                    },
                    "Available Data"
                  ),
                  React.createElement(
                    "ul",
                    { className: "text-sm text-gray-600 space-y-1" },
                    React.createElement("li", null, "• Calories"),
                    React.createElement("li", null, "• Protein, Carbs, Fat"),
                    React.createElement("li", null, "• Fiber, Sugar, Sodium"),
                    React.createElement("li", null, "• Vitamins & Minerals")
                  )
                ),
                React.createElement(
                  "div",
                  { className: "bg-gray-50 rounded-lg p-4" },
                  React.createElement(
                    "p",
                    {
                      className:
                        "font-medium text-gray-900 mb-2"
                    },
                    "Data Sources"
                  ),
                  React.createElement(
                    "ul",
                    { className: "text-sm text-gray-600 space-y-1" },
                    React.createElement("li", null, "• Foundation Foods"),
                    React.createElement("li", null, "• SR Legacy"),
                    React.createElement("li", null, "• Branded Foods"),
                    React.createElement("li", null, "• Survey Foods")
                  )
                )
              )
            )
          )
        )
      ),
      React.createElement(
        "nav",
        {
          className:
            "lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-inner"
        },
        React.createElement(
          "div",
          { className: "flex justify-around" },
          ADMIN_NAV_LINKS.map(function (link) {
            return React.createElement(
              "button",
              {
                key: link.name,
                type: "button",
                onClick: function () {
                  handleNavigate(link.href);
                },
                className:
                  "flex flex-col items-center justify-center flex-1 py-2 text-xs " +
                  (currentPage === link.href
                    ? "text-blue-600 font-semibold"
                    : "text-gray-500")
              },
              React.createElement("span", { className: "mb-0.5" }, link.icon),
              React.createElement(
                "span",
                { className: "leading-tight" },
                link.name
              )
            );
          })
        )
      )
    )
  );
};

export default AdminAIMonitoringPage;
