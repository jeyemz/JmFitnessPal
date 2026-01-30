import React from 'react';

const TenantEngagementCard = ({ engagementData }) => {
  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex flex-col" },
      React.createElement("div", { className: "flex justify-between items-center mb-6" },
        React.createElement("h3", { className: "text-xl font-bold text-gray-900" }, "Tenant Engagement Comparison"),
        React.createElement("div", { className: "text-gray-500 hover:text-gray-700 cursor-pointer" },
          React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" })
          )
        )
      ),
      React.createElement("p", { className: "text-gray-600 text-sm mb-4" }, "Active logging score by organization"),

      React.createElement("div", { className: "space-y-4 flex-grow overflow-auto pr-2" },
        engagementData.length > 0 ? (
          engagementData.map((tenant, index) => (
            React.createElement("div", { key: index, className: "flex items-center" },
              React.createElement("p", { className: "w-24 text-sm font-medium text-gray-800" }, tenant.tenant),
              React.createElement("div", { className: "flex-grow bg-gray-200 rounded-full h-2.5 mx-4" },
                React.createElement("div", {
                  className: "bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out",
                  style: { width: `${tenant.score}%` }
                })
              ),
              React.createElement("span", { className: "text-sm text-gray-600 font-semibold w-10 text-right" }, tenant.score, "%")
            )
          ))
        ) : (
          React.createElement("p", { className: "text-sm text-gray-500" }, "No engagement data yet.")
        )
      )
    )
  );
};

export default TenantEngagementCard;
