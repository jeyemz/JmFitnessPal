import React, { useState, useEffect } from 'react';
import Header from './components/Header.js';
import Hero from './components/Hero.js';
import FeatureCard from './components/FeatureCard.js';
import CallToAction from './components/CallToAction.js';
import LoginPage from './components/LoginPage.js';
import SignUpPage from './components/SignUpPage.js';
import DashboardPage from './pages/DashboardPage.js';
import AdminDashboardPage from './pages/AdminDashboardPage.js';
import AdminUserManagementPage from './pages/AdminUserManagementPage.js';
import AdminFoodDatabasePage from './pages/AdminFoodDatabasePage.js'; // New import for AdminFoodDatabasePage
import AdminAnalyticsPage from './pages/AdminAnalyticsPage.js'; // New import for AdminAnalyticsPage
import AdminAIMonitoringPage from './pages/AdminAIMonitoringPage.js'; // New import for AdminAIMonitoringPage
import { FEATURES_DATA } from './constants.js';
import { authAPI } from './services/api.js';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = authAPI.getStoredUser();
    if (storedUser && authAPI.isAuthenticated()) {
      setUser(storedUser);
      setIsLoggedIn(true);
      // Navigate based on role
      if (storedUser.role === 'admin') {
        setCurrentPage('admin-dashboard');
      } else {
        setCurrentPage('dashboard');
      }
    }
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    // Scroll to top or specific section for landing page links
    if (!isLoggedIn && (page === 'home' || page === 'features' || page === 'about')) {
      const element = document.getElementById(page);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (page === 'home') { // For the main 'Home' link which might not have a distinct section ID
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const onLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    // Navigate based on user role
    if (userData.role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const onSignUpSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('dashboard'); // Redirect to user dashboard after successful sign-up
  };

  const onLogout = () => {
    authAPI.logout();
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  const onUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const renderContent = () => {
    if (isLoggedIn) {
      if (currentPage.startsWith('admin-')) {
        switch (currentPage) {
          case 'admin-dashboard':
            return React.createElement(AdminDashboardPage, { onNavigate: handleNavigate, currentPage: currentPage, onLogout: onLogout, user: user });
          case 'admin-users':
            return React.createElement(AdminUserManagementPage, { onNavigate: handleNavigate, currentPage: currentPage, onLogout: onLogout, user: user });
          case 'admin-tenants': // Assuming a tenants page exists or will exist
            return React.createElement(AdminUserManagementPage, { onNavigate: handleNavigate, currentPage: currentPage, onLogout: onLogout, user: user }); // Placeholder for now, can create a dedicated tenant page later
          case 'admin-ai-monitoring':
            return React.createElement(AdminAIMonitoringPage, { onNavigate: handleNavigate, currentPage: currentPage, onLogout: onLogout, user: user });
          case 'admin-analytics':
            return React.createElement(AdminAnalyticsPage, { onNavigate: handleNavigate, currentPage: currentPage, onLogout: onLogout, user: user });
          case 'admin-food-db': // New case for Admin Food Database Management
            return React.createElement(AdminFoodDatabasePage, { onNavigate: handleNavigate, currentPage: currentPage, onLogout: onLogout, user: user });
          // Add other admin pages here as needed
          default:
            return React.createElement(AdminDashboardPage, { onNavigate: handleNavigate, currentPage: 'admin-dashboard', onLogout: onLogout, user: user });
        }
      } else {
        return (
          React.createElement(DashboardPage, {
            onNavigate: handleNavigate,
            currentPage: currentPage,
            onLogout: onLogout,
            user: user,
            onUserUpdate: onUserUpdate
          })
        );
      }
    } else {
      switch (currentPage) {
        case 'login':
          return React.createElement(LoginPage, { onNavigate: handleNavigate, onLoginSuccess: onLoginSuccess });
        case 'signup':
          return React.createElement(SignUpPage, { onNavigate: handleNavigate, onSignUpSuccess: onSignUpSuccess });
        case 'home':
        case 'features':
        case 'about':
        default:
          return (
            React.createElement(React.Fragment, null,
              React.createElement(Hero, { onNavigate: handleNavigate, isLoggedIn: isLoggedIn }),

              /* Introductory text for Features Section */
              React.createElement("section", { className: "py-16 md:py-24 text-center" },
                React.createElement("div", { className: "container mx-auto px-4" },
                  React.createElement("h2", { className: "text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6" },
                    "Effortless tracking for your health."
                  ),
                  React.createElement("p", { className: "text-lg md:text-xl text-gray-600 max-w-3xl mx-auto lg:mx-0" },
                    "Our smart tools take the guesswork out of nutrition. Built for performance, designed for you."
                  )
                )
              ),

              /* Features Section */
              React.createElement("section", { id: "features", className: "pb-16 md:pb-24 bg-gradient-to-tr from-white to-blue-50" },
                React.createElement("div", { className: "container mx-auto px-4 text-center" },
                  React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" },
                    FEATURES_DATA.map((feature, index) => (
                      React.createElement(FeatureCard, { key: index, ...feature, isLoggedIn: isLoggedIn })
                    ))
                  )
                )
              ),

              React.createElement(CallToAction, { onNavigate: handleNavigate, isLoggedIn: isLoggedIn })
            )
          );
      }
    }
  };

  return (
    React.createElement("div", { className: "min-h-screen flex flex-col" },
      React.createElement(Header, { onNavigate: handleNavigate, isLoggedIn: isLoggedIn }),
      React.createElement("main", { className: "flex-grow" },
        renderContent()
      ),

      /* Footer - Only show on landing page */
      !isLoggedIn && (
        React.createElement("footer", { className: "bg-gray-800 text-white py-8 text-center" },
          React.createElement("div", { className: "container mx-auto px-4" },
            React.createElement("p", null,
              "© ", new Date().getFullYear(), " AI Tracker. All rights reserved."
            )
          )
        )
      )
    )
  );
};

export default App;
