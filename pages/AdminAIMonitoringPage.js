import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar.js';
import AdminHeader from '../components/admin/AdminHeader.js';
import ScanSuccessCard from '../components/admin/ai-monitoring/ScanSuccessCard.js';
import SystemStatusCard from '../components/admin/ai-monitoring/SystemStatusCard.js';
import RecentScansTable from '../components/admin/ai-monitoring/RecentScansTable.js';
import SystemAlertCard from '../components/admin/ai-monitoring/SystemAlertCard.js';
import ApiNinjasMonitorCard from '../components/admin/ApiNinjasMonitorCard.js';

const AdminAIMonitoringPage = ({ onNavigate, currentPage, onLogout, user }) => {
  const emptyScans = [];
  const overview = { scanSuccess: 0, systemStatus: 'No data', systemAlert: '' };
  const [displayedScans, setDisplayedScans] = useState(emptyScans);
  const [showAllScans, setShowAllScans] = useState(false);

  const handleEditScan = (scanId) => {
    alert(`Editing scan ID: ${scanId} (Demo functionality)`);
    // In a real application, this would open a modal or navigate to a detailed view for editing
  };

  const handleViewAllLogs = () => {
    setDisplayedScans(emptyScans);
    setShowAllScans(true);
  };

  return (
    React.createElement("div", { className: "flex min-h-screen bg-gray-100" },
      React.createElement(AdminSidebar, { onNavigate: onNavigate, currentPage: currentPage, onLogout: onLogout, user: user }),
      React.createElement("div", { className: "flex-1 p-6 overflow-auto" },
        React.createElement(AdminHeader, {
          title: "AI & API Monitoring",
          subtitle: "Monitor AI scans and API Ninjas integration",
          showSearchBar: false,
        }),

        /* API Ninjas Integration Monitor */
        React.createElement("div", { className: "mb-6" },
          React.createElement(ApiNinjasMonitorCard, null)
        ),

        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" },
          React.createElement(ScanSuccessCard, { percentage: overview.scanSuccess }),
          React.createElement(SystemStatusCard, { status: overview.systemStatus })
        ),

        React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Recent AI Scans"),
        React.createElement(RecentScansTable, {
          scans: displayedScans,
          onEditScan: handleEditScan,
          showAllScans: showAllScans,
          onViewAllLogs: handleViewAllLogs
        }),

        overview.systemAlert &&
          React.createElement(SystemAlertCard, { message: overview.systemAlert })
      )
    )
  );
};

export default AdminAIMonitoringPage;
