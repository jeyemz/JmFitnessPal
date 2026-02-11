import React, { useState, useEffect, useCallback } from 'react';
import { foodAPI, nutritionAPI, foodLogAPI } from '../../services/api.js';

const FoodSearchWithMeasurement = ({ onFoodAdded, onAIScanClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('g');
  const [calculatedNutrition, setCalculatedNutrition] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

  // Debounced search: local database first, then USDA
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setMessage({ type: '', text: '' });
    
    try {
      // 1. Search local database first
      const localResponse = await foodAPI.search(searchQuery);
      const localFoods = (localResponse.foods || []).map((f) => ({ ...f, source: 'local', sourceLabel: 'Local' }));
      
      // 2. Then search USDA FoodData Central
      let usdaFoods = [];
      try {
        const usdaResponse = await nutritionAPI.search(searchQuery);
        usdaFoods = (usdaResponse.foods || []).map((f) => ({ ...f, sourceLabel: 'USDA' }));
      } catch (usdaErr) {
        console.warn('USDA search failed:', usdaErr);
      }
      
      // Combine: local first, then USDA
      setSearchResults([...localFoods, ...usdaFoods]);
      
      if (localFoods.length === 0 && usdaFoods.length === 0) {
        setMessage({ type: 'info', text: 'No foods found. Try a different search term.' });
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
    console.log('[handleSelectFood] Selected food:', food);
    setSelectedFood(food);
    setCustomAmount(food.servingSize?.toString() || '100');
    setSelectedUnit('g');
    
    // Set initial calculated nutrition (use ?? for proper null/undefined handling)
    const calories = food.calories ?? food.caloriesPerServing ?? 0;
    setCalculatedNutrition({
      calories: calories,
      protein: food.protein ?? 0,
      carbs: food.carbs ?? 0,
      fat: food.fat ?? 0,
      fiber: food.fiber ?? 0,
      sugar: food.sugar ?? 0,
      sodium: food.sodium ?? 0
    });
  };

  const handleAmountChange = async (amount, unit = selectedUnit) => {
    setCustomAmount(amount);
    
    if (!selectedFood || !amount || isNaN(parseFloat(amount))) {
      setCalculatedNutrition(null);
      return;
    }

    try {
      // Use USDA FDC calculation endpoint
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
      console.log('[handleAmountChange] API call failed, using local calculation:', error);
      // Calculate locally as fallback (use ?? for proper null/undefined handling)
      const baseServing = selectedFood.servingSize ?? 100;
      const calories = selectedFood.calories ?? selectedFood.caloriesPerServing ?? 0;
      
      // Simple conversion for grams (approximate for other units)
      const unitMultipliers = {
        'g': 1, 'oz': 28.35, 'lb': 453.59, 'cup': 240, 'tbsp': 15, 'tsp': 5
      };
      const amountInGrams = parseFloat(amount) * (unitMultipliers[unit] || 1);
      const multiplier = amountInGrams / baseServing;
      
      console.log('[handleAmountChange] Local calc - baseServing:', baseServing, 'multiplier:', multiplier);
      console.log('[handleAmountChange] Food data - protein:', selectedFood.protein, 'carbs:', selectedFood.carbs, 'fat:', selectedFood.fat);
      
      setCalculatedNutrition({
        calories: Math.round(calories * multiplier * 10) / 10,
        protein: Math.round((selectedFood.protein ?? 0) * multiplier * 10) / 10,
        carbs: Math.round((selectedFood.carbs ?? 0) * multiplier * 10) / 10,
        fat: Math.round((selectedFood.fat ?? 0) * multiplier * 10) / 10,
        fiber: Math.round((selectedFood.fiber ?? 0) * multiplier * 10) / 10,
        sugar: Math.round((selectedFood.sugar ?? 0) * multiplier * 10) / 10,
        sodium: Math.round((selectedFood.sodium ?? 0) * multiplier * 10) / 10
      });
    }
  };

  const handleUnitChange = (unit) => {
    setSelectedUnit(unit);
    if (customAmount) {
      handleAmountChange(customAmount, unit);
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
      
      // Check if this is a USDA FDC food (id starts with "usda_" or source is usda_fdc)
      const isApiFood = selectedFood.source === 'usda_fdc' || 
                        (selectedFood.id && String(selectedFood.id).startsWith('usda_'));
      
      console.log('isApiFood:', isApiFood);
      
      if (isApiFood) {
        // For API/USDA foods, always send nutrition data and source 'api' so they save to local DB
        const nutrition = calculatedNutrition || {
          calories: selectedFood.calories || selectedFood.caloriesPerServing || 0,
          protein: selectedFood.protein || 0,
          carbs: selectedFood.carbs || 0,
          fat: selectedFood.fat || 0
        };
        
        await foodLogAPI.logFoodWithNutrition({
          mealTypeId: selectedMealType,
          servings: servings,
          source: 'api',
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
        React.createElement("h2", { className: "text-xl font-bold text-gray-900" }, "Find a food"),
        onAIScanClick && React.createElement("button", {
          type: "button",
          onClick: onAIScanClick,
          className: "flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        },
          React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-5 h-5" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" }),
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" })
          ),
          "Scan food"
        )
      ),
      
      /* Search Input */
      React.createElement("div", { className: "relative mb-4" },
        React.createElement("input", {
          type: "text",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          placeholder: "Search for a food (e.g. chicken, apple)...",
          className: "w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm",
          "aria-label": "Search for a food"
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

      /* Search hint */
      React.createElement("p", { 
        className: "text-xs text-gray-500 mb-3 flex items-center" 
      },
        "We search our database and nutrition info."
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
                    (food.sourceLabel || food.source === 'usda_fdc') && React.createElement("span", { 
                      className: `px-1.5 py-0.5 text-xs rounded ${food.source === 'local' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}` 
                    }, food.source === 'local' ? 'Our list' : 'Nutrition info')
                  ),
                  food.brand && React.createElement("p", { className: "text-xs text-gray-500" }, food.brand),
                  React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, 
                    `${food.servingSize || 100}${food.servingUnit || 'g'} serving`
                  )
                ),
                React.createElement("div", { className: "text-right" },
                  React.createElement("p", { className: "font-semibold text-blue-600" }, 
                    `${food.calories || food.caloriesPerServing || 0} cal`
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
                (selectedFood.sourceLabel || selectedFood.source === 'usda_fdc') && React.createElement("span", { 
                  className: `px-2 py-0.5 text-xs rounded-full ${selectedFood.source === 'local' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}` 
                }, selectedFood.source === 'local' ? 'Our list' : 'Nutrition info')
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
              "How much?"
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
              `Base serving: ${selectedFood.servingSize || 100}${selectedFood.servingUnit || 'g'} = ${selectedFood.calories || selectedFood.caloriesPerServing || 0} cal`
            )
          ),

          /* Calculated Nutrition Display */
          calculatedNutrition && (
            React.createElement("div", { className: "bg-white rounded-lg p-4 mb-4" },
              React.createElement("p", { className: "text-sm font-medium text-gray-700 mb-3" }, "Nutrition for this amount:"),
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
              "Which meal?"
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
                "Add to log"
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
          React.createElement("p", { className: "text-gray-500 text-sm" }, "Find and add foods to your day"),
          React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Type at least 2 characters")
        )
      )
    )
  );
};

export default FoodSearchWithMeasurement;
