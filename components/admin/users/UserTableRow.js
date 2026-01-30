import React from 'react';
import UserStatusBadge from './UserStatusBadge.js';

const UserTableRow = ({ user, onEdit, onDelete, onViewDetails }) => {
  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent row click from triggering
    onEdit(user);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent row click from triggering
    onDelete(user.id);
  };

  const handleRowClick = () => {
    onViewDetails(user);
  };

  return (
    React.createElement("tr", {
      className: "border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150",
      onClick: handleRowClick,
      role: "row"
    },
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900" },
        React.createElement("div", { className: "flex items-center" },
          user.avatar ? (
            React.createElement("img", { src: user.avatar, alt: user.name, className: "w-8 h-8 rounded-full object-cover mr-3" })
          ) : (
            React.createElement("div", { className: "w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold mr-3" },
              user.initials
            )
          ),
          user.name
        )
      ),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600" }, user.email),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm" },
        React.createElement("span", { className: "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800" },
          user.tenant
        )
      ),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600" }, user.role),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm" },
        React.createElement(UserStatusBadge, { status: user.status })
      ),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500" }, user.lastActive),
      React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium" },
        React.createElement("div", { className: "flex items-center justify-end space-x-3" },
          React.createElement("button", {
            onClick: handleEditClick,
            className: "text-blue-600 hover:text-blue-900",
            "aria-label": `Edit ${user.name}`
          },
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14.75V21.75C18 22.302 17.552 22.75 17 22.75H2.25C1.698 22.75 1.25 22.302 1.25 21.75V7.25C1.25 6.698 1.698 6.25 2.25 6.25H9.25M18 14.75H14.25M14.25 14.75V11" })
            )
          ),
          React.createElement("button", {
            onClick: handleDeleteClick,
            className: "text-red-600 hover:text-red-900",
            "aria-label": `Delete ${user.name}`
          },
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.924a2.25 2.25 0 01-2.244-2.077L4.74 5.959m13.458-.324a.75.75 0 00-1.06-.017L12 12.004l-5.688-5.748a.75.75 0 00-1.061.017M15.75 6H15M4.74 6H3.75m0 0H2.25" })
            )
          )
        )
      )
    )
  );
};

export default UserTableRow;