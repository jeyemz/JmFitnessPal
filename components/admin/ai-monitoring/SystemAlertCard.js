import React from 'react';

const SystemAlertCard = ({ message }) => {
  return (
    React.createElement("div", { className: "mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 text-red-800" },
      React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 flex-shrink-0 mt-0.5" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v3.75m-9.303 3.376c-.866 1.5.305 3.254 1.907 3.254h12.18c1.602 0 2.773-1.754 1.907-3.254L13.736 7.942a3.75 3.75 0 00-6.472 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" })
      ),
      React.createElement("div", null,
        React.createElement("p", { className: "text-sm font-semibold" }, "SYSTEM ALERT"),
        React.createElement("p", { className: "text-xs mt-0.5" }, message),
        React.createElement("a", { href: "#", className: "text-xs underline mt-1 block" }, "View Settings / Logs")
      )
    )
  );
};

export default SystemAlertCard;
