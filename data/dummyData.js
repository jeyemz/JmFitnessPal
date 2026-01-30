// data/dummyData.js

// Helper function to get relative date string (e.g., Today, Yesterday, 2 days ago, Last week)
export const getRelativeDateString = (date, today) => {
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays <= 14) {
    return 'Last week';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};


export const DUMMY_USER = {
  name: 'Alex Johnson',
  membership: 'Pro Member',
  avatar: 'https://cdn.icon-icons.com/icons2/2643/PNG/512/man_boy_person_avatar_user_icon_159389.png', // Generic avatar URL
  email: 'alex.johnson@example.com',
  heightCm: 182,
  weightKg: 78.5,
  dietaryPreference: 'Vegan',
};

export const DIETARY_PREFERENCES = [
  'None',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Paleo',
  'Gluten-Free',
  'Dairy-Free',
];


export const DUMMY_DAILY_SUMMARY = {
  intake: 750,
  goal: 2000,
  kcalLeft: 1250,
  protein: { current: 120, goal: 150 },
  carbs: { current: 210, goal: 250 },
  fat: { current: 45, goal: 65 },
};

export const DUMMY_MEALS = [
  {
    id: 'meal1',
    name: 'Greek Yogurt & Blueberries',
    time: '08:30 AM',
    imageUrl: 'https://images.unsplash.com/photo-1594950796078-d45095690b29?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 320,
    protein: 24,
    carbs: 12,
    fat: 8,
    isVerified: true,
    entryType: 'AI Verified',
  },
  {
    id: 'meal2',
    name: 'Grilled Chicken Salad',
    time: '12:45 PM',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a573bce6de78?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 430,
    protein: 42,
    carbs: 15,
    fat: 22,
    isVerified: true,
    entryType: 'AI Verified',
  },
];

// Reference date for "Today" in the image context
const TODAY_FOR_HISTORY = new Date(2023, 9, 23); // October 23, 2023

const detailedMealsOct23 = [
  {
    id: 'det-b1',
    name: 'Greek Yogurt & Berry',
    time: '08:00 AM',
    imageUrl: 'https://images.unsplash.com/photo-1594950796078-d45095690b29?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 320,
    protein: 24, carbs: 12, fat: 8, isVerified: true
  },
  {
    id: 'det-l1',
    name: 'Grilled Chicken Salad',
    time: '12:30 PM',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a573bce6de78?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 430,
    protein: 42, carbs: 15, fat: 22, isVerified: true
  },
  {
    id: 'det-s1',
    name: 'Protein Bar',
    time: '03:00 PM',
    imageUrl: 'https://images.unsplash.com/photo-1588092289758-00ad0766f7f0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 190,
    protein: 20, carbs: 15, fat: 5, isVerified: false
  },
  {
    id: 'det-d1',
    name: 'Sirloin Steak & Veg',
    time: '07:00 PM',
    // Fix: Corrected image URL
    imageUrl: 'https://images.unsplash.com/photo-1546964205-1a8927871b69?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 680,
    protein: 55, carbs: 8, fat: 45, isVerified: true
  },
];


export const DUMMY_DAILY_HISTORY_ENTRIES = [
  {
    id: 'h1',
    date: new Date(2023, 9, 23), // Monday, Oct 23
    caloriesConsumed: 1820,
    calorieGoal: 2200,
    goalStatus: 'met',
    mealsSummary: {
      breakfast: 'Greek Yogurt & Berry',
      lunch: 'Grilled Chicken Salad',
      snack: 'Protein Bar',
      dinner: 'Sirloin Steak & Veg',
    },
    detailedMeals: detailedMealsOct23,
  },
  {
    id: 'h2',
    date: new Date(2023, 9, 22), // Sunday, Oct 22
    caloriesConsumed: 2450,
    calorieGoal: 2200,
    goalStatus: 'over',
    mealsSummary: {
      breakfast: 'Pancakes & Syrup',
      lunch: 'Spicy Tuna Roll',
      dinner: 'Pizza (2 slices)',
    },
  },
  {
    id: 'h3',
    date: new Date(2023, 9, 21), // Saturday, Oct 21
    caloriesConsumed: 2110,
    calorieGoal: 2200,
    goalStatus: 'met',
    mealsSummary: {
      breakfast: 'Oatmeal',
      lunch: 'Chicken Wrap',
      dinner: 'Salmon & Quinoa',
      snack: 'Fruit Salad'
    },
  },
  {
    id: 'h4',
    date: new Date(2023, 9, 20), // Friday, Oct 20
    caloriesConsumed: 1945,
    calorieGoal: 2200,
    goalStatus: 'met',
    mealsSummary: {
      breakfast: 'Smoothie',
      lunch: 'Veggie Burger',
      dinner: 'Pasta Bolognese',
    },
  },
  {
    id: 'h5',
    date: new Date(2023, 9, 19), // Thursday, Oct 19
    caloriesConsumed: 2280,
    calorieGoal: 2200,
    goalStatus: 'over',
    mealsSummary: {
      breakfast: 'Scrambled Eggs',
      lunch: 'Chicken Sandwich',
      dinner: 'Tacos',
      snack: 'Chips'
    },
  },
  {
    id: 'h6',
    date: new Date(2023, 9, 18), // Wednesday, Oct 18
    caloriesConsumed: 1750,
    calorieGoal: 2200,
    goalStatus: 'met',
    mealsSummary: {
      breakfast: 'Cereal',
      lunch: 'Salad',
      dinner: 'Soup',
    },
  },
  {
    id: 'h7',
    date: new Date(2023, 9, 17), // Tuesday, Oct 17
    caloriesConsumed: 2300,
    calorieGoal: 2200,
    goalStatus: 'over',
    mealsSummary: {
      breakfast: 'Toast',
      lunch: 'Burger',
      dinner: 'Curry',
    },
  },
];


export const DUMMY_CALORIE_TRENDS = [
  { date: 'Oct 17', intake: 1800, goal: 2000 },
  { date: 'Oct 18', intake: 2100, goal: 2000 },
  { date: 'Oct 19', intake: 1950, goal: 2000 },
  { date: 'Oct 20', intake: 1700, goal: 2000 },
  { date: 'Oct 21', intake: 2050, goal: 2000 },
  { date: 'Oct 22', intake: 1900, goal: 2000 },
  { date: 'Oct 23', intake: 1820, goal: 2200 }, // Matching the image's "Today" history entry
];

// --- History Page (OLD) Dummy Data (now replaced by DUMMY_DAILY_HISTORY_ENTRIES for main view) ---
// Kept for backward compatibility for any component that might still reference these
export const DUMMY_SELECTED_DATE = TODAY_FOR_HISTORY; // October 23, 2023

export const DUMMY_DATES_WITH_DATA = [
  new Date(2023, 9, 5), // Oct 5
  TODAY_FOR_HISTORY, // Oct 23
];

export const DUMMY_HISTORY_DAILY_BREAKDOWN = {
  date: TODAY_FOR_HISTORY,
  totalCalories: 1820,
  carbs: { current: 210, goal: 250 }, // Goal is for progress bar calculation
  fats: { current: 58, goal: 65 },    // Goal is for progress bar calculation
};

export const DUMMY_HISTORY_MEALS = [
  {
    id: 'h-meal1',
    name: 'Greek Yogurt & Blueberries',
    time: '08:30 AM',
    imageUrl: 'https://images.unsplash.com/photo-1594950796078-d45095690b29?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 320,
    protein: 24,
    carbs: 12,
    fat: 8,
    isVerified: true,
    entryType: 'AI Verified',
  },
  {
    id: 'h-meal2',
    name: 'Grilled Chicken Salad',
    time: '12:45 PM',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a573bce6de78?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 430,
    protein: 42,
    carbs: 15,
    fat: 22,
    isVerified: true,
    entryType: 'AI Verified',
  },
  {
    id: 'h-meal3',
    name: 'Sirloin Steak & Asparagus',
    time: '07:20 PM',
    imageUrl: 'https://images.unsplash.com/photo-1546964205-1a8927871b69?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 680,
    protein: 55,
    carbs: 8,
    fat: 45,
    isVerified: true,
    entryType: 'AI Verified',
  },
  {
    id: 'h-meal4',
    name: 'Protein Bar (Whey Isolate)',
    time: '03:15 PM',
    imageUrl: 'https://images.unsplash.com/photo-1588092289758-00ad0766f7f0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    calories: 190,
    protein: 20,
    carbs: 15,
    fat: 5,
    isVerified: false,
    entryType: 'Manual Entry',
  },
];

export const DUMMY_MONTHLY_OVERVIEW = {
  averageProtein: { value: 142, target: 150, unit: 'g' },
  waterIntake: { value: 2.8, target: 3, unit: 'L' },
  streak: { value: 12, unit: 'Days' },
};