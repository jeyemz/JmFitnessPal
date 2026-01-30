import React from 'react';

const FeatureCard = ({ icon, title, description, isLoggedIn }) => {
  if (isLoggedIn) {
    return null;
  }
  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300 border border-gray-100" },
      React.createElement("div", { className: "flex justify-center mb-4" }, icon),
      React.createElement("h3", { className: "text-xl font-bold text-gray-900 mb-3" }, title),
      React.createElement("p", { className: "text-gray-600 text-base" }, description)
    )
  );
};

export default FeatureCard;