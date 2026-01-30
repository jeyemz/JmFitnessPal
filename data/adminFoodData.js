// data/adminFoodData.js
import React from 'react';

export const DUMMY_FOOD_STATS = {
  totalFoodItems: {
    value: 12402,
    change: 124, // number of new items
    period: 'this week',
  },
  pendingApproval: {
    value: 48,
  },
  aiVerifiedPercentage: {
    value: 94, // percentage
  },
};

export const DUMMY_FOOD_ITEMS = [
  {
    id: 'food1',
    name: 'Grilled Salmon Teriyaki',
    description: 'Seafood • 150g portion',
    calories: 320,
    protein: 28,
    carbs: 12,
    fats: 16,
    source: 'User Submitted',
    status: 'pending',
    category: 'Seafood',
  },
  {
    id: 'food2',
    name: 'Homemade Vegan Burrito',
    description: 'Plant-based • Custom',
    calories: 485,
    protein: 18,
    carbs: 62,
    fats: 14,
    source: 'AI Analysis (89%)',
    status: 'pending',
    category: 'Vegan',
  },
  {
    id: 'food3',
    name: 'Avocado Toast w/ Egg',
    description: 'Breakfast • Per portion',
    calories: 295,
    protein: 12,
    carbs: 24,
    fats: 18,
    source: 'User Submitted',
    status: 'pending',
    category: 'Breakfast',
  },
  {
    id: 'food4',
    name: 'Quinoa Greek Salad',
    description: 'Salad • 200g',
    calories: 185,
    protein: 6,
    carbs: 18,
    fats: 10,
    source: 'User Submitted',
    status: 'pending',
    category: 'Salad',
  },
  {
    id: 'food5',
    name: 'Chicken Caesar Wrap',
    description: 'Sandwich • Large',
    calories: 550,
    protein: 35,
    carbs: 40,
    fats: 30,
    source: 'AI Analysis (95%)',
    status: 'approved',
    category: 'Lunch',
  },
  {
    id: 'food6',
    name: 'Spinach & Feta Omelette',
    description: 'Breakfast • 2 eggs',
    calories: 210,
    protein: 15,
    carbs: 5,
    fats: 14,
    source: 'User Submitted',
    status: 'approved',
    category: 'Breakfast',
  },
  {
    id: 'food7',
    name: 'Lentil Soup',
    description: 'Soup • 1 cup',
    calories: 160,
    protein: 10,
    carbs: 25,
    fats: 3,
    source: 'AI Analysis (92%)',
    status: 'approved',
    category: 'Soup',
  },
  {
    id: 'food8',
    name: 'Beef Stir-fry',
    description: 'Dinner • Mixed Veg',
    calories: 410,
    protein: 30,
    carbs: 25,
    fats: 22,
    source: 'User Submitted',
    status: 'rejected',
    category: 'Dinner',
  },
];

export const FOOD_CATEGORIES = [
  'All Categories',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Seafood',
  'Vegan',
  'Salad',
  'Soup',
  'Dessert',
];

export const FOOD_SOURCES = [
  'All Sources',
  'User Submitted',
  'AI Analysis',
];