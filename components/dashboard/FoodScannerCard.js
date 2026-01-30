import React from 'react';
import Button from '../Button.js';

const FoodScannerCard = () => {
  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex flex-col items-center justify-center text-center" },
      React.createElement("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-sm flex flex-col items-center justify-center min-h-[200px] mb-6" },
        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-12 h-12 text-blue-400 mb-4" },
          React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175m0 0a2.296 2.296 0 00-.91-.147C2.004 7.087 1 6.182 1 4.995V4.995c0-1.185 1.004-2.09 2.146-2.235a2.296 2.296 0 011.13-.175 2.309 2.309 0 011.157.174m7.904 0a2.31 2.31 0 011.157-.174c1.142-.145 2.146.76 2.146 1.945v.005c0 1.185-1.004 2.09-2.146 2.235a2.296 2.296 0 01-1.15.175m0 0a2.31 2.31 0 00-.91.147c-1.142.145-2.146 1.05-2.146 2.235V19.5c0 1.185 1.004 2.09 2.146 2.235a2.296 2.296 0 00.91.147m0 0a2.31 2.31 0 01.91-.147c1.142-.145 2.146-1.05 2.146-2.235V19.5c0-1.185-1.004-2.09-2.146-2.235a2.296 2.296 0 01-.91-.147m0 0a2.31 2.31 0 01-1.157-.174c-1.142-.145-2.146-.76-2.146-1.945V4.995c0-1.185 1.004-2.09 2.146-2.235a2.309 2.309 0 011.157-.174" })
        ),
        React.createElement("p", { className: "text-lg font-semibold text-gray-700 mb-2" }, "Drop food photo here"),
        React.createElement("p", { className: "text-sm text-gray-500" },
          "Our AI will automatically identify ingredients and calculate nutrition."
        )
      ),
      // Fix: Added children prop and onClick handler
      React.createElement(Button, { variant: "outline", className: "text-sm", onClick: () => console.log('Select from Gallery clicked') },
        "Select from Gallery"
      )
    )
  );
};

export default FoodScannerCard;