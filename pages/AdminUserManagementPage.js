import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar.js';
import AdminHeader from '../components/admin/AdminHeader.js';
import UserTable from '../components/admin/users/UserTable.js';
import UserDetailsModal from '../components/admin/users/UserDetailsModal.js';

const AdminUserManagementPage = ({ onNavigate, currentPage, onLogout, user }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // For modal
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const resultsPerPage = 4; // Matching the image's "Showing 4 of 128 results"

  const handleAddUser = () => {
    alert('Add New User functionality not implemented in demo.');
    // In a real app, this would open a form to add a new user
  };

  const handleEditUser = (userToEdit) => {
    setSelectedUser(userToEdit);
  };

  const handleSaveUser = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    alert(`User ${updatedUser.name} saved! (Demo)`);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      alert('User deleted! (Demo)');
    }
  };

  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
  };

  const handlePageChange = (page) => {
    setTableCurrentPage(page);
  };

  const handleSort = (columnKey) => {
    // For demo, just log sort action
    console.log(`Sorting by ${columnKey}`);
    // In a real app, you'd implement sorting logic here
  };

  // Filter users based on search term (simple case-insensitive match on name or email)
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (tableCurrentPage - 1) * resultsPerPage,
    tableCurrentPage * resultsPerPage
  );
  const totalUsers = filteredUsers.length;

  return (
    React.createElement("div", { className: "flex min-h-screen bg-gray-100" },
      React.createElement(AdminSidebar, { onNavigate: onNavigate, currentPage: currentPage, onLogout: onLogout, user: user }),
      React.createElement("div", { className: "flex-1 p-6 overflow-auto" },
        React.createElement(AdminHeader, {
          title: "User Management",
          subtitle: "Manage platform users and their tenant associations.",
          primaryButtonText: "Add New User",
          onPrimaryButtonClick: handleAddUser
        }),

        React.createElement("div", { className: "mb-6" },
          React.createElement("div", { className: "relative w-full max-w-sm mb-4" },
            React.createElement("input", {
              type: "text",
              placeholder: "Quick search...",
              className: "pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 w-full",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              "aria-label": "Search users"
            }),
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" })
            )
          )
        ),

        React.createElement(UserTable, {
          users: paginatedUsers,
          totalResults: totalUsers,
          resultsPerPage: resultsPerPage,
          currentPage: tableCurrentPage,
          onPageChange: handlePageChange,
          onSort: handleSort,
          onEditUser: handleEditUser,
          onDeleteUser: handleDeleteUser,
          onViewUserDetails: handleViewUserDetails
        })
      ),

      selectedUser && React.createElement(UserDetailsModal, {
        user: selectedUser,
        onClose: () => setSelectedUser(null),
        onSaveUser: handleSaveUser,
        onDeleteUser: handleDeleteUser
      })
    )
  );
};

export default AdminUserManagementPage;
