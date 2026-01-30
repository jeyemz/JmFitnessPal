import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar.js';
import AdminHeader from '../components/admin/AdminHeader.js';
import FoodOverviewCard from '../components/admin/food/FoodOverviewCard.js';
import FoodStatusTabs from '../components/admin/food/FoodStatusTabs.js';
import FoodTable from '../components/admin/food/FoodTable.js';
import { FOOD_CATEGORIES, FOOD_SOURCES } from '../data/adminFoodData.js';

const AdminFoodDatabasePage = ({ onNavigate, currentPage, onLogout, user }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(FOOD_CATEGORIES[0]);
  const [selectedSource, setSelectedSource] = useState(FOOD_SOURCES[0]);
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const resultsPerPage = 4; // Display 4 items per page as per design image

  useEffect(() => {
    setTableCurrentPage(1); // Reset to first page when filters/tabs change
  }, [activeTab, searchTerm, selectedCategory, selectedSource]);

  const handleAddFood = () => {
    alert('Add New Food functionality not implemented in demo.');
  };

  const handleApproveFood = (id) => {
    setFoodItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, status: 'approved' } : item))
    );
    alert(`Food item ${id} approved! (Demo)`);
  };

  const handleRejectFood = (id) => {
    setFoodItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, status: 'rejected' } : item))
    );
    alert(`Food item ${id} rejected! (Demo)`);
  };

  const handlePageChange = (page) => {
    setTableCurrentPage(page);
  };

  const handleSort = (columnKey) => {
    console.log(`Sorting by ${columnKey}`);
    // In a real app, implement sorting logic here
  };

  const filterFoodItems = () => {
    let filtered = foodItems;

    if (activeTab === 'verified') {
      filtered = filtered.filter((item) => item.status === 'approved');
    } else if (activeTab === 'pending') {
      filtered = filtered.filter((item) => item.status === 'pending');
    }

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (selectedSource !== 'All Sources') {
      filtered = filtered.filter((item) => item.source.startsWith(selectedSource));
    }

    return filtered;
  };

  const filteredAndPaginatedItems = filterFoodItems().slice(
    (tableCurrentPage - 1) * resultsPerPage,
    tableCurrentPage * resultsPerPage
  );

  const totalFilteredResults = filterFoodItems().length;
  const pendingCount = foodItems.filter(item => item.status === 'pending').length;
  const emptyStats = { totalFoodItems: 0, aiVerifiedPercentage: 0 };

  return (
    React.createElement("div", { className: "flex min-h-screen bg-gray-100" },
      React.createElement(AdminSidebar, { onNavigate: onNavigate, currentPage: currentPage, onLogout: onLogout, user: user }),
      React.createElement("div", { className: "flex-1 p-6 overflow-auto" },
        React.createElement(AdminHeader, {
          title: "Food Database Management",
          subtitle: "System nutritional data repository and user submission verification.",
          primaryButtonText: "Add New Food",
          onPrimaryButtonClick: handleAddFood
        }),

        /* Food Overview Section */
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-6" },
          React.createElement(FoodOverviewCard, {
            title: "Total Food Items",
            value: emptyStats.totalFoodItems,
            change: null,
            period: null,
            subtext: null
          }),
          React.createElement(FoodOverviewCard, {
            title: "Pending Approval",
            value: pendingCount,
            subtext: "Action Required",
            change: null,
            period: null
          }),
          React.createElement(FoodOverviewCard, {
            title: "AI Verified",
            value: emptyStats.aiVerifiedPercentage,
            isPercentage: true,
            progressBarWidth: emptyStats.aiVerifiedPercentage,
            subtext: null,
            change: null,
            period: null
          })
        ),

        /* Food Status Tabs */
        React.createElement(FoodStatusTabs, { activeTab: activeTab, onTabChange: setActiveTab, pendingCount: pendingCount }),

        /* Food Item List Section */
        React.createElement(FoodTable, {
          foodItems: filteredAndPaginatedItems,
          totalResults: totalFilteredResults,
          resultsPerPage: resultsPerPage,
          currentPage: tableCurrentPage,
          onPageChange: handlePageChange,
          onSort: handleSort,
          onApproveFood: handleApproveFood,
          onRejectFood: handleRejectFood,
          onSearchTermChange: setSearchTerm,
          searchTerm: searchTerm,
          onCategoryFilterChange: setSelectedCategory,
          onSourceFilterChange: setSelectedSource,
          selectedCategory: selectedCategory,
          selectedSource: selectedSource
        }),

        /* Pro-tip Section */
        React.createElement("div", { className: "bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-200 flex items-start space-x-3 text-blue-800 mt-6" },
          React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 flex-shrink-0 mt-0.5" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.02M10.5 18.75H9a2.25 2.25 0 00-2.25 2.25V21h4.5v-2.25A2.25 2.25 0 0010.5 18.75zm6.75-10.5H18a2.25 2.25 0 012.25 2.25V21h-4.5v-2.25m-1.5 0a.75.75 0 00-1.5 0V21h3v-2.25z" })
          ),
          React.createElement("p", { className: "text-sm" },
            React.createElement("strong", { className: "font-semibold" }, "Pro-tip:"), " You can select multiple items to perform bulk approvals or deletions. Use the checkboxes in the 'All Items' view to manage large datasets."
          )
        )
      )
    )
  );
};

export default AdminFoodDatabasePage;
