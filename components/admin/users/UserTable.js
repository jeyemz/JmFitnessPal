import React from 'react';
import UserTableRow from './UserTableRow.js';
import Pagination from './Pagination.js';

const UserTable = ({ users, totalResults, resultsPerPage, currentPage, onPageChange, onSort, onEditUser, onDeleteUser, onViewUserDetails }) => {
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const tableHeaders = [
    { key: 'name', label: 'User Profile' },
    { key: 'email', label: 'Email Address' },
    { key: 'tenant', label: 'Tenant' },
    { key: 'role', label: 'Role' }, // Added Role column
    { key: 'status', label: 'Status' },
    { key: 'lastActive', label: 'Last Active' },
    { key: 'actions', label: 'Actions' },
  ];

  const renderSortIcon = (columnKey) => {
    // Placeholder for sort icon, actual sorting logic would be implemented in parent
    return (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 ml-1 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 9l4-4 4 4m0 6l-4 4-4-4" })
      )
    );
  };

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
      React.createElement("div", { className: "mb-6 flex justify-between items-center" },
        React.createElement("div", { className: "flex items-center space-x-4" },
          React.createElement("div", { className: "relative" },
            React.createElement("select", { className: "block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-full leading-tight focus:outline-none focus:bg-white focus:border-blue-500", "aria-label": "Filter by tenant" },
              React.createElement("option", null, "All Tenants")
            ),
            React.createElement("div", { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700" },
              React.createElement("svg", { className: "fill-current h-4 w-4", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" },
                React.createElement("path", { d: "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.043 6.871 4.636 8.278z" })
              )
            )
          ),
          React.createElement("div", { className: "relative" },
            React.createElement("select", { className: "block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-full leading-tight focus:outline-none focus:bg-white focus:border-blue-500", "aria-label": "Filter by status" },
              React.createElement("option", null, "All Statuses")
            ),
            React.createElement("div", { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700" },
              React.createElement("svg", { className: "fill-current h-4 w-4", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20" },
                React.createElement("path", { d: "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.043 6.871 4.636 8.278z" })
              )
            )
          ),
          React.createElement("button", { className: "p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200", "aria-label": "More filters" },
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0M3.75 18H7.5m3-6h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0M3.75 12H7.5" })
            )
          )
        )
      ),

      React.createElement("div", { className: "overflow-x-auto" },
        React.createElement("table", { className: "min-w-full divide-y divide-gray-200", role: "table", "aria-label": "User list" },
          React.createElement("thead", { className: "bg-gray-50" },
            React.createElement("tr", { role: "row" },
              tableHeaders.map((header) => (
                React.createElement("th", {
                  key: header.key,
                  scope: "col",
                  className: `px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${header.key === 'actions' ? 'text-right' : ''}`,
                  onClick: () => onSort(header.key),
                  "aria-sort": "none", // Placeholder, actual sort state would be managed
                  tabIndex: 0,
                  role: "columnheader"
                },
                  React.createElement("div", { className: "flex items-center" },
                    header.label,
                    header.key !== 'actions' && renderSortIcon(header.key)
                  )
                )
              ))
            )
          ),
          React.createElement("tbody", { className: "bg-white divide-y divide-gray-200", role: "rowgroup" },
            users.length > 0 ? (
              users.map((user) => (
                React.createElement(UserTableRow, {
                  key: user.id,
                  user: user,
                  onEdit: onEditUser,
                  onDelete: onDeleteUser,
                  onViewDetails: onViewUserDetails
                })
              ))
            ) : (
              React.createElement("tr", null,
                React.createElement("td", { colSpan: tableHeaders.length, className: "px-6 py-8 text-center text-sm text-gray-500" }, "No users yet.")
              )
            )
          )
        )
      ),

      React.createElement("div", { className: "mt-6 flex justify-between items-center" },
        React.createElement("div", { className: "text-sm text-gray-600", "aria-live": "polite" },
          "Showing ", totalResults === 0 ? 0 : (currentPage - 1) * resultsPerPage + 1, " to ", totalResults === 0 ? 0 : Math.min(currentPage * resultsPerPage, totalResults), " of ", totalResults, " results"
        ),
        totalPages > 1 && React.createElement(Pagination, { currentPage: currentPage, totalPages: totalPages, onPageChange: onPageChange })
      )
    )
  );
};

export default UserTable;
