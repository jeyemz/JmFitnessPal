import React from 'react';
import Button from './Button.js';

const CallToAction = ({ onNavigate, isLoggedIn }) => {
  if (isLoggedIn) {
    return null;
  }
  return (
    React.createElement("section", { className: "py-12 md:py-16 text-center" },
      React.createElement("div", { className: "container mx-auto px-4" },
        React.createElement(Button, { variant: "primary", className: "text-lg py-4 px-10 shadow-lg", onClick: () => onNavigate('signup') },
          "Get Started Free"
        )
      )
    )
  );
};

export default CallToAction;