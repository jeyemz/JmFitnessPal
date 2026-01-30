// data/adminDummyData.js
import React from 'react';

export const ADMIN_USER = {
  name: 'Alex Johnson',
  role: 'Global Manager', // Updated role for AI monitoring page header
  avatar: 'https://cdn.icon-icons.com/icons2/2643/PNG/512/man_boy_person_avatar_user_icon_159389.png',
};

export const ADMIN_OVERVIEW_METRICS = {
  totalActiveTenants: {
    value: 142,
    change: 8.4, // percentage
    status: 'growth', // 'growth' or 'decline'
    label: 'Total Active Tenants',
    subLabel: 'GLOBAL',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6 text-blue-500" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M18 18.75V10.5m0 0a2.25 2.25 0 00-2.25-2.25H13.5m0 0a2.25 2.25 0 00-2.25 2.25V18m-9 3.75h18c.621 0 1.125-.504 1.125-1.125V15.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0a2.25 2.25 0 00-2.25 2.25V18m0 0a2.25 2.25 0 00-2.25 2.25H6.75m-3 0v-3.375c0-.621.504-1.125 1.125-1.125H7.5m-3 0a2.25 2.25 0 00-2.25 2.25V21M12 4.5V9" })
      )
    ),
  },
  totalEcosystemUsers: {
    value: 84209,
    subText: 'Active this month',
    label: 'Total Ecosystem Users',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6 text-purple-500" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" })
      )
    ),
  },
  systemHealth: {
    value: 99.2, // percentage
    statusText: 'Uptime across all shards',
    label: 'System Health',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6 text-green-500" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
      )
    ),
  },
};

export const GROWTH_METRICS_DATA = {
  mealLoggingTrend: {
    value: 450210,
    change: 12, // percentage
    status: 'increase', // 'increase' or 'decrease'
    label: 'Meal Logging Trend',
    periodText: 'vs last month',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6 text-yellow-600" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6.75a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5a.75.75 0 01.75-.75zM15 11.25a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5a.75.75 0 01.75-.75zM9 11.25a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5a.75.75 0 01.75-.75z" })
      )
    ),
  },
  userRetention: {
    value: 68.4, // percentage
    change: 2.1, // percentage
    status: 'improvement', // 'improvement' or 'decline'
    label: 'User Retention',
    periodText: 'improvement',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6 text-pink-500" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 13.5l4.5 4.5L12 9l6.75 6.75L22 10.5M12 19.5v-7.5" })
      )
    ),
  },
};

export const SUPPORT_QUEUE_DATA = {
  openTickets: 24,
};

export const RECENT_ACTIVITY_DATA = [
  {
    id: 'act1',
    tenant: 'NutriHealth Corp',
    tenantInitials: 'NH',
    color: 'bg-blue-200 text-blue-800',
    description: 'Onboarded 125 new premium members',
    timestamp: '2m ago',
  },
  {
    id: 'act2',
    tenant: 'FitTrack Solutions',
    tenantInitials: 'FT',
    color: 'bg-yellow-200 text-yellow-800',
    description: 'Database sync completed for Q3 data',
    timestamp: '45m ago',
  },
  {
    id: 'act3',
    tenant: 'GlobalLife Insure',
    tenantInitials: 'GL',
    color: 'bg-red-200 text-red-800',
    description: 'New high-priority support ticket opened',
    timestamp: '2h ago',
  },
  {
    id: 'act4',
    tenant: 'PureFood Analytics',
    tenantInitials: 'PF',
    color: 'bg-purple-200 text-purple-800',
    description: 'Custom API integration active',
    timestamp: '5h ago',
  },
  {
    id: 'act5',
    tenant: 'ActiveCare Net',
    tenantInitials: 'AC',
    color: 'bg-green-200 text-green-800',
    description: 'Tenant subscription renewed',
    timestamp: 'Yesterday',
  },
];

export const API_LATENCY_DATA = {
  value: 12, // ms
  status: 'Optimal',
};

// --- DUMMY ADMIN USERS DATA ---
export const DUMMY_ADMIN_USERS = [
  {
    id: 'user1',
    name: 'John Doe',
    initials: 'JD',
    avatar: '', // Using initials instead
    email: 'john.doe@example.com',
    tenant: 'HEALTHFIRST CLINIC',
    role: 'Admin',
    status: 'active',
    lastActive: '2m ago',
    details: 'Admin user for HealthFirst Clinic. Manages patient data and team access.',
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    initials: 'JS',
    avatar: '',
    email: 'jane.s@fitcorp.com',
    tenant: 'FITCORP',
    role: 'User',
    status: 'active',
    lastActive: '45m ago',
    details: 'Regular user from FitCorp. Focuses on personal fitness tracking.',
  },
  {
    id: 'user3',
    name: 'Robert Brown',
    initials: 'RB',
    avatar: '',
    email: 'robert@wellness.io',
    tenant: 'WELLNESS IO',
    role: 'Guest',
    status: 'inactive',
    lastActive: '3d ago',
    details: 'Guest account for Wellness IO. Limited access for trial period.',
  },
  {
    id: 'user4',
    name: 'Alice Wilson',
    initials: 'AW',
    avatar: '',
    email: 'alice.w@healthfirst.com',
    tenant: 'HEALTHFIRST CLINIC',
    role: 'User',
    status: 'pending',
    lastActive: '5d ago',
    details: 'New user awaiting activation for HealthFirst Clinic.',
  },
  {
    id: 'user5',
    name: 'Michael Chen',
    initials: 'MC',
    avatar: '',
    email: 'michael.c@nutrihealth.com',
    tenant: 'NUTRIHEALTH CORP',
    role: 'Manager',
    status: 'active',
    lastActive: '1h ago',
    details: 'Manager at NutriHealth Corp. Oversees a team of nutritionists.',
  },
  {
    id: 'user6',
    name: 'Sarah Lee',
    initials: 'SL',
    avatar: '',
    email: 'sarah.l@globalife.com',
    tenant: 'GLOBALLIFE INSURE',
    role: 'User',
    status: 'active',
    lastActive: '2h ago',
    details: 'Employee at GlobalLife Insure. Uses the platform for wellness programs.',
  },
  {
    id: 'user7',
    name: 'David Kim',
    initials: 'DK',
    avatar: '',
    email: 'david.k@wellness.io',
    tenant: 'WELLNESS IO',
    role: 'Admin',
    status: 'suspended',
    lastActive: '1w ago',
    details: 'Admin for Wellness IO. Account temporarily suspended for review.',
  },
  {
    id: 'user8',
    name: 'Emily Davis',
    initials: 'ED',
    avatar: '',
    email: 'emily.d@fitcorp.com',
    tenant: 'FITCORP',
    role: 'User',
    status: 'active',
    lastActive: '10m ago',
    details: 'Active user at FitCorp. Frequently logs meals and workouts.',
  },
];


// --- ADMIN ANALYTICS DUMMY DATA ---
export const ADMIN_ANALYTICS_OVERVIEW_DATA = {
  totalActiveUsers: {
    value: 128430,
    change: 12, // percentage
    changePeriod: 'vs last month',
    status: 'growth',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-8 h-8 text-blue-500" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19.125m-6.75 0a9 9 0 1 1 13.5 0M21 12a9 9 0 1 1-18 0" }),
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.5 10.5h.008v.008H10.5V10.5zm.375 0h.008v.008h-.008V10.5zm.375 0h.008v.008h-.008V10.5zm.375 0h.008v.008h-.008V10.5zm.375 0h.008v.008h-.008V10.5zm.375 0h.008v.008h-.008V10.5zm.375 0h.008v.008h-.008V10.5zM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" })
      )
    ),
  },
  systemHealth: {
    value: 99.9, // percentage
    statusText: 'All systems operational',
    status: 'good', // 'good', 'warning', 'critical'
  },
  dailyMealsLogged: {
    value: 42892,
    change: 5.4, // percentage
    changePeriod: 'today',
    status: 'growth',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-8 h-8 text-orange-500" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.53 16.122a3 3 0 00-5.78 1.124.75.75 0 01-1.072.066 4.5 4.5 0 008.03-2.821.75.75 0 01-.432-.977L9.53 16.122zM12.72 4.31a3 3 0 00-5.727 1.118.75.75 0 01-1.05.06 4.5 4.5 0 007.989-2.812.75.75 0 01-.432-.966L12.72 4.31z" }),
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21.75 12a9 9 0 11-18 0 9 9 0 0118 0z" })
      )
    ),
  },
};

export const ADMIN_PLATFORM_GROWTH_DATA = [
  { month: 'JAN', users: 50000 },
  { month: 'FEB', users: 55000 },
  { month: 'MAR', users: 62000 },
  { month: 'APR', users: 70000 },
  { month: 'MAY', users: 78000 },
  { month: 'JUN', users: 85000 },
];
export const ADMIN_PLATFORM_GROWTH_CURRENT_MONTH_CHANGE = '+15k this month';

export const ADMIN_TENANT_ENGAGEMENT_DATA = [
  { tenant: 'Tenant A', score: 85 },
  { tenant: 'Tenant B', score: 72 },
  { tenant: 'Tenant C', score: 91 },
  { tenant: 'Tenant D', score: 68 },
  { tenant: 'Tenant E', score: 79 },
];

export const REPORT_TYPES_OPTIONS = [
  'System Performance Overview',
  'User Activity Report',
  'Tenant Engagement Summary',
  'AI Usage Statistics',
  'Food Database Audit',
];

export const DATE_RANGE_OPTIONS = [
  'Last 7 Days',
  'Last 30 Days',
  'Last 90 Days',
  'Last 6 Months',
  'Last 12 Months',
  'Custom Range',
];

// --- AI MONITORING DUMMY DATA ---
export const AI_MONITORING_OVERVIEW_DATA = {
  scanSuccess: 95, // percentage
  systemStatus: 'Healthy', // 'Healthy', 'Warning', 'Critical'
  // Fix: Initialized systemAlert with a string to resolve linter warning about condition always being false.
  systemAlert: 'Failure threshold exceeded (DEMO)', // Set to a string like 'Failure threshold exceeded' to show the alert
};

export const RECENT_AI_SCANS = [
  {
    id: 'scan1',
    foodName: 'Avocado Toast',
    imageUrl: 'https://images.unsplash.com/photo-1579208030886-d99283ae051e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 350,
    confidence: 'High',
  },
  {
    id: 'scan2',
    foodName: 'Grilled Chicken Salad',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a573bce6de78?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 420,
    confidence: 'Medium',
  },
  {
    id: 'scan3',
    foodName: 'Tonkotsu Ramen',
    imageUrl: 'https://images.unsplash.com/photo-1623979402500-1114b0965e10?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 850,
    confidence: 'Low',
  },
  {
    id: 'scan4',
    foodName: 'Berry Smoothie',
    imageUrl: 'https://images.unsplash.com/photo-1505253716368-a472c9d74966?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 210,
    confidence: 'High',
  },
  {
    id: 'scan5',
    foodName: 'Steak & Potatoes',
    imageUrl: 'https://images.unsplash.com/photo-1632782161168-f9b1d92d1a3e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 680,
    confidence: 'Medium',
  },
];