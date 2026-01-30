import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar.js';
import AdminHeader from '../components/admin/AdminHeader.js';
import OverviewMetricCard from '../components/admin/analytics/OverviewMetricCard.js';
import SystemHealthOverviewCard from '../components/admin/analytics/SystemHealthOverviewCard.js';
import PlatformGrowthChart from '../components/admin/analytics/PlatformGrowthChart.js';
import TenantEngagementCard from '../components/admin/analytics/TenantEngagementCard.js';
import ReportGeneratorCard from '../components/admin/analytics/ReportGeneratorCard.js';

const AdminAnalyticsPage = ({ onNavigate, currentPage, onLogout, user }) => {
  const emptyOverview = {
    totalActiveUsers: { value: 0 },
    systemHealth: { value: 0, statusText: 'No data', status: 'neutral' },
    dailyMealsLogged: { value: 0 }
  };
  const emptyGrowthData = [];
  const emptyMonthChange = 'No data';
  const emptyEngagement = [];
  const reportTypeOptions = ['Select report'];
  const dateRangeOptions = ['Select range'];

  const handleGenerateReport = (reportType, dateRange) => {
    alert(`Generating '${reportType}' report for '${dateRange}' (Demo)`);
    // In a real application, this would trigger an API call to generate and download the report
  };

  return (
    React.createElement("div", { className: "flex min-h-screen bg-gray-100" },
      React.createElement(AdminSidebar, { onNavigate: onNavigate, currentPage: currentPage, onLogout: onLogout, user: user }),
      React.createElement("div", { className: "flex-1 p-6 overflow-auto" },
        React.createElement(AdminHeader, {
          title: "Analytics & Reporting",
          subtitle: "Monitor system performance and tenant health.",
          searchPlaceholder: "Search reports or data...", // Specific placeholder for analytics
        }),

        /* Key Metrics Overview */
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6" },
          React.createElement(OverviewMetricCard, {
            title: "Total Active Users",
            value: emptyOverview.totalActiveUsers.value,
          }),
          React.createElement(SystemHealthOverviewCard, {
            title: "System Health",
            value: emptyOverview.systemHealth.value,
            statusText: emptyOverview.systemHealth.statusText,
            status: emptyOverview.systemHealth.status,
          }),
          React.createElement(OverviewMetricCard, {
            title: "Daily Meals Logged",
            value: emptyOverview.dailyMealsLogged.value,
          })
        ),

        /* Platform Growth Chart and Tenant Engagement */
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" },
          React.createElement(PlatformGrowthChart, {
            data: emptyGrowthData,
            currentMonthChange: emptyMonthChange,
          }),
          React.createElement(TenantEngagementCard, { engagementData: emptyEngagement })
        ),

        /* Report Generator */
        React.createElement(ReportGeneratorCard, {
          reportTypes: reportTypeOptions,
          dateRanges: dateRangeOptions,
          onGenerateReport: handleGenerateReport,
        })
      )
    )
  );
};

export default AdminAnalyticsPage;
