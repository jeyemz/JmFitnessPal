import React, { useState } from 'react';
import Button from './Button.js';
import NavLink from './NavLink.js';
import { authAPI } from '../services/api.js';

const LoginPage = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);
      console.log('Login successful:', response.user);
      onLoginSuccess(response.user);
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    React.createElement("section", { className: "flex items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white" },
      React.createElement("div", { className: "w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100 animate-fade-in-up" },
        React.createElement("h2", { className: "text-3xl font-bold text-gray-900 text-center mb-2" }, "Log In"),
        React.createElement("p", { className: "text-center text-sm text-gray-500 mb-6" }, "Welcome back! Sign in to continue."),
        
        /* Error message */
        error && React.createElement("div", { 
          className: "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center" 
        }, error),
        
        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
          React.createElement("div", null,
            React.createElement("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1" }, "Email"),
            React.createElement("input", {
              type: "email",
              id: "email",
              name: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              disabled: isLoading,
              placeholder: "e.g. you@example.com",
              autoComplete: "email",
              className: "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100",
              "aria-label": "Email address"
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1" }, "Password"),
            React.createElement("input", {
              type: "password",
              id: "password",
              name: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              required: true,
              disabled: isLoading,
              placeholder: "At least 8 characters",
              autoComplete: "current-password",
              className: "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100",
              "aria-label": "Password"
            }),
            React.createElement("div", { className: "flex items-center justify-between text-sm text-gray-500 mt-2" },
              React.createElement("span", null, "Use at least 8 characters."),
              React.createElement("button", { type: "button", className: "text-blue-600 hover:text-blue-700 font-medium" }, "Forgot password?")
            )
          ),
          React.createElement(Button, { 
            type: "submit", 
            variant: "primary", 
            className: "w-full py-2 text-lg",
            disabled: isLoading
          },
            isLoading ? "Logging in..." : "Login"
          )
        ),
        React.createElement("p", { className: "mt-6 text-center text-sm text-gray-600" },
          "Don't have an account?", ' ',
          React.createElement(NavLink, { href: "#", onClick: () => onNavigate('signup'), className: "font-semibold text-blue-600 hover:text-blue-700" },
            "Sign Up"
          )
        )
      )
    )
  );
};

export default LoginPage;
