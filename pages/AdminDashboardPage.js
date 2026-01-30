import React from 'react';
import AdminSidebar from '../components/admin/AdminSidebar.js';
import AdminHeader from '../components/admin/AdminHeader.js';
import MetricCard from '../components/admin/MetricCard.js';
import SystemHealthCard from '../components/admin/SystemHealthCard.js';
import GrowthMetricsCard from '../components/admin/GrowthMetricsCard.js';
import SupportQueueCard from '../components/admin/SupportQueueCard.js';
import RecentActivityCard from '../components/admin/RecentActivityCard.js';
import ApiLatencyCard from '../components/admin/ApiLatencyCard.js';

const AdminDashboardPage = ({ onNavigate, currentPage, onLogout, user }) => {
  const emptyMetrics = {
    totalActiveTenants: { label: 'Total Active Tenants', value: 0, subLabel: null, change: null, status: null },
    totalEcosystemUsers: { label: 'Total Ecosystem Users', value: 0, subText: 'No data', icon: null },
    systemHealth: { label: 'System Health', value: 0, statusText: 'No data' }
  };
  const emptyGrowthMetrics = { mealLoggingTrend: null, userRetention: null };
  const emptySupport = { openTickets: 0 };
  const emptyActivity = [];
  const emptyLatency = { value: 0, status: 'Unknown' };

  const handleAddTenant = () => {
    alert('Add New Tenant functionality not implemented in demo.');
    // In a real app, this would navigate to a tenant creation form
  };

  const handleOpenInbox = () => {
    alert('Open Support Inbox functionality not implemented in demo.');
    // In a real app, this would navigate to the support ticket management page
  };

  const handleViewAllActivity = () => {
    alert('View All Recent Activity functionality not implemented in demo.');
    // In a real app, this would navigate to a detailed activity log page
  };

  return (
    React.createElement("div", { className: "flex min-h-screen bg-gray-100" },
      React.createElement(AdminSidebar, { onNavigate: onNavigate, currentPage: currentPage, onLogout: onLogout, user: user }),
      React.createElement("div", { className: "flex-1 p-6 overflow-auto" },
        React.createElement(AdminHeader, {
          title: "Admin Overview",
          subtitle: "Monitor system performance and tenant health.",
          primaryButtonText: "Add New Tenant", // Added primaryButtonText
          onPrimaryButtonClick: handleAddTenant
        }),

        /* Admin Overview Metrics Grid */
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6" },
          React.createElement(MetricCard, {
            title: emptyMetrics.totalActiveTenants.label,
            value: emptyMetrics.totalActiveTenants.value,
            subLabel: emptyMetrics.totalActiveTenants.subLabel,
            change: emptyMetrics.totalActiveTenants.change,
            status: emptyMetrics.totalActiveTenants.status
          }),
          React.createElement(MetricCard, {
            title: emptyMetrics.totalEcosystemUsers.label,
            value: emptyMetrics.totalEcosystemUsers.value,
            subText: emptyMetrics.totalEcosystemUsers.subText,
            icon: emptyMetrics.totalEcosystemUsers.icon
          }),
          React.createElement(SystemHealthCard, {
            title: emptyMetrics.systemHealth.label,
            value: emptyMetrics.systemHealth.value,
            statusText: emptyMetrics.systemHealth.statusText
          })
        ),

        /* Growth Metrics and Recent Activity */
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" },
          React.createElement("div", { className: "flex flex-col space-y-6" },
            React.createElement(GrowthMetricsCard, {
              mealLoggingData: emptyGrowthMetrics.mealLoggingTrend,
              userRetentionData: emptyGrowthMetrics.userRetention
            }),
            React.createElement(SupportQueueCard, {
              openTickets: emptySupport.openTickets,
              onOpenInbox: handleOpenInbox
            })
          ),
          React.createElement(RecentActivityCard, {
            activityData: emptyActivity,
            onViewAll: handleViewAllActivity
          })
        ),

        /* Pro-tip and API Latency */
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
          React.createElement("div", { className: "bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-200 flex items-start space-x-3 text-blue-800" },
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 flex-shrink-0 mt-0.5" },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.02M10.5 18.75H9a2.25 2.25 0 00-2.25 2.25V21h4.5v-2.25A2.25 2.25 0 0010.5 18.75zm6.75-10.5H18a2.25 2.25 0 012.25 2.25V21h-4.5v-2.25m-1.5 0a.75.75 0 00-1.5 0V21h3v-2.25z" })
            ),
            React.createElement("p", { className: "text-sm" },
              React.createElement("strong", { className: "font-semibold" }, "Tip:"), " Connect your data source to start seeing system insights."
            )
          ),
          React.createElement(ApiLatencyCard, {
            value: emptyLatency.value,
            status: emptyLatency.status
          })
        )
      )
    )
  );
};

export default AdminDashboardPage;
