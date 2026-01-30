import React from 'react';

const FoodAnalysisCard = ({
  mealName,
  calories,
  imageUrl,
  analysisComplete,
  mealDetails,
  variant = 'default'
}) => {
  if (variant === 'overlay') {
    return React.createElement("div", { className: "bg-white rounded-xl shadow-lg p-3 flex items-center space-x-3 w-72 md:w-80" },
      React.createElement("div", { className: "flex-shrink-0" },
        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6 text-blue-500" },
          React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175m0 0a2.296 2.296 0 00-.91-.147C2.004 7.087 1 6.182 1 4.995V4.995c0-1.185 1.004-2.09 2.146-2.235a2.296 2.296 0 011.13-.175 2.309 2.309 0 011.157.174m7.904 0a2.31 2.31 0 011.157-.174c1.142-.145 2.146.76 2.146 1.945v.005c0 1.185-1.004 2.09-2.146 2.235a2.296 2.296 0 01-1.15.175m0 0a2.31 2.31 0 00-.91.147c-1.142.145-2.146 1.05-2.146 2.235V19.5c0 1.185 1.004 2.09 2.146 2.235a2.296 2.296 0 00.91.147m0 0a2.31 2.31 0 01.91-.147c1.142-.145 2.146-1.05 2.146-2.235V19.5c0-1.185-1.004-2.09-2.146-2.235a2.296 2.296 0 01-.91-.147m0 0a2.31 2.31 0 01-1.157-.174c-1.142-.145-2.146-.76-2.146-1.945V4.995c0-1.185 1.004-2.09 2.146-2.235a2.309 2.309 0 011.157-.174" })
        )
      ),
      React.createElement("div", { className: "flex-1 text-left" },
        analysisComplete && React.createElement("span", { className: "block text-green-700 text-xs font-semibold uppercase mb-1" }, "Analysis Complete"),
        React.createElement("p", { className: "text-sm font-medium text-gray-800 leading-tight" }, mealName)
      ),
      React.createElement("div", { className: "flex-shrink-0 text-right" },
        React.createElement("p", { className: "text-lg font-bold text-blue-600" }, calories),
        React.createElement("span", { className: "text-xs text-gray-500" }, "CALORIES")
      )
    );
  }

  // Default variant (original larger card)
  return (
    React.createElement("div", { className: "bg-white rounded-3xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 max-w-4xl mx-auto border border-gray-100 transform hover:shadow-xl transition-shadow duration-300" },
      /* Meal Image */
      React.createElement("div", { className: "flex-shrink-0" },
        React.createElement("img", {
          src: imageUrl,
          alt: mealName,
          className: "w-40 h-40 object-cover rounded-2xl shadow-md"
        })
      ),

      /* Analysis Details */
      React.createElement("div", { className: "flex-1 text-center md:text-left" },
        React.createElement("h3", { className: "text-2xl font-bold text-gray-900 mb-2" }, mealName),
        React.createElement("p", { className: "text-4xl font-extrabold text-blue-600 mb-4" },
          calories, " ",
          React.createElement("span", { className: "text-xl text-gray-600" }, "kcal")
        ),

        React.createElement("div", { className: "grid grid-cols-2 gap-x-4 gap-y-2 mb-6" },
          mealDetails.map((detail, index) => (
            React.createElement("div", { key: index, className: "flex items-center justify-center md:justify-start" },
              React.createElement("span", { className: "text-gray-500 text-sm md:text-base mr-2" }, detail.label, ":"),
              React.createElement("span", { className: "font-semibold text-gray-800 text-base md:text-lg" },
                detail.value,
                detail.unit
              )
            )
          ))
        ),

        /* Analysis Status */
        React.createElement("div", { className: "flex items-center justify-center md:justify-start" },
          analysisComplete ? (
            React.createElement("span", { className: "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 animate-fade-in" },
              React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" })
              ),
              "Analysis Complete"
            )
          ) : (
            React.createElement("div", { className: "w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700" },
              React.createElement("div", {
                className: "bg-blue-600 h-2.5 rounded-full animate-progress",
                style: { width: '80%' }
              }),
              React.createElement("span", { className: "text-sm text-gray-600 mt-2 block" }, "Analyzing...")
            )
          )
        )
      )
    )
  );
};

export default FoodAnalysisCard;