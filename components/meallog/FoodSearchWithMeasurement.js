import React, { useState, useEffect, useCallback } from 'react';
import { foodAPI, nutritionAPI, foodLogAPI } from '../../services/api.js';

const FoodSearchWithMeasurement = ({ onFoodAdded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('g');
  const [calculatedNutrition, setCalculatedNutrition] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchSource, setSearchSource] = useState('api'); // 'api' or 'local'

  const mealTypes = [
    { id: 1, name: 'Breakfast' },
    { id: 2, name: 'Lunch' },
    { id: 3, name: 'Dinner' },
    { id: 4, name: 'Snacks' }
  ];

  const unitOptions = [
    { value: 'g', label: 'grams (g)' },
    { value: 'oz', label: 'ounces (oz)' },
    { value: 'lb', label: 'pounds (lb)' },
    { value: 'cup', label: 'cups' },
    { value: 'tbsp', label: 'tablespoons' },
    { value: 'tsp', label: 'teaspoons' }
  ];

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchSource]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setMessage({ type: '', text: '' });
    
    try {
      let response;
      
      if (searchSource === 'api') {
        // Search using API Ninjas
        response = await nutritionAPI.search(searchQuery);
      } else {
        // Search local database
        response = await foodAPI.search(searchQuery);
      }
      
      setSearchResults(response.foods || []);
      
      if (response.foods?.length === 0 && response.message) {
        setMessage({ type: 'info', text: response.message });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Unable to fetch data at this time. Please try again.' 
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setCustomAmount(food.servingSize?.toString() || '100');
    setSelectedUnit('g');
    
    // Set initial calculated nutrition
    const calories = food.calories || food.caloriesPerServing || 0;
    setCalculatedNutrition({
      calories: calories,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      fiber: food.fiber || 0,
      sugar: food.sugar || 0,
      sodium: food.sodium || 0
    });
  };

  const handleAmountChange = async (amount, unit = selectedUnit) => {
    setCustomAmount(amount);
    
    if (!selectedFood || !amount || isNaN(parseFloat(amount))) {
      setCalculatedNutrition(null);
      return;
    }

    try {
      // Use API Ninjas calculation endpoint
      const response = await nutritionAPI.calculate(selectedFood, parseFloat(amount), unit);
      
      if (response.calculation) {
        setCalculatedNutrition({
          calories: response.calculation.calories,
          protein: response.calculation.protein,
          carbs: response.calculation.carbs,
          fat: response.calculation.fat,
          fiber: response.calculation.fiber || 0,
          sugar: response.calculation.sugar || 0,
          sodium: response.calculation.sodium || 0
        });
      }
    } catch (error) {
      // Calculate locally as fallback
      const baseServing = selectedFood.servingSize || 100;
      const calories = selectedFood.calories || selectedFood.caloriesPerServing || 0;
      
      // Simple conversion for grams (approximate for other units)
      const unitMultipliers = {
        'g': 1, 'oz': 28.35, 'lb': 453.59, 'cup': 240, 'tbsp': 15, 'tsp': 5
      };
      const amountInGrams = parseFloat(amount) * (unitMultipliers[unit] || 1);
      const multiplier = amountInGrams / baseServing;
      
      setCalculatedNutrition({
        calories: Math.round(calories * multiplier * 10) / 10,
        protein: Math.round((selectedFood.protein || 0) * multiplier * 10) / 10,
        carbs: Math.round((selectedFood.carbs || 0) * multiplier * 10) / 10,
        fat: Math.round((selectedFood.fat || 0) * multiplier * 10) / 10,
        fiber: Math.round((selectedFood.fiber || 0) * multiplier * 10) / 10,
        sugar: Math.round((selectedFood.sugar || 0) * multiplier * 10) / 10,
        sodium: Math.round((selectedFood.sodium || 0) * multiplier * 10) / 10
      });
    }
  };

  const handleUnitChange = (unit) => {
    setSelectedUnit(unit);
    if (customAmount) {
      handleAmountChange(customAmount, unit);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!selectedFood) return;
    
    setIsSaving(true);
    try {
      await nutritionAPI.saveToDatabase(selectedFood);
      setMessage({ type: 'success', text: `${selectedFood.name} saved to your food database!` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save food. It may already exist.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToLog = async () => {
    if (!selectedFood || !customAmount) return;

    setIsAdding(true);
    setMessage({ type: '', text: '' });

    console.log('=== handleAddToLog START ===');
    console.log('selectedFood:', selectedFood);
    console.log('customAmount:', customAmount);
    console.log('calculatedNutrition:', calculatedNutrition);
    console.log('selectedMealType:', selectedMealType);

    try {
      const baseServing = selectedFood.servingSize || 100;
      const servings = parseFloat(customAmount) / baseServing;
      
      console.log('baseServing:', baseServing, 'servings:', servings);
      
      // Check if this is an API Ninjas food (id starts with "api_" or source is api_ninjas)
      const isApiFood = selectedFood.source === 'api_ninjas' || 
                        (selectedFood.id && String(selectedFood.id).startsWith('api_'));
      
      console.log('isApiFood:', isApiFood);
      
      if (isApiFood) {
        // For API foods, always send nutrition data (use calculatedNutrition or selectedFood values)
        const nutrition = calculatedNutrition || {
          calories: selectedFood.calories || selectedFood.caloriesPerServing || 0,
          protein: selectedFood.protein || 0,
          carbs: selectedFood.carbs || 0,
          fat: selectedFood.fat || 0
        };
        
        await foodLogAPI.logFoodWithNutrition({
          mealTypeId: selectedMealType,
          servings: servings,
          nutritionData: {
            name: selectedFood.name,
            calories: nutrition.calories,
            protein: nutrition.protein,
            carbs: nutrition.carbs,
            fat: nutrition.fat,
            servingSize: baseServing,
            caloriesPerServing: selectedFood.calories || selectedFood.caloriesPerServing || 0,
            proteinBase: selectedFood.protein || 0,
            carbsBase: selectedFood.carbs || 0,
            fatBase: selectedFood.fat || 0
          }
        });
      } else if (selectedFood.id && !String(selectedFood.id).startsWith('api_')) {
        // Traditional logging with valid numeric food ID
        await foodLogAPI.logFood(selectedFood.id, selectedMealType, servings);
      } else {
        // Fallback: treat as custom food with nutrition data
        const nutrition = calculatedNutrition || {
          calories: selectedFood.calories || selectedFood.caloriesPerServing || 0,
          protein: selectedFood.protein || 0,
          carbs: selectedFood.carbs || 0,
          fat: selectedFood.fat || 0
        };
        
        await foodLogAPI.logFoodWithNutrition({
          mealTypeId: selectedMealType,
          servings: servings,
          nutritionData: {
            name: selectedFood.name,
            calories: nutrition.calories,
            protein: nutrition.protein,
            carbs: nutrition.carbs,
            fat: nutrition.fat,
            servingSize: baseServing,
            caloriesPerServing: selectedFood.calories || selectedFood.caloriesPerServing || 0,
            proteinBase: selectedFood.protein || 0,
            carbsBase: selectedFood.carbs || 0,
            fatBase: selectedFood.fat || 0
          }
        });
      }
      
      setMessage({ type: 'success', text: `${selectedFood.name} added to ${mealTypes.find(m => m.id === selectedMealType)?.name}!` });
      
      // Reset form
      setSelectedFood(null);
      setCustomAmount('');
      setCalculatedNutrition(null);
      setSearchQuery('');
      setSearchResults([]);
      
      // Notify parent
      if (onFoodAdded) {
        onFoodAdded();
      }
    } catch (error) {
      console.error('Add to log error:', error);
      console.error('Error details:', error.message);
      // Show the actual error message for debugging
      setMessage({ type: 'error', text: `Failed to add food: ${error.message || 'Unknown error'}` });
    } finally {
      setIsAdding(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFood(null);
    setCustomAmount('');
    setCalculatedNutrition(null);
  };

  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
      React.createElement("div", { className: "flex justify-between items-center mb-4" },
        React.createElement("h2", { className: "text-xl font-bold text-gray-900" }, "Search Food Database"),
        /* Search Source Toggle */
        React.createElement("div", { className: "flex items-center space-x-1 bg-gray-100 rounded-lg p-1" },
          React.createElement("button", {
            type: "button",
            onClick: () => setSearchSource('api'),
            className: `px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              searchSource === 'api' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`
          }, "API Ninjas"),
          React.createElement("button", {
            type: "button",
            onClick: () => setSearchSource('local'),
            className: `px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              searchSource === 'local' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`
          }, "Local DB")
        )
      ),
      
      /* Search Input */
      React.createElement("div", { className: "relative mb-4" },
        React.createElement("input", {
          type: "text",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          placeholder: searchSource === 'api' 
            ? "Search any food (e.g., '100g chicken breast', '1 apple')..." 
            : "Search local database...",
          className: "w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm",
          "aria-label": "Search food database"
        }),
        React.createElement("svg", { 
          xmlns: "http://www.w3.org/2000/svg", 
          fill: "none", 
          viewBox: "0 0 24 24", 
          strokeWidth: 1.5, 
          stroke: "currentColor", 
          className: "w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" 
        },
          React.createElement("path", { 
            strokeLinecap: "round", 
            strokeLinejoin: "round", 
            d: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" 
          })
        ),
        isSearching && React.createElement("div", { 
          className: "absolute right-3 top-1/2 transform -translate-y-1/2" 
        },
          React.createElement("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" })
        )
      ),

      /* Search Source Info */
      searchSource === 'api' && React.createElement("p", { 
        className: "text-xs text-gray-500 mb-3 flex items-center" 
      },
        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4 mr-1" },
          React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" })
        ),
        "Powered by API Ninjas - Search millions of foods worldwide"
      ),

      /* Message */
      message.text && React.createElement("div", { 
        className: `mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
          'bg-red-50 text-red-700 border border-red-200'
        }` 
      }, message.text),

      /* Search Results */
      !selectedFood && searchResults.length > 0 && (
        React.createElement("div", { className: "max-h-64 overflow-y-auto border border-gray-200 rounded-lg mb-4" },
          searchResults.map((food, index) => (
            React.createElement("button", {
              key: food.id || `food-${index}`,
              onClick: () => handleSelectFood(food),
              className: "w-full p-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
            },
              React.createElement("div", { className: "flex justify-between items-start" },
                React.createElement("div", null,
                  React.createElement("div", { className: "flex items-center space-x-2" },
                    React.createElement("p", { className: "font-medium text-gray-900" }, food.name),
                    food.source === 'api_ninjas' && React.createElement("span", { 
                      className: "px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded" 
                    }, "API")
                  ),
                  food.brand && React.createElement("p", { className: "text-xs text-gray-500" }, food.brand),
                  React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, 
                    `${food.servingSize || 100}${food.servingUnit || 'g'} serving`
                  )
                ),
                React.createElement("div", { className: "text-right" },
                  React.createElement("p", { className: "font-semibold text-blue-600" }, 
                    `${food.calories || food.caloriesPerServing || 0} kcal`
                  ),
                  React.createElement("p", { className: "text-xs text-gray-500" }, 
                    `P: ${food.protein || 0}g | C: ${food.carbs || 0}g | F: ${food.fat || 0}g`
                  )
                )
              )
            )
          ))
        )
      ),

      /* No results message */
      !selectedFood && searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
        React.createElement("p", { className: "text-sm text-gray-500 text-center py-4" }, 
          "No foods found. Try a different search term."
        )
      ),

      /* Selected Food with Custom Measurement */
      selectedFood && (
        React.createElement("div", { className: "border border-blue-200 rounded-lg p-4 bg-blue-50" },
          /* Selected food header */
          React.createElement("div", { className: "flex justify-between items-start mb-4" },
            React.createElement("div", null,
              React.createElement("div", { className: "flex items-center space-x-2" },
                React.createElement("p", { className: "font-bold text-gray-900 text-lg" }, selectedFood.name),
                selectedFood.source === 'api_ninjas' && React.createElement("span", { 
                  className: "px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full" 
                }, "API Ninjas")
              ),
              selectedFood.brand && React.createElement("p", { className: "text-sm text-gray-600" }, selectedFood.brand)
            ),
            React.createElement("button", {
              onClick: handleClearSelection,
              className: "text-gray-400 hover:text-gray-600"
            },
              React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
                React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" })
              )
            )
          ),

          /* Custom Amount Input with Unit Selector */
          React.createElement("div", { className: "mb-4" },
            React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, 
              "Enter Custom Measurement"
            ),
            React.createElement("div", { className: "flex items-center space-x-2" },
              React.createElement("input", {
                type: "number",
                value: customAmount,
                onChange: (e) => handleAmountChange(e.target.value, selectedUnit),
                placeholder: "Enter amount",
                min: "0",
                step: "0.1",
                className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              }),
              React.createElement("select", {
                value: selectedUnit,
                onChange: (e) => handleUnitChange(e.target.value),
                className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              },
                unitOptions.map(unit => (
                  React.createElement("option", { key: unit.value, value: unit.value }, unit.label)
                ))
              )
            ),
            React.createElement("p", { className: "text-xs text-gray-500 mt-1" },
              `Base serving: ${selectedFood.servingSize || 100}${selectedFood.servingUnit || 'g'} = ${selectedFood.calories || selectedFood.caloriesPerServing || 0} kcal`
            )
          ),

          /* Save to Database Button (for API foods) */
          selectedFood.source === 'api_ninjas' && (
            React.createElement("button", {
              type: "button",
              onClick: handleSaveToDatabase,
              disabled: isSaving,
              className: "mb-4 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            },
              isSaving ? "Saving..." : "Save to My Food Database"
            )
          ),

          /* Calculated Nutrition Display */
          calculatedNutrition && (
            React.createElement("div", { className: "bg-white rounded-lg p-4 mb-4" },
              React.createElement("p", { className: "text-sm font-medium text-gray-700 mb-3" }, "Calculated Nutrition:"),
              React.createElement("div", { className: "grid grid-cols-4 gap-3 text-center" },
                React.createElement("div", { className: "bg-blue-100 rounded-lg p-2" },
                  React.createElement("p", { className: "text-lg font-bold text-blue-700" }, 
                    Math.round(calculatedNutrition.calories)
                  ),
                  React.createElement("p", { className: "text-xs text-gray-600" }, "Calories")
                ),
                React.createElement("div", { className: "bg-orange-100 rounded-lg p-2" },
                  React.createElement("p", { className: "text-lg font-bold text-orange-700" }, 
                    `${calculatedNutrition.protein}g`
                  ),
                  React.createElement("p", { className: "text-xs text-gray-600" }, "Protein")
                ),
                React.createElement("div", { className: "bg-green-100 rounded-lg p-2" },
                  React.createElement("p", { className: "text-lg font-bold text-green-700" }, 
                    `${calculatedNutrition.carbs}g`
                  ),
                  React.createElement("p", { className: "text-xs text-gray-600" }, "Carbs")
                ),
                React.createElement("div", { className: "bg-purple-100 rounded-lg p-2" },
                  React.createElement("p", { className: "text-lg font-bold text-purple-700" }, 
                    `${calculatedNutrition.fat}g`
                  ),
                  React.createElement("p", { className: "text-xs text-gray-600" }, "Fat")
                )
              )
            )
          ),

          /* Meal Type Selection */
          React.createElement("div", { className: "mb-4" },
            React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, 
              "Add to Meal"
            ),
            React.createElement("div", { className: "grid grid-cols-4 gap-2" },
              mealTypes.map((meal) => (
                React.createElement("button", {
                  key: meal.id,
                  onClick: () => setSelectedMealType(meal.id),
                  className: `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMealType === meal.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`
                }, meal.name)
              ))
            )
          ),

          /* Add Button */
          React.createElement("button", {
            onClick: handleAddToLog,
            disabled: !customAmount || isAdding,
            className: "w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          },
            isAdding ? (
              React.createElement(React.Fragment, null,
                React.createElement("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" }),
                "Adding..."
              )
            ) : (
              React.createElement(React.Fragment, null,
                React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5 mr-2" },
                  React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" })
                ),
                "Add to Food Log"
              )
            )
          )
        )
      ),

      /* Instructions when no search */
      !searchQuery && searchResults.length === 0 && !selectedFood && (
        React.createElement("div", { className: "text-center py-6" },
          React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-12 h-12 text-gray-300 mx-auto mb-3" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" })
          ),
          React.createElement("p", { className: "text-gray-500 text-sm" }, "Search for foods to log your meals"),
          React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Enter at least 2 characters to search")
        )
      )
    )
  );
};

export default FoodSearchWithMeasurement;
