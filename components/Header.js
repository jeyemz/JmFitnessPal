import React, { useState } from 'react';
import NavLink from './NavLink.js';
import Button from './Button.js';
import { LANDING_NAV_LINKS } from '../constants.js'; // Updated import path

const Header = ({ onNavigate, isLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);

  // This Header only displays on the landing page, so we don't need to show it if logged in
  if (isLoggedIn) {
    return null;
  }

  const handleLinkClick = (page) => {
    setIsOpen(false); // Close mobile menu on navigation
    onNavigate(page);
  };

  return (
    React.createElement("header", { className: "sticky top-0 z-50 bg-white shadow-sm" },
      React.createElement("nav", { className: "container mx-auto px-4 py-4 flex items-center justify-between" },
        /* Logo */
        React.createElement("div", { className: "flex items-center" },
          React.createElement("a", { href: "#", onClick: () => handleLinkClick('home'), className: "text-2xl font-bold text-gray-900 flex items-center" },
            React.createElement("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "currentColor",
              className: "w-6 h-6 text-blue-600 mr-2"
            },
              React.createElement("path", {
                d: "M3 9a2 2 0 012-2h1V6a2 2 0 114 0v1h4V6a2 2 0 114 0v1h1a2 2 0 012 2v2a2 2 0 01-2 2h-1v1a2 2 0 11-4 0v-1H10v1a2 2 0 11-4 0v-1H5a2 2 0 01-2-2V9zm3 0v2h12V9H6z"
              })
            ),
            "JmFitnessPal"
          )
        ),

        /* Mobile menu button */
        React.createElement("div", { className: "lg:hidden" },
          React.createElement("button", {
            onClick: () => setIsOpen(!isOpen),
            className: "text-gray-800 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500",
            "aria-label": "Toggle navigation"
          },
            React.createElement("svg", {
              className: "h-6 w-6",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              xmlns: "http://www.w3.org/2000/svg"
            },
              isOpen ? (
                React.createElement("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "2",
                  d: "M6 18L18 6M6 6l12 12"
                })
              ) : (
                React.createElement("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "2",
                  d: "M4 6h16M4 12h16M4 18h16"
                })
              )
            )
          )
        ),

        /* Desktop navigation */
        React.createElement("div", { className: "hidden lg:flex items-center space-x-8" },
          LANDING_NAV_LINKS.map((link) => (
             React.createElement(NavLink, { key: link.name, href: link.href, onClick: () => handleLinkClick(link.href.replace('#', '')) },
                link.name
              )
          )),
          React.createElement(Button, { variant: "outline", className: "text-sm", onClick: () => handleLinkClick('login') }, "Log In"),
          React.createElement(Button, { variant: "primary", className: "text-sm", onClick: () => handleLinkClick('signup') },
            "Get Started"
          )
        ),

        /* Mobile menu (toggled) */
        isOpen && (
          React.createElement("div", { className: "lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4 flex flex-col items-center space-y-4 animate-fade-in-down" },
            LANDING_NAV_LINKS.map((link) => (
              React.createElement(NavLink, { key: link.name, href: link.href, onClick: () => handleLinkClick(link.href.replace('#', '')) },
                  link.name
                )
            )),
            React.createElement(Button, { variant: "outline", className: "w-fit text-sm", onClick: () => handleLinkClick('login') }, "Log In"),
            React.createElement(Button, { variant: "primary", className: "w-fit text-sm", onClick: () => handleLinkClick('signup') },
              "Get Started"
            )
          )
        )
      )
    )
  );
};

export default Header;
