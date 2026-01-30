import React from 'react';

const ApiLatencyCard = ({ value, status }) => {
  const hasData = Number.isFinite(value) && typeof status === 'string' && status.length > 0;
  const statusColorClass = status === 'Optimal' ? 'text-green-600' : 'text-orange-600';

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center justify-between text-sm" },
      React.createElement("p", { className: "text-gray-500 font-medium" }, "API LATENCY"),
      hasData ? (
        React.createElement("p", { className: `font-bold ${statusColorClass}` },
          value, "MS (", status.toUpperCase(), ")"
        )
      ) : (
        React.createElement("p", { className: "font-bold text-gray-500" }, "No data")
      )
    )
  );
};

export default ApiLatencyCard;
