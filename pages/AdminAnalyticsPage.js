import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar.js';
import AdminHeader from '../components/admin/AdminHeader.js';
import { adminAPI } from '../services/api.js';
import { ADMIN_NAV_LINKS } from '../constants.js';

const AdminAnalyticsPage = ({ onNavigate, currentPage, onLogout, user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisWeek: 0,
    usersByRole: { admin: 0, user: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await adminAPI.getAllUsers();
        const users = response.users || [];
        
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const activeUsers = users.filter(u => u.isActive).length;
        const newUsersThisWeek = users.filter(u => {
          const created = new Date(u.createdAt);
          return created >= weekAgo;
        }).length;
        
        const adminCount = users.filter(u => u.role === 'admin').length;
        const userCount = users.filter(u => u.role === 'user').length;

        setStats({
          totalUsers: users.length,
          activeUsers,
          newUsersThisWeek,
          usersByRole: { admin: adminCount, user: userCount }
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleNavigate = (page) => {
    onNavigate(page);
  };

  return React.createElement(
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
          title: "Analytics",
          subtitle: "Platform statistics and insights",
          showSearchBar: false,
          user: user,
          onLogout: onLogout
        }),

        isLoading
          ? React.createElement(
              "div",
              { className: "flex justify-center items-center py-12" },
              React.createElement("div", {
                className:
                  "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
              })
            )
          : React.createElement(
              React.Fragment,
              null,
              /* Key Metrics */
              React.createElement(
                "div",
                {
                  className:
                    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
                },
                /* Total Users */
                React.createElement(
                  "div",
                  {
                    className:
                      "bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  },
                  React.createElement(
                    "p",
                    { className: "text-sm text-gray-500 mb-1" },
                    "Total Users"
                  ),
                  React.createElement(
                    "p",
                    { className: "text-3xl font-bold text-gray-900" },
                    stats.totalUsers
                  ),
                  React.createElement(
                    "div",
                    {
                      className:
                        "mt-2 flex items-center text-sm text-gray-500"
                    },
                    React.createElement(
                      "svg",
                      {
                        xmlns: "http://www.w3.org/2000/svg",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        strokeWidth: 1.5,
                        stroke: "currentColor",
                        className: "w-4 h-4 mr-1"
                      },
                      React.createElement("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        d: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                      })
                    ),
                    "All registered users"
                  )
                ),
                /* Active Users */
                React.createElement(
                  "div",
                  {
                    className:
                      "bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  },
                  React.createElement(
                    "p",
                    { className: "text-sm text-gray-500 mb-1" },
                    "Active Users"
                  ),
                  React.createElement(
                    "p",
                    { className: "text-3xl font-bold text-green-600" },
                    stats.activeUsers
                  ),
                  React.createElement(
                    "div",
                    {
                      className:
                        "mt-2 flex items-center text-sm text-green-600"
                    },
                    React.createElement(
                      "span",
                      null,
                      `${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total`
                    )
                  )
                ),
                /* New This Week */
                React.createElement(
                  "div",
                  {
                    className:
                      "bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  },
                  React.createElement(
                    "p",
                    { className: "text-sm text-gray-500 mb-1" },
                    "New This Week"
                  ),
                  React.createElement(
                    "p",
                    { className: "text-3xl font-bold text-blue-600" },
                    stats.newUsersThisWeek
                  ),
                  React.createElement(
                    "div",
                    {
                      className:
                        "mt-2 flex items-center text-sm text-blue-600"
                    },
                    React.createElement(
                      "svg",
                      {
                        xmlns: "http://www.w3.org/2000/svg",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        strokeWidth: 1.5,
                        stroke: "currentColor",
                        className: "w-4 h-4 mr-1"
                      },
                      React.createElement("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        d: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                      })
                    ),
                    "Last 7 days"
                  )
                ),
                /* Admins */
                React.createElement(
                  "div",
                  {
                    className:
                      "bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  },
                  React.createElement(
                    "p",
                    { className: "text-sm text-gray-500 mb-1" },
                    "Administrators"
                  ),
                  React.createElement(
                    "p",
                    { className: "text-3xl font-bold text-purple-600" },
                    stats.usersByRole.admin
                  ),
                  React.createElement(
                    "div",
                    {
                      className:
                        "mt-2 flex items-center text-sm text-gray-500"
                    },
                    React.createElement(
                      "span",
                      null,
                      `${stats.usersByRole.user} regular users`
                    )
                  )
                )
              ),

              /* User Distribution */
              React.createElement(
                "div",
                { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                /* User Roles */
                React.createElement(
                  "div",
                  {
                    className:
                      "bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  },
                  React.createElement(
                    "h3",
                    { className: "text-lg font-bold text-gray-900 mb-4" },
                    "User Roles"
                  ),
                  React.createElement(
                    "div",
                    { className: "space-y-4" },
                    /* Admin Bar */
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        "div",
                        { className: "flex justify-between text-sm mb-1" },
                        React.createElement(
                          "span",
                          { className: "text-gray-600" },
                          "Administrators"
                        ),
                        React.createElement(
                          "span",
                          { className: "font-medium" },
                          stats.usersByRole.admin
                        )
                      ),
                      React.createElement(
                        "div",
                        { className: "w-full bg-gray-200 rounded-full h-3" },
                        React.createElement("div", {
                          className:
                            "h-3 rounded-full bg-purple-500",
                          style: {
                            width: `${
                              stats.totalUsers > 0
                                ? (stats.usersByRole.admin /
                                    stats.totalUsers) *
                                  100
                                : 0
                            }%`
                          }
                        })
                      )
                    ),
                    /* Regular Users Bar */
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        "div",
                        { className: "flex justify-between text-sm mb-1" },
                        React.createElement(
                          "span",
                          { className: "text-gray-600" },
                          "Regular Users"
                        ),
                        React.createElement(
                          "span",
                          { className: "font-medium" },
                          stats.usersByRole.user
                        )
                      ),
                      React.createElement(
                        "div",
                        { className: "w-full bg-gray-200 rounded-full h-3" },
                        React.createElement("div", {
                          className: "h-3 rounded-full bg-blue-500",
                          style: {
                            width: `${
                              stats.totalUsers > 0
                                ? (stats.usersByRole.user /
                                    stats.totalUsers) *
                                  100
                                : 0
                            }%`
                          }
                        })
                      )
                    )
                  )
                ),

                /* Quick Stats */
                React.createElement(
                  "div",
                  {
                    className:
                      "bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  },
                  React.createElement(
                    "h3",
                    { className: "text-lg font-bold text-gray-900 mb-4" },
                    "Platform Health"
                  ),
                  React.createElement(
                    "div",
                    { className: "space-y-4" },
                    React.createElement(
                      "div",
                      {
                        className:
                          "flex items-center justify-between py-3 border-b border-gray-100"
                      },
                      React.createElement(
                        "span",
                        { className: "text-gray-600" },
                        "Database Status"
                      ),
                      React.createElement(
                        "span",
                        {
                          className:
                            "px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full"
                        },
                        "Connected"
                      )
                    ),
                    React.createElement(
                      "div",
                      {
                        className:
                          "flex items-center justify-between py-3 border-b border-gray-100"
                      },
                      React.createElement(
                        "span",
                        { className: "text-gray-600" },
                        "USDA API"
                      ),
                      React.createElement(
                        "span",
                        {
                          className:
                            "px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full"
                        },
                        "Active"
                      )
                    ),
                    React.createElement(
                      "div",
                      { className: "flex items-center justify-between py-3" },
                      React.createElement(
                        "span",
                        { className: "text-gray-600" },
                        "Server Uptime"
                      ),
                      React.createElement(
                        "span",
                        { className: "text-gray-900 font-medium" },
                        "100%"
                      )
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
  );
};

export default AdminAnalyticsPage;
