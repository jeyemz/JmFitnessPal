// This file was renamed from `constants.tsx` to `constants.js` to ensure proper import resolution.
import React from 'react';

// Navigation links for the landing page header (before login)
export const LANDING_NAV_LINKS = [
  { name: 'Home', href: '#home' },
  { name: 'Features', href: '#features' },
  { name: 'About', href: '#about' },
];

// Navigation links for the dashboard sidebar (after login)
export const DASHBOARD_NAV_LINKS = [
  {
    name: 'Dashboard',
    href: 'dashboard',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" })
      )
    ),
  },
  {
    name: 'Meal Log',
    href: 'meal-log',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12.75l3 3m0 0l3-3m-3 3v2.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
      )
    ),
  },
  {
    name: 'History',
    href: 'history',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" })
      )
    ),
  },
  {
    name: 'Profile',
    href: 'profile',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" })
      )
    ),
  },
];


export const FEATURES_DATA = [
  {
    title: 'AI Food Analysis',
    description: 'Instant calorie estimation using advanced computer vision. Just point and snap.', // Updated description
    icon: ( // Camera icon
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-8 h-8 text-blue-500 mb-4" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175m0 0a2.296 2.296 0 00-.91-.147C2.004 7.087 1 6.182 1 4.995V4.995c0-1.185 1.004-2.09 2.146-2.235a2.296 2.296 0 011.13-.175 2.309 2.309 0 011.157.174m7.904 0a2.31 2.31 0 011.157-.174c1.142-.145 2.146.76 2.146 1.945v.005c0 1.185-1.004 2.09-2.146 2.235a2.296 2.296 0 01-1.15.175m0 0a2.31 2.31 0 00-.91.147c-1.142.145-2.146 1.05-2.146 2.235V19.5c0 1.185 1.004 2.09 2.146 2.235a2.296 2.296 0 00.91.147m0 0a2.31 2.31 0 01.91-.147c1.142-.145 2.146-1.05 2.146-2.235V19.5c0-1.185-1.004-2.09-2.146-2.235a2.296 2.296 0 01-.91-.147m0 0a2.31 2.31 0 01-1.157-.174c-1.142-.145-2.146-.76-2.146-1.945V4.995c0-1.185 1.004-2.09 2.146-2.235a2.309 2.309 0 011.157-.174" })
      )
    ),
  },
  {
    title: 'Deep Analytics',
    description: 'Weekly trends and nutrient breakdowns to see exactly how your body is changing.', // Matches existing
    icon: ( // Chart/Wave icon
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-8 h-8 text-blue-500 mb-4" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 13.5l4.5 4.5L12 9l6.75 6.75L22 10.5M12 19.5v-7.5" })
      )
    ),
  },
  {
    title: 'Stay Connected',
    description: 'Syncs seamlessly with Apple Health, Garmin, and Fitbit to track your activity.', // Updated description
    icon: ( // Link/Sync icon
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-8 h-8 text-blue-500 mb-4" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" })
      )
    ),
  },
];


// Admin Dashboard Navigation Links
export const ADMIN_NAV_LINKS = [
  {
    name: 'Dashboard',
    href: 'admin-dashboard',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" })
      )
    ),
  },
  {
    name: 'Users',
    href: 'admin-users',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" })
      )
    ),
  },
  {
    name: 'AI Monitoring',
    href: 'admin-ai-monitoring',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5l4.179-2.25m0 4.5L12 12l5.571-3m-11.142 0L2.25 7.5l4.179-2.25M18.75 12l4.179-2.25m0 0l-4.179-2.25m4.179 2.25L12 14.25l-5.571 3" })
      )
    ),
  },
  {
    name: 'Analytics & Reporting',
    href: 'admin-analytics',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" }),
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" })
      )
    ),
  },
  {
    name: 'Food DB',
    href: 'admin-food-db',
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5v9l9 5.25m0-9v9" })
      )
    ),
  },
];


export const DUMMY_SEARCH_RESULTS = [
  {
    id: 's1',
    name: 'Avocado Toast',
    description: '1 slice • 160 kcal',
    iconUrl: 'https://cdn.icon-icons.com/icons2/1004/PNG/512/fork_spoon_icon-icons.com_75111.png', // Generic fork & spoon
    iconBgColor: 'bg-blue-100 text-blue-600',
  },
  {
    id: 's2',
    name: 'Poached Egg',
    description: 'Large • 72 kcal',
    iconUrl: 'https://www.svgrepo.com/show/365147/egg.svg', // Generic egg
    iconBgColor: 'bg-orange-100 text-orange-600',
  },
  {
    id: 's3',
    name: 'Quinoa Salad',
    description: '1 cup • 222 kcal',
    iconUrl: 'https://www.svgrepo.com/show/472491/salad.svg', // Generic salad leaf
    iconBgColor: 'bg-green-100 text-green-600',
  },
  {
    id: 's4',
    name: 'Oat Milk Latte',
    description: '12 oz • 130 kcal',
    iconUrl: 'https://www.svgrepo.com/show/486242/coffee-cup.svg', // Generic coffee cup
    iconBgColor: 'bg-purple-100 text-purple-600',
  },
];

export const DUMMY_MEAL_LOG_SUMMARY = {
  totalCalories: 1450,
  protein: { value: 92, percentage: 40 },
  carbs: { value: 145, percentage: 35 },
  fats: { value: 54, percentage: 25 },
};

export const DUMMY_DAILY_MEAL_BREAKDOWN = [
  {
    id: 'm1',
    name: 'Breakfast',
    totalCalories: 420,
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 text-orange-500" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 21v-2.25m-6.364-.386l1.591-1.591M3 12H5.25m-.386-6.364l1.591 1.591M12 12a3 3 0 11-6 0 3 3 0 016 0z" })
      )
    ),
    items: [
      {
        id: 'b1',
        name: 'Greek Yogurt & Blueberries',
        imageUrl: 'https://images.unsplash.com/photo-1594950796078-d45095690b29?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        calories: 320,
        protein: 24,
        carbs: 12,
        fat: 8,
        isVerified: true,
      },
      {
        id: 'b2',
        name: 'Black Coffee',
        description: '12 oz',
        imageUrl: 'https://images.unsplash.com/photo-1517454236465-950c4b2b64d4?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        calories: 5,
        protein: 0,
        carbs: 0,
        fat: 0,
        isVerified: false,
      },
    ],
  },
  {
    id: 'm2',
    name: 'Lunch',
    totalCalories: 580,
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 text-yellow-500" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6.75a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5a.75.75 0 01.75-.75zM15 11.25a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5a.75.75 0 01.75-.75zM9 11.25a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5a.75.75 0 01.75-.75z" })
      )
    ),
    items: [
      {
        id: 'l1',
        name: 'Grilled Chicken Salad',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a573bce6de78?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        calories: 430,
        protein: 42,
        carbs: 15,
        fat: 22,
        isVerified: true,
      },
    ],
  },
  {
    id: 'm3',
    name: 'Dinner',
    totalCalories: 0, // No dinner logged yet
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 text-indigo-500" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.61.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" })
      )
    ),
    items: [],
  },
  {
    id: 'm4',
    name: 'Snacks',
    totalCalories: 150,
    icon: (
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 text-fuchsia-500" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" })
      )
    ),
    items: [
      {
        id: 's1',
        name: 'Red Apple',
        description: 'Medium',
        imageUrl: 'https://images.unsplash.com/photo-1576186716279-d3527a20c3a2?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        isVerified: false,
      },
    ],
  },
];

export const MACRO_PRESETS = {
  'Balanced': { carbs: 45, protein: 30, fat: 25, description: '45% Carbs, 30% Protein, 25% Fat' },
  'High Protein': { carbs: 35, protein: 40, fat: 25, description: '35% Carbs, 40% Protein, 25% Fat' },
  'Low Carb': { carbs: 20, protein: 40, fat: 40, description: '20% Carbs, 40% Protein, 40% Fat' },
};
