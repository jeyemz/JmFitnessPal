import React from 'react';

const NavLink = ({ href, children, className = '', onClick, ariaCurrent }) => {
  return (
    // Fix: Added aria-current to the underlying a element
    React.createElement("a", {
      href: href,
      onClick: onClick,
      className: `text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium ${className}`,
      "aria-current": ariaCurrent
    },
      children
    )
  );
};

export default NavLink;