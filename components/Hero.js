import React from 'react';
import Button from './Button.js';
import FoodAnalysisCard from './FoodAnalysisCard.js';

const Hero = ({ onNavigate, isLoggedIn }) => {
  if (isLoggedIn) {
    return null;
  }

  return (
    React.createElement("section", { id: "home", className: "relative bg-gradient-to-br from-blue-50 to-white py-16 md:py-24 overflow-hidden" },
      React.createElement("div", { className: "container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-12" },
        /* Left Content */
        React.createElement("div", { className: "flex-1 text-center lg:text-left animate-fade-in-up" },
          React.createElement("h1", { className: "text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6" },
            "Track your nutrition with ",
            React.createElement("span", { className: "text-blue-600" }, "AI simplicity."),
          ),
          React.createElement("p", { className: "text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0" },
            "No more manual entry. Snap a photo of your meal and let our AI handle the macros. Achieve your fitness goals faster."
          ),
          React.createElement("div", { className: "flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-12" },
            React.createElement(Button, { variant: "primary", className: "text-lg py-3 px-8", onClick: () => onNavigate('signup') },
              "Get Started Free"
            ),
            React.createElement(Button, { variant: "outline", className: "text-lg py-3 px-8" },
              "See How It Works"
            )
          ),

          
        ),

        /* Right Image with Overlay */
        React.createElement("div", { className: "flex-1 flex justify-center lg:justify-end animate-fade-in-left relative" },
          React.createElement("img", {
            src: "https://images.unsplash.com/photo-1546069901-d0b5d848e02d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            alt: "Delicious food bowl for calorie tracking",
            className: "max-w-full h-auto rounded-3xl shadow-xl transform hover:scale-105 transition-transform duration-500"
          }),
          /* Food Analysis Overlay */
          React.createElement("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2" },
            React.createElement(FoodAnalysisCard, {
              variant: "overlay",
              mealName: "Avocado & Egg Salad Bowl",
              calories: 420,
              analysisComplete: true,
              imageUrl: "", // Dummy value, not used in overlay variant
              mealDetails: [], // Dummy value, not used in overlay variant
            })
          )
        )
      )
    )
  );
};

export default Hero;
