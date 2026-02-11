import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar.js';
import AdminHeader from '../components/admin/AdminHeader.js';
import { adminAPI } from '../services/api.js';
import { ADMIN_NAV_LINKS } from '../constants.js';

const AdminDashboardPage = ({ onNavigate, currentPage, onLogout, user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    mealsLogged: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [usersResponse, activityResponse] = await Promise.all([
          adminAPI.getAllUsers(),
          adminAPI.getRecentActivity().catch(() => ({ activity: [] }))
        ]);

        const users = usersResponse.users || [];
        const activityList = activityResponse.activity || [];

        const today = new Date().toDateString();
        const activeToday = users.filter((u) => {
          if (!u.lastLogin) return false;
          return new Date(u.lastLogin).toDateString() === today;
        }).length;

        setStats({
          totalUsers: users.length,
          activeToday,
          mealsLogged: 0
        });

        const activity = activityList.slice(0, 20).map((a) => ({
          id: a.id,
          type: a.type,
          user: a.user || a.email || `User #${a.userId}`,
          action:
            a.action ||
            (a.type === 'login'
              ? 'logged in'
              : a.type === 'logout'
              ? 'logged out'
              : 'signed up'),
          time: a.time ? formatTimeAgo(a.time) : ''
        }));

        setRecentActivity(activity);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNavigate = (page) => {
    onNavigate(page);
  };

  const metricsGrid = React.createElement(
    'div',
    { className: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-6' },
    // Total Users
    React.createElement(
      'div',
      { className: 'bg-white rounded-xl shadow-sm p-6 border border-gray-100' },
      React.createElement(
        'div',
        { className: 'flex items-center justify-between' },
        React.createElement(
          'div',
          null,
          React.createElement(
            'p',
            { className: 'text-sm text-gray-500' },
            'Total Users'
          ),
          React.createElement(
            'p',
            { className: 'text-3xl font-bold text-gray-900 mt-1' },
            stats.totalUsers
          )
        ),
        React.createElement(
          'div',
          { className: 'p-3 bg-blue-100 rounded-lg' },
          React.createElement(
            'svg',
            {
              xmlns: 'http://www.w3.org/2000/svg',
              fill: 'none',
              viewBox: '0 0 24 24',
              strokeWidth: 1.5,
              stroke: 'currentColor',
              className: 'w-6 h-6 text-blue-600'
            },
            React.createElement('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              d: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
            })
          )
        )
      )
    ),
    // Active Today
    React.createElement(
      'div',
      { className: 'bg-white rounded-xl shadow-sm p-6 border border-gray-100' },
      React.createElement(
        'div',
        { className: 'flex items-center justify-between' },
        React.createElement(
          'div',
          null,
          React.createElement(
            'p',
            { className: 'text-sm text-gray-500' },
            'Active Today'
          ),
          React.createElement(
            'p',
            { className: 'text-3xl font-bold text-green-600 mt-1' },
            stats.activeToday
          )
        ),
        React.createElement(
          'div',
          { className: 'p-3 bg-green-100 rounded-lg' },
          React.createElement(
            'svg',
            {
              xmlns: 'http://www.w3.org/2000/svg',
              fill: 'none',
              viewBox: '0 0 24 24',
              strokeWidth: 1.5,
              stroke: 'currentColor',
              className: 'w-6 h-6 text-green-600'
            },
            React.createElement('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              d: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'
            })
          )
        )
      )
    ),
    // System Status
    React.createElement(
      'div',
      { className: 'bg-white rounded-xl shadow-sm p-6 border border-gray-100' },
      React.createElement(
        'div',
        { className: 'flex items-center justify-between' },
        React.createElement(
          'div',
          null,
          React.createElement(
            'p',
            { className: 'text-sm text-gray-500' },
            'System Status'
          ),
          React.createElement(
            'p',
            { className: 'text-xl font-bold text-green-600 mt-1' },
            'All Systems Operational'
          )
        ),
        React.createElement(
          'div',
          { className: 'p-3 bg-green-100 rounded-lg' },
          React.createElement(
            'svg',
            {
              xmlns: 'http://www.w3.org/2000/svg',
              fill: 'none',
              viewBox: '0 0 24 24',
              strokeWidth: 1.5,
              stroke: 'currentColor',
              className: 'w-6 h-6 text-green-600'
            },
            React.createElement('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            })
          )
        )
      )
    )
  );

  const recentActivitySection = React.createElement(
    'div',
    { className: 'bg-white rounded-xl shadow-sm p-6 border border-gray-100' },
    React.createElement(
      'h2',
      { className: 'text-lg font-bold text-gray-900 mb-4' },
      'Recent Activity'
    ),
    recentActivity.length > 0
      ? React.createElement(
          'div',
          { className: 'space-y-4' },
          recentActivity.map((activity) =>
            React.createElement(
              'div',
              {
                key: activity.id,
                className:
                  'flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0'
              },
              React.createElement(
                'div',
                { className: 'flex items-center space-x-3' },
                React.createElement(
                  'div',
                  { className: 'p-2 bg-blue-100 rounded-full' },
                  React.createElement(
                    'svg',
                    {
                      xmlns: 'http://www.w3.org/2000/svg',
                      fill: 'none',
                      viewBox: '0 0 24 24',
                      strokeWidth: 1.5,
                      stroke: 'currentColor',
                      className: 'w-4 h-4 text-blue-600'
                    },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      d: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'
                    })
                  )
                ),
                React.createElement(
                  'div',
                  null,
                  React.createElement(
                    'p',
                    { className: 'text-sm font-medium text-gray-900' },
                    activity.user
                  ),
                  React.createElement(
                    'p',
                    { className: 'text-xs text-gray-500' },
                    activity.action
                  )
                )
              ),
              React.createElement(
                'span',
                { className: 'text-xs text-gray-400' },
                activity.time
              )
            )
          )
        )
      : React.createElement(
          'p',
          { className: 'text-gray-500 text-center py-8' },
          'No recent activity'
        )
  );

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'div',
      { className: 'flex min-h-screen bg-gray-100' },
      React.createElement(
        'div',
        { className: 'hidden lg:block' },
        React.createElement(AdminSidebar, {
          onNavigate: handleNavigate,
          currentPage,
          onLogout,
          user
        })
      ),
      React.createElement(
        'div',
        { className: 'flex-1 p-6 pb-16 lg:pb-6 overflow-auto' },
        React.createElement(AdminHeader, {
          title: 'Admin Dashboard',
          subtitle: "Welcome back! Here's what's happening.",
          user,
          onLogout
        }),
        isLoading
          ? React.createElement(
              'div',
              { className: 'flex justify-center items-center py-12' },
              React.createElement('div', {
                className:
                  'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'
              })
            )
          : React.createElement(
              React.Fragment,
              null,
              metricsGrid,
              recentActivitySection
            )
      )
    ),
    React.createElement(
      'nav',
      {
        className:
          'lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-inner'
      },
      React.createElement(
        'div',
        { className: 'flex justify-around' },
        ADMIN_NAV_LINKS.map(function (link) {
          return React.createElement(
            'button',
            {
              key: link.name,
              type: 'button',
              onClick: function () {
                handleNavigate(link.href);
              },
              className:
                'flex flex-col items-center justify-center flex-1 py-2 text-xs ' +
                (currentPage === link.href
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-500')
            },
            React.createElement('span', { className: 'mb-0.5' }, link.icon),
            React.createElement(
              'span',
              { className: 'leading-tight' },
              link.name
            )
          );
        })
      )
    )
  );
};

export default AdminDashboardPage;
