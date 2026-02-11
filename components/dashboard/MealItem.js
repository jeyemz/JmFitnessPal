import React from 'react';
// import { Meal } from '../../data/dummyData.js'; // Removed: data/dummyData.js is now pure JS without interfaces

const CAKE_ICON = React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6 text-gray-400" },
  React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.081.768-2.015 1.837-2.175A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" })
);

const MealItem = ({ meal }) => {
  const { name, time, imageUrl, calories, protein, carbs, fat, isVerified, entryType } = meal;
  const hasImage = imageUrl && !imageUrl.startsWith('data:image/svg');

  return (
    React.createElement("div", { className: "flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors duration-200" },
      React.createElement("div", { className: "flex items-center" },
        hasImage
          ? React.createElement("img", { src: imageUrl, alt: name, className: "w-12 h-12 rounded-lg object-cover mr-4" })
          : React.createElement("div", { className: "w-12 h-12 rounded-lg bg-gray-200 mr-4 flex-shrink-0 flex items-center justify-center" }, CAKE_ICON),
        React.createElement("div", null,
          React.createElement("p", { className: "font-semibold text-gray-800" }, name),
          React.createElement("div", { className: "flex items-center text-xs text-gray-500" },
            time && React.createElement("span", null, time),
            isVerified && (
              React.createElement("span", { className: "ml-2 flex items-center text-green-700" },
                React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", className: "w-3 h-3 mr-1" },
                  React.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z", clipRule: "evenodd" })
                ),
                "AI Verified"
              )
            ),
            entryType && !isVerified && (
              React.createElement("span", { className: "ml-2 flex items-center text-gray-500" },
                React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-3 h-3 mr-1" },
                  React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14.75V21.75C18 22.302 17.552 22.75 17 22.75H2.25C1.698 22.75 1.25 22.302 1.25 21.75V7.25C1.25 6.698 1.698 6.25 2.25 6.25H9.25M18 14.75H14.25M14.25 14.75V11" })
                ),
                entryType
              )
            )
          )
        )
      ),
      React.createElement("div", { className: "text-right" },
        React.createElement("p", { className: "font-bold text-gray-900" }, calories, " cal"),
        React.createElement("p", { className: "text-xs text-gray-600" },
          protein, "g P \xB7 ", carbs, "g C \xB7 ", fat, "g F"
        )
      )
    )
  );
};

export default MealItem;