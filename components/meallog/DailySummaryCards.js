import React from 'react';
import SummaryCard from './SummaryCard.js';

const DailySummaryCards = ({ summary }) => {
  const safeSummary = summary || {
    totalCalories: 0,
    protein: { value: 0, percentage: 0 },
    carbs: { value: 0, percentage: 0 },
    fats: { value: 0, percentage: 0 }
  };

  return (
    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" },
      React.createElement(SummaryCard, {
        title: "Total",
        value: safeSummary.totalCalories,
        unit: "kcal",
        valueClassName: "text-3xl",
        // Fix: Changed 'progressPercentage' to 'percentage' to match SummaryCardProps
        percentage: Math.round((safeSummary.totalCalories / 2000) * 100), // Assuming a daily goal of 2000 for progress
        colorClass: "text-gray-900"
      }),
      React.createElement(SummaryCard, {
        title: "Protein",
        value: safeSummary.protein.value,
        unit: "g",
        percentage: safeSummary.protein.percentage,
        colorClass: "text-orange-500"
      }),
      React.createElement(SummaryCard, {
        title: "Carbs",
        value: safeSummary.carbs.value,
        unit: "g",
        percentage: safeSummary.carbs.percentage,
        colorClass: "text-blue-500"
      }),
      React.createElement(SummaryCard, {
        title: "Fats",
        value: safeSummary.fats.value,
        unit: "g",
        percentage: safeSummary.fats.percentage,
        colorClass: "text-green-500"
      })
    )
  );
};

export default DailySummaryCards;
