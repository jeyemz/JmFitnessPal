import React, { useState, useEffect } from 'react';
import Button from '../../Button.js'; // Ensure correct path for Button

const UserDetailsModal = ({ user, onClose, onSaveUser, onDeleteUser }) => {
  const [editableUser, setEditableUser] = useState(user);

  useEffect(() => {
    setEditableUser(user);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSaveUser(editableUser);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      onDeleteUser(user.id);
      onClose();
    }
  };

  if (!user) return null;

  return (
    React.createElement("div", { className: "fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 animate-fade-in" },
      React.createElement("div", { className: "bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 border border-gray-100 transform scale-95 animate-scale-in" },
        React.createElement("div", { className: "flex justify-between items-center mb-6" },
          React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, "User Details"),
          React.createElement("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700" },
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6" },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" })
            )
          )
        ),

        React.createElement("div", { className: "space-y-4 mb-8" },
          React.createElement("div", { className: "flex items-center space-x-4 mb-6" },
            editableUser.avatar ? (
              React.createElement("img", { src: editableUser.avatar, alt: editableUser.name, className: "w-16 h-16 rounded-full object-cover" })
            ) : (
              React.createElement("div", { className: "w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl" },
                editableUser.initials
              )
            ),
            React.createElement("div", null,
              React.createElement("p", { className: "text-xl font-bold text-gray-900" }, editableUser.name),
              React.createElement("p", { className: "text-sm text-gray-600" }, editableUser.email)
            )
          ),

          React.createElement("div", null,
            React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Tenant"),
            React.createElement("input", {
              type: "text",
              name: "tenant",
              value: editableUser.tenant,
              onChange: handleChange,
              className: "w-full p-2 border border-gray-300 rounded-md"
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Role"),
            React.createElement("select", {
              name: "role",
              value: editableUser.role,
              onChange: handleChange,
              className: "w-full p-2 border border-gray-300 rounded-md"
            },
              React.createElement("option", { value: "Admin" }, "Admin"),
              React.createElement("option", { value: "Manager" }, "Manager"),
              React.createElement("option", { value: "User" }, "User"),
              React.createElement("option", { value: "Guest" }, "Guest")
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Status"),
            React.createElement("select", {
              name: "status",
              value: editableUser.status,
              onChange: handleChange,
              className: "w-full p-2 border border-gray-300 rounded-md"
            },
              React.createElement("option", { value: "active" }, "Active"),
              React.createElement("option", { value: "inactive" }, "Inactive"),
              React.createElement("option", { value: "pending" }, "Pending"),
              React.createElement("option", { value: "suspended" }, "Suspended")
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Details"),
            React.createElement("textarea", {
              name: "details",
              value: editableUser.details,
              onChange: handleChange,
              rows: 3,
              className: "w-full p-2 border border-gray-300 rounded-md"
            })
          ),
          React.createElement("div", null,
            React.createElement("p", { className: "text-sm font-medium text-gray-700" }, "Last Active: ", editableUser.lastActive)
          )
        ),

        React.createElement("div", { className: "flex justify-between items-center border-t border-gray-200 pt-6" },
          React.createElement(Button, { variant: "secondary", onClick: handleDelete, className: "bg-red-100 text-red-700 hover:bg-red-200" }, "Delete User"),
          React.createElement("div", { className: "space-x-3" },
            React.createElement(Button, { variant: "secondary", onClick: onClose }, "Cancel"),
            React.createElement(Button, { variant: "primary", onClick: handleSave }, "Save Changes")
          )
        )
      )
    )
  );
};

export default UserDetailsModal;