import React from 'react';

const ScanSuccessCard = ({ percentage }) => {
  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between" },
      React.createElement("h3", { className: "text-sm uppercase text-gray-500 font-medium mb-4" }, "SCAN SUCCESS"),
      React.createElement("p", { className: "text-6xl font-extrabold text-gray-900" }, `${percentage}%`)
    )
  );
};

export default ScanSuccessCard;
