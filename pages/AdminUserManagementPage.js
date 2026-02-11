import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar.js';
import AdminHeader from '../components/admin/AdminHeader.js';
import { adminAPI } from '../services/api.js';
import { ADMIN_NAV_LINKS } from '../constants.js';

const AdminUserManagementPage = ({ onNavigate, currentPage, onLogout, user }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeactivate = async (u) => {
    if (u.id === (user && user.id)) {
      setError('You cannot deactivate your own account.');
      return;
    }
    if (
      !window.confirm(
        'Deactivate ' +
          u.firstName +
          ' ' +
          u.lastName +
          '? They will not be able to log in.'
      )
    ) {
      return;
    }
    setActionLoading(u.id);
    setError(null);
    try {
      await adminAPI.deactivateUser(u.id);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to deactivate user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (u) => {
    setActionLoading(u.id);
    setError(null);
    try {
      await adminAPI.activateUser(u.id);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to activate user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (u) => {
    if (u.id === (user && user.id)) {
      setError('You cannot delete your own account.');
      return;
    }
    if (
      !window.confirm(
        'Permanently delete ' +
          u.firstName +
          ' ' +
          u.lastName +
          ' (' +
          u.email +
          ')? This cannot be undone.'
      )
    ) {
      return;
    }
    setActionLoading(u.id);
    setError(null);
    try {
      await adminAPI.deleteUser(u.id);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(function (u) {
    const fullName = (u.firstName + ' ' + u.lastName).toLowerCase();
    const email = (u.email || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.indexOf(term) !== -1 || email.indexOf(term) !== -1;
  });

  const handleNavigate = (page) => {
    onNavigate(page);
  };

  const searchBar = React.createElement(
    'div',
    { className: 'mb-6' },
    React.createElement(
      'div',
      { className: 'relative w-full max-w-md' },
      React.createElement('input', {
        type: 'text',
        placeholder: 'Search by name or email...',
        className:
          'pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 w-full',
        value: searchTerm,
        onChange: function (e) {
          setSearchTerm(e.target.value);
        }
      }),
      React.createElement(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          strokeWidth: 1.5,
          stroke: 'currentColor',
          className:
            'w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2'
        },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          d: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
        })
      )
    )
  );

  const usersTable = React.createElement(
    'div',
    { className: 'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden' },
    React.createElement(
      'div',
      { className: 'px-6 py-4 border-b border-gray-100' },
      React.createElement(
        'p',
        { className: 'text-sm text-gray-600' },
        'Showing ' +
          filteredUsers.length +
          ' of ' +
          users.length +
          ' users'
      )
    ),
    React.createElement(
      'div',
      { className: 'overflow-x-auto' },
      React.createElement(
        'table',
        { className: 'min-w-full divide-y divide-gray-200' },
        React.createElement(
          'thead',
          { className: 'bg-gray-50' },
          React.createElement(
            'tr',
            null,
            React.createElement(
              'th',
              {
                className:
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              },
              'User'
            ),
            React.createElement(
              'th',
              {
                className:
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              },
              'Email'
            ),
            React.createElement(
              'th',
              {
                className:
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              },
              'Role'
            ),
            React.createElement(
              'th',
              {
                className:
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              },
              'Status'
            ),
            React.createElement(
              'th',
              {
                className:
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              },
              'Last Login'
            ),
            React.createElement(
              'th',
              {
                className:
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              },
              'Joined'
            ),
            React.createElement(
              'th',
              {
                className:
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              },
              'Actions'
            )
          )
        ),
        React.createElement(
          'tbody',
          { className: 'bg-white divide-y divide-gray-200' },
          filteredUsers.length > 0
            ? filteredUsers.map(function (u) {
                const initials =
                  (u.firstName && u.firstName.charAt(0)) || '' +
                  ((u.lastName && u.lastName.charAt(0)) || '');
                return React.createElement(
                  'tr',
                  { key: u.id, className: 'hover:bg-gray-50' },
                  React.createElement(
                    'td',
                    { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement(
                      'div',
                      { className: 'flex items-center' },
                      React.createElement(
                        'div',
                        {
                          className:
                            'w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium'
                        },
                        initials
                      ),
                      React.createElement(
                        'div',
                        { className: 'ml-3' },
                        React.createElement(
                          'p',
                          {
                            className:
                              'text-sm font-medium text-gray-900'
                          },
                          (u.firstName || '') + ' ' + (u.lastName || '')
                        )
                      )
                    )
                  ),
                  React.createElement(
                    'td',
                    {
                      className:
                        'px-6 py-4 whitespace-nowrap text-sm text-gray-600'
                    },
                    u.email
                  ),
                  React.createElement(
                    'td',
                    { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement(
                      'span',
                      {
                        className:
                          'px-2 py-1 text-xs font-medium rounded-full ' +
                          (u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700')
                      },
                      u.role
                    )
                  ),
                  React.createElement(
                    'td',
                    { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement(
                      'span',
                      {
                        className:
                          'px-2 py-1 text-xs font-medium rounded-full ' +
                          (u.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700')
                      },
                      u.isActive ? 'Active' : 'Inactive'
                    )
                  ),
                  React.createElement(
                    'td',
                    {
                      className:
                        'px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                    },
                    formatDate(u.lastLogin)
                  ),
                  React.createElement(
                    'td',
                    {
                      className:
                        'px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                    },
                    formatDate(u.createdAt)
                  ),
                  React.createElement(
                    'td',
                    {
                      className:
                        'px-6 py-4 whitespace-nowrap text-sm'
                    },
                    u.role === 'admin' && user && u.id === user.id
                      ? React.createElement(
                          'span',
                          { className: 'text-gray-400' },
                          '—'
                        )
                      : React.createElement(
                          'div',
                          { className: 'flex items-center gap-2' },
                          u.isActive &&
                            React.createElement(
                              'button',
                              {
                                type: 'button',
                                onClick: function () {
                                  handleDeactivate(u);
                                },
                                disabled: actionLoading === u.id,
                                className:
                                  'px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded hover:bg-amber-200 disabled:opacity-50'
                              },
                              actionLoading === u.id ? '...' : 'Deactivate'
                            ),
                          !u.isActive &&
                            React.createElement(
                              'button',
                              {
                                type: 'button',
                                onClick: function () {
                                  handleActivate(u);
                                },
                                disabled: actionLoading === u.id,
                                className:
                                  'px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 disabled:opacity-50'
                              },
                              actionLoading === u.id ? '...' : 'Activate'
                            ),
                          u.role !== 'admin' &&
                            React.createElement(
                              'button',
                              {
                                type: 'button',
                                onClick: function () {
                                  handleDelete(u);
                                },
                                disabled: actionLoading === u.id,
                                className:
                                  'px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 disabled:opacity-50'
                              },
                              actionLoading === u.id ? '...' : 'Delete'
                            )
                        )
                  )
                );
              })
            : React.createElement(
                'tr',
                null,
                React.createElement(
                  'td',
                  {
                    colSpan: 7,
                    className:
                      'px-6 py-12 text-center text-gray-500'
                  },
                  searchTerm
                    ? 'No users match your search'
                    : 'No users found'
                )
              )
        )
      )
    )
  );

  const mainContent = isLoading
    ? React.createElement(
        'div',
        { className: 'flex justify-center items-center py-12' },
        React.createElement('div', {
          className:
            'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'
        })
      )
    : error
    ? React.createElement(
        'div',
        { className: 'bg-red-50 text-red-600 p-4 rounded-lg' },
        error
      )
    : usersTable;

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
          title: 'User Management',
          subtitle:
            'Manage all platform users (' + users.length + ' total)',
          user,
          onLogout
        }),
        searchBar,
        mainContent
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

export default AdminUserManagementPage;
