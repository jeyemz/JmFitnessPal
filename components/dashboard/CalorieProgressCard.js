import React from 'react';

const CalorieProgressCard = ({ intake, goal }) => {
  const percentage = Math.min(100, (intake / goal) * 100);
  const strokeDasharray = 2 * Math.PI * 70; // Circumference of the circle (radius 70)
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;
  const kcalLeft = Math.max(0, goal - intake);

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100" },
      React.createElement("div", { className: "relative w-40 h-40 mx-auto mb-6" },
        React.createElement("svg", { className: "w-full h-full transform -rotate-90", viewBox: "0 0 160 160" },
          React.createElement("circle", {
            className: "text-gray-200",
            strokeWidth: "15",
            stroke: "currentColor",
            fill: "transparent",
            r: "70",
            cx: "80",
            cy: "80"
          }),
          React.createElement("circle", {
            className: "text-blue-500 transition-all duration-500 ease-out",
            strokeWidth: "15",
            strokeDasharray: strokeDasharray,
            strokeDashoffset: strokeDashoffset,
            strokeLinecap: "round",
            stroke: "currentColor",
            fill: "transparent",
            r: "70",
            cx: "80",
            cy: "80"
          })
        ),
        React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center" },
          React.createElement("span", { className: "text-4xl font-bold text-gray-900" }, kcalLeft.toLocaleString()),
          React.createElement("span", { className: "text-sm text-gray-500 uppercase" }, "cal left")
        )
      ),

      React.createElement("div", { className: "flex justify-between items-center text-gray-600" },
        React.createElement("div", null,
          React.createElement("p", { className: "text-sm uppercase mb-1" }, "Intake"),
          React.createElement("p", { className: "text-lg font-bold text-gray-800" }, intake.toLocaleString(), " cal")
        ),
        React.createElement("div", null,
          React.createElement("p", { className: "text-sm uppercase mb-1" }, "Goal"),
          React.createElement("p", { className: "text-lg font-bold text-gray-800" }, goal.toLocaleString(), " cal")
        )
      )
    )
  );
};

export default CalorieProgressCard;