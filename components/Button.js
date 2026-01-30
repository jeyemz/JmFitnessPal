import React from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
}) => {
  const baseStyles = 'px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out whitespace-nowrap';
  let variantStyles = '';

  switch (variant) {
    case 'primary':
      variantStyles = 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';
      break;
    case 'secondary':
      variantStyles = 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50';
      break;
    case 'outline':
      variantStyles = 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';
      break;
  }

  const disabledStyles = disabled ? 'opacity-60 cursor-not-allowed hover:bg-blue-600' : '';

  return (
    React.createElement("button", {
      type: type,
      onClick: onClick,
      disabled: disabled,
      "aria-disabled": disabled,
      className: `${baseStyles} ${variantStyles} ${disabledStyles} ${className}`
    },
      children
    )
  );
};

export default Button;
