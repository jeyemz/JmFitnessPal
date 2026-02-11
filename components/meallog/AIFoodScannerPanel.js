import React, { useState, useRef, useEffect } from 'react';
import Button from '../Button.js';
import { foodScanAPI, foodLogAPI, foodAPI, nutritionAPI } from '../../services/api.js';

const AIFoodScannerPanel = ({ onFoodAdded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [lookedUpFood, setLookedUpFood] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customUnit, setCustomUnit] = useState('g');
  const [calculatedNutrition, setCalculatedNutrition] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [debugAPI, setDebugAPI] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const fileInputRef = useRef(null);

  const unitOptions = [
    { value: 'g', label: 'grams (g)' },
    { value: 'oz', label: 'ounces (oz)' },
    { value: 'cup', label: 'cups' },
    { value: 'serving', label: 'serving(s)' }
  ];

  const mealTypes = [
    { id: 1, name: 'Breakfast' },
    { id: 2, name: 'Lunch' },
    { id: 3, name: 'Dinner' },
    { id: 4, name: 'Snack' }
  ];

  // Auto lookup: Local DB first, then USDA
  useEffect(() => {
    if (!selectedFood || !selectedFood.name || selectedFood.name.length < 2) {
      setLookedUpFood(null);
      setCustomAmount('');
      setCalculatedNutrition(null);
      return;
    }
    const query = selectedFood.name.trim();
    setLookedUpFood(null);
    setCalculatedNutrition(null);
    setCustomAmount('');
    setIsLookingUp(true);
    const runLookup = async () => {
      try {
        const localRes = await foodAPI.search(query, 5);
        const localFoods = localRes?.foods || [];
        if (localFoods.length > 0) {
          const f = localFoods[0];
          const food = {
            id: f.id,
            name: f.name || f.foodName,
            servingSize: f.servingSize ?? 100,
            servingUnit: f.servingUnit || 'g',
            calories: f.caloriesPerServing ?? f.calories ?? 0,
            protein: f.protein ?? 0,
            carbs: f.carbs ?? 0,
            fat: f.fat ?? 0,
            source: 'local'
          };
          setLookedUpFood(food);
          setCustomAmount(String(food.servingSize));
          setCalculatedNutrition({
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat
          });
          setIsLookingUp(false);
          return;
        }
        const usdaRes = await nutritionAPI.search(query);
        const usdaFoods = usdaRes?.foods || [];
        if (usdaFoods.length > 0) {
          const f = usdaFoods[0];
          const food = {
            id: f.id,
            name: f.name,
            servingSize: f.servingSize ?? 100,
            servingUnit: f.servingUnit || 'g',
            calories: f.calories ?? 0,
            protein: f.protein ?? 0,
            carbs: f.carbs ?? 0,
            fat: f.fat ?? 0,
            source: 'usda_fdc'
          };
          setLookedUpFood(food);
          setCustomAmount(String(food.servingSize));
          setCalculatedNutrition({
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat
          });
        }
      } catch (err) {
        console.warn('Lookup failed:', err);
      }
      setIsLookingUp(false);
    };
    runLookup();
  }, [selectedFood?.id, selectedFood?.name]);

  const handleAmountChange = async (amount, unit = customUnit) => {
    setCustomAmount(amount);
    if (!lookedUpFood || !amount || isNaN(parseFloat(amount))) {
      if (lookedUpFood) {
        setCalculatedNutrition({
          calories: lookedUpFood.calories,
          protein: lookedUpFood.protein,
          carbs: lookedUpFood.carbs,
          fat: lookedUpFood.fat
        });
      }
      return;
    }
    const num = parseFloat(amount);
    const base = lookedUpFood.servingSize || 100;
    const isUsda = lookedUpFood.source === 'usda_fdc' || String(lookedUpFood.id || '').startsWith('usda_');
    const unitMult = { g: 1, oz: 28.35, cup: 240, serving: base };
    const grams = num * (unitMult[unit] || 1);
    const mult = grams / base;
    const fallbackCalc = () => ({
      calories: Math.round((lookedUpFood.calories || 0) * mult * 10) / 10,
      protein: Math.round((lookedUpFood.protein || 0) * mult * 10) / 10,
      carbs: Math.round((lookedUpFood.carbs || 0) * mult * 10) / 10,
      fat: Math.round((lookedUpFood.fat || 0) * mult * 10) / 10
    });
    try {
      if (isUsda) {
        const apiUnit = unit === 'serving' ? 'g' : unit;
        const apiAmount = unit === 'serving' ? grams : num;
        const res = await nutritionAPI.calculate(lookedUpFood, apiAmount, apiUnit);
        if (res?.calculation) {
          setCalculatedNutrition({
            calories: res.calculation.calories,
            protein: res.calculation.protein,
            carbs: res.calculation.carbs,
            fat: res.calculation.fat
          });
        } else {
          setCalculatedNutrition(fallbackCalc());
        }
      } else {
        setCalculatedNutrition(fallbackCalc());
      }
    } catch (err) {
      setCalculatedNutrition(fallbackCalc());
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError(null);
    setScanResult(null);
    setSelectedFood(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target.result;
      setPreviewImage(base64Image);
      
      // Analyze the image
      await analyzeImage(base64Image);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageData) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await foodScanAPI.analyzeImage(imageData, { debug: debugAPI });
      
      if (result.success) {
        setScanResult(result);
        if (result.foods && result.foods.length > 0) {
          setSelectedFood(result.foods[0]);
        }
      } else {
        setError(result.error || 'Failed to analyze image');
      }
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogFood = async () => {
    if (!selectedFood) return;

    const useLookup = lookedUpFood && (calculatedNutrition || customAmount);
    const name = useLookup ? lookedUpFood.name : selectedFood.name;
    const cal = useLookup ? (calculatedNutrition?.calories ?? lookedUpFood.calories) : selectedFood.calories;
    const prot = useLookup ? (calculatedNutrition?.protein ?? lookedUpFood.protein) : selectedFood.protein;
    const carb = useLookup ? (calculatedNutrition?.carbs ?? lookedUpFood.carbs) : selectedFood.carbs;
    const fatVal = useLookup ? (calculatedNutrition?.fat ?? lookedUpFood.fat) : selectedFood.fat;
    const serving = lookedUpFood?.servingSize ?? selectedFood.servingSize ?? 100;
    const amount = customAmount && !isNaN(parseFloat(customAmount)) ? parseFloat(customAmount) : serving;

    setIsLogging(true);
    try {
      await foodLogAPI.logFoodWithNutrition({
        mealTypeId: selectedMealType,
        servings: 1,
        source: useLookup ? (lookedUpFood.source === 'usda_fdc' ? 'usda_fdc' : 'local') : 'ai_scanned',
        nutritionData: {
          name,
          calories: cal,
          protein: prot,
          carbs: carb,
          fat: fatVal,
          servingSize: amount,
          caloriesPerServing: cal,
          proteinBase: prot,
          carbsBase: carb,
          fatBase: fatVal
        }
      });

      // Reset and notify parent
      setScanResult(null);
      setSelectedFood(null);
      setLookedUpFood(null);
      setCustomAmount('');
      setCalculatedNutrition(null);
      setPreviewImage(null);
      if (onFoodAdded) onFoodAdded();
      
    } catch (err) {
      console.error('Log food error:', err);
      setError('Failed to log food. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setSelectedFood(null);
    setLookedUpFood(null);
    setCustomAmount('');
    setCalculatedNutrition(null);
    setIsLookingUp(false);
    setPreviewImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show results view
  if (scanResult && scanResult.foods && scanResult.foods.length > 0) {
    return (
      React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
        /* Header */
        React.createElement("div", { className: "flex items-center justify-between mb-4" },
          React.createElement("h3", { className: "text-lg font-bold text-gray-900" }, "Scan Results"),
          React.createElement("button", {
            onClick: handleReset,
            className: "text-sm text-blue-600 hover:text-blue-700"
          }, "Scan New")
        ),

        /* Demo Mode Warning */
        scanResult.demo_mode && (
          React.createElement("div", { className: "mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg" },
            React.createElement("p", { className: "text-sm text-yellow-700" },
              React.createElement("strong", null, "Demo Mode: "),
              "Vision API requires a paid Edamam subscription. Showing sample data."
            )
          )
        ),

        /* Preview Image */
        previewImage && (
          React.createElement("div", { className: "mb-4" },
            React.createElement("img", {
              src: previewImage,
              alt: "Scanned food",
              className: "w-full h-40 object-cover rounded-lg"
            })
          )
        ),

        /* Food List */
        React.createElement("div", { className: "space-y-2 mb-4" },
          scanResult.foods.map((food, index) => (
            React.createElement("button", {
              key: food.id || index,
              onClick: () => setSelectedFood(food),
              className: `w-full p-3 rounded-lg border text-left transition-colors ${
                selectedFood?.id === food.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`
            },
              React.createElement("p", { className: "font-medium text-gray-900" }, food.name),
              React.createElement("p", { className: "text-sm text-gray-500" },
                `${food.calories} cal • P: ${food.protein}g • C: ${food.carbs}g • F: ${food.fat}g`
              )
            )
          ))
        ),

        /* Selected Food Details */
        selectedFood && (
          React.createElement("div", { className: "border-t border-gray-100 pt-4" },
            /* Meal Type Selector */
            React.createElement("div", { className: "mb-4" },
              React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Add to:"),
              React.createElement("div", { className: "grid grid-cols-4 gap-2" },
                mealTypes.map((meal) => (
                  React.createElement("button", {
                    key: meal.id,
                    onClick: () => setSelectedMealType(meal.id),
                    className: `py-2 px-3 text-sm rounded-lg border transition-colors ${
                      selectedMealType === meal.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`
                  }, meal.name)
                ))
              )
            ),

            /* Auto lookup status / Serving customization */
            isLookingUp && (
              React.createElement("div", { className: "mb-4 p-3 bg-gray-50 rounded-lg" },
                React.createElement("p", { className: "text-sm text-gray-600" }, "Looking up in database...")
              )
            ),
            lookedUpFood && !isLookingUp && (
              React.createElement("div", { className: "mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg" },
                React.createElement("p", { className: "text-sm font-medium text-blue-800 mb-2" },
                  "Matched: ", lookedUpFood.name, " (", lookedUpFood.source === 'usda_fdc' ? 'USDA' : 'Local DB', ")"
                ),
                React.createElement("div", { className: "flex gap-3 items-end flex-wrap" },
                  React.createElement("div", { className: "flex-1 min-w-[100px]" },
                    React.createElement("label", { className: "block text-xs font-medium text-gray-600 mb-1" }, "Amount"),
                    React.createElement("input", {
                      type: "number",
                      min: "0",
                      step: "0.1",
                      value: customAmount,
                      onChange: (e) => handleAmountChange(e.target.value, customUnit),
                      className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    })
                  ),
                  React.createElement("div", { className: "min-w-[120px]" },
                    React.createElement("label", { className: "block text-xs font-medium text-gray-600 mb-1" }, "Unit"),
                    React.createElement("select", {
                      value: customUnit,
                      onChange: (e) => {
                        const u = e.target.value;
                        setCustomUnit(u);
                        handleAmountChange(customAmount, u);
                      },
                      className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    }, unitOptions.map((o) => React.createElement("option", { key: o.value, value: o.value }, o.label)))
                  )
                ),
                calculatedNutrition && (
                  React.createElement("p", { className: "text-sm text-gray-600 mt-2" },
                    calculatedNutrition.calories, " cal • P: ", calculatedNutrition.protein, "g • C: ", calculatedNutrition.carbs, "g • F: ", calculatedNutrition.fat, "g"
                  )
                )
              )
            ),

            /* Log Button */
            React.createElement(Button, {
              variant: "primary",
              onClick: handleLogFood,
              disabled: isLogging,
              className: "w-full"
            },
              isLogging ? "Logging..." : `Add ${selectedFood.name} to ${mealTypes.find(m => m.id === selectedMealType)?.name}`
            ),

            /* Raw API response (when debug was requested) */
            scanResult.debug && (
              React.createElement("div", { className: "mt-4 border border-gray-200 rounded-lg overflow-hidden" },
                React.createElement("button", {
                  type: "button",
                  onClick: () => setShowDebug((v) => !v),
                  className: "w-full px-3 py-2 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
                }, showDebug ? "Hide raw API response" : "Show raw API response (verify LogMeal)"),
                showDebug && React.createElement("pre", {
                  className: "p-3 text-xs text-gray-600 bg-gray-50 overflow-auto max-h-64",
                  style: { whiteSpace: 'pre-wrap', wordBreak: 'break-all' }
                }, JSON.stringify(scanResult.debug, null, 2))
              )
            )
          )
        )
      )
    );
  }

  // Show scanner view
  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
      React.createElement("h3", { className: "text-lg font-bold text-gray-900 mb-4" }, "Scan your food"),
      
      /* Error Message */
      error && (
        React.createElement("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg" },
          React.createElement("p", { className: "text-sm text-red-700" }, error)
        )
      ),

      /* Drop Zone */
      React.createElement("div", {
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        className: `border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400'
        } ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`
      },
        isAnalyzing ? (
          React.createElement(React.Fragment, null,
            React.createElement("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" }),
            React.createElement("p", { className: "text-lg font-semibold text-gray-700" }, "Analyzing image..."),
            React.createElement("p", { className: "text-sm text-gray-500" }, "Identifying your food...")
          )
        ) : previewImage ? (
          React.createElement(React.Fragment, null,
            React.createElement("img", {
              src: previewImage,
              alt: "Preview",
              className: "w-32 h-32 object-cover rounded-lg mb-4"
            }),
            React.createElement("p", { className: "text-sm text-gray-500" }, "Processing...")
          )
        ) : (
          React.createElement(React.Fragment, null,
            React.createElement("svg", { 
              xmlns: "http://www.w3.org/2000/svg", 
              fill: "none", 
              viewBox: "0 0 24 24", 
              strokeWidth: 1.5, 
              stroke: "currentColor", 
              className: "w-12 h-12 text-blue-400 mb-4" 
            },
              React.createElement("path", { 
                strokeLinecap: "round", 
                strokeLinejoin: "round", 
                d: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" 
              }),
              React.createElement("path", { 
                strokeLinecap: "round", 
                strokeLinejoin: "round", 
                d: "M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" 
              })
            ),
            React.createElement("p", { className: "text-lg font-semibold text-gray-700 mb-2" }, "Drop food photo here"),
            React.createElement("p", { className: "text-sm text-gray-500 text-center" },
              "We'll identify your food and show nutrition"
            )
          )
        )
      ),

      /* Hidden File Input */
      React.createElement("input", {
        ref: fileInputRef,
        type: "file",
        accept: "image/*",
        onChange: handleFileSelect,
        className: "hidden"
      }),

      /* Select Button */
      React.createElement("div", { className: "mt-4 flex justify-center" },
        React.createElement(Button, {
          variant: "outline",
          onClick: () => fileInputRef.current?.click(),
          disabled: isAnalyzing,
          className: "text-sm"
        },
          React.createElement("svg", { 
            xmlns: "http://www.w3.org/2000/svg", 
            fill: "none", 
            viewBox: "0 0 24 24", 
            strokeWidth: 1.5, 
            stroke: "currentColor", 
            className: "w-5 h-5 mr-2" 
          },
            React.createElement("path", { 
              strokeLinecap: "round", 
              strokeLinejoin: "round", 
              d: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" 
            })
          ),
          "Select from Gallery"
        )
      ),

      /* Debug checkbox */
      React.createElement("label", { className: "mt-4 flex items-center gap-2 text-sm text-gray-600 cursor-pointer" },
        React.createElement("input", {
          type: "checkbox",
          checked: debugAPI,
          onChange: (e) => setDebugAPI(e.target.checked)
        }),
        "Include raw API response (to verify LogMeal is working)"
      ),

      /* Info Text */
      React.createElement("p", { className: "mt-4 text-xs text-gray-400 text-center" },
        "Supports JPG, PNG, WebP • Max 10MB"
      )
    )
  );
};

export default AIFoodScannerPanel;
