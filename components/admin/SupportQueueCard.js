import React from 'react';
import Button from '../Button.js';

const SupportQueueCard = ({ openTickets, onOpenInbox }) => {
  const hasTickets = Number.isFinite(openTickets) && openTickets > 0;

  return (
    React.createElement("div", { className: "bg-blue-600 rounded-xl shadow-lg p-6 text-white flex items-center justify-between" },
      React.createElement("div", { className: "flex items-center" },
        React.createElement("div", { className: "p-3 rounded-full bg-blue-500 mr-4 flex-shrink-0" },
          React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-4.5-9a2.25 2.25 0 00-2.25-2.25H11.25a2.25 2.25 0 00-2.25 2.25V9m4.5-9V3m-4.5 0V3M8.25 6.75h-2.25m6.75 0H12m-.75 3h.008v.008H11.25v-.008zm0 3h.008v.008H11.25v-.008zm0 3h.008v.008H11.25v-.008zM12 6.75h.008v.008H12v-.008zm0 3h.008v.008H12v-.008zm0 3h.008v.008H12v-.008z" })
          )
        ),
        React.createElement("div", null,
          React.createElement("h3", { className: "text-xl font-bold mb-1" }, "Support Queue"),
          React.createElement("p", { className: "text-sm opacity-90" },
            hasTickets ? `${openTickets} open tickets require administrator attention` : "No open tickets yet."
          )
        )
      ),
      React.createElement(Button, { variant: "secondary", onClick: onOpenInbox, className: "bg-white text-blue-600 hover:bg-gray-100" },
        "Open Inbox"
      )
    )
  );
};

export default SupportQueueCard;
