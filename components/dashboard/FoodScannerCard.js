import React, { useState, useRef } from 'react';
import Button from '../Button.js';
import { foodScanAPI, foodLogAPI } from '../../services/api.js';

const FoodScannerCard = ({ onFoodAdded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const mealTypes = [
    { id: 1, name: 'Breakfast' },
    { id: 2, name: 'Lunch' },
    { id: 3, name: 'Dinner' },
    { id: 4, name: 'Snack' }
  ];

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
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError(null);
    setScanResult(null);
    setSelectedFood(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target.result;
      setPreviewImage(base64Image);
      await analyzeImage(base64Image);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageData) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await foodScanAPI.analyzeImage(imageData);
      
      if (result.success) {
        setScanResult(result);
        if (result.foods && result.foods.length > 0) {
          setSelectedFood(result.foods[0]);
        }
      } else {
        setError(result.error || 'Failed to analyze image');
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogFood = async () => {
    if (!selectedFood) return;

    setIsLogging(true);
    try {
      await foodLogAPI.logFoodWithNutrition({
        mealTypeId: selectedMealType,
        servings: 1,
        nutritionData: {
          name: selectedFood.name,
          calories: selectedFood.calories,
          protein: selectedFood.protein,
          carbs: selectedFood.carbs,
          fat: selectedFood.fat,
          servingSize: selectedFood.servingSize,
          caloriesPerServing: selectedFood.calories,
          proteinBase: selectedFood.protein,
          carbsBase: selectedFood.carbs,
          fatBase: selectedFood.fat
        }
      });

      setScanResult(null);
      setSelectedFood(null);
      setPreviewImage(null);
      if (onFoodAdded) onFoodAdded();
      
    } catch (err) {
      setError('Failed to log food');
    } finally {
      setIsLogging(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setSelectedFood(null);
    setPreviewImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Results view
  if (scanResult && scanResult.foods && scanResult.foods.length > 0) {
    return (
      React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full" },
        React.createElement("div", { className: "flex items-center justify-between mb-4" },
          React.createElement("h3", { className: "text-lg font-bold text-gray-900" }, "AI Food Scanner"),
          React.createElement("button", {
            onClick: handleReset,
            className: "text-sm text-blue-600 hover:text-blue-700"
          }, "Scan New")
        ),

        scanResult.demo_mode && (
          React.createElement("div", { className: "mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg" },
            React.createElement("p", { className: "text-xs text-yellow-700" }, "Demo Mode - Sample data shown")
          )
        ),

        previewImage && (
          React.createElement("img", {
            src: previewImage,
            alt: "Food",
            className: "w-full h-32 object-cover rounded-lg mb-3"
          })
        ),

        React.createElement("div", { className: "space-y-2 mb-3 max-h-40 overflow-y-auto" },
          scanResult.foods.map((food, index) => (
            React.createElement("button", {
              key: food.id || index,
              onClick: () => setSelectedFood(food),
              className: `w-full p-2 rounded-lg border text-left text-sm ${
                selectedFood?.id === food.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`
            },
              React.createElement("p", { className: "font-medium text-gray-900" }, food.name),
              React.createElement("p", { className: "text-xs text-gray-500" },
                `${food.calories} cal • P:${food.protein}g • C:${food.carbs}g • F:${food.fat}g`
              )
            )
          ))
        ),

        selectedFood && (
          React.createElement("div", { className: "border-t border-gray-100 pt-3" },
            React.createElement("select", {
              value: selectedMealType,
              onChange: (e) => setSelectedMealType(Number(e.target.value)),
              className: "w-full mb-2 p-2 border border-gray-200 rounded-lg text-sm"
            },
              mealTypes.map(m => React.createElement("option", { key: m.id, value: m.id }, m.name))
            ),
            React.createElement(Button, {
              variant: "primary",
              onClick: handleLogFood,
              disabled: isLogging,
              className: "w-full text-sm"
            }, isLogging ? "Adding..." : "Add to Meal Log")
          )
        )
      )
    );
  }

  // Scanner view
  return (
    React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex flex-col" },
      React.createElement("h3", { className: "text-lg font-bold text-gray-900 mb-4 text-center" }, "AI Food Scanner"),
      
      error && (
        React.createElement("div", { className: "mb-3 p-2 bg-red-50 border border-red-200 rounded-lg" },
          React.createElement("p", { className: "text-xs text-red-700" }, error)
        )
      ),

      React.createElement("div", {
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        className: `flex-1 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[180px] ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${isAnalyzing ? 'opacity-50' : ''}`
      },
        isAnalyzing ? (
          React.createElement(React.Fragment, null,
            React.createElement("div", { className: "animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3" }),
            React.createElement("p", { className: "text-sm font-medium text-gray-700" }, "Analyzing...")
          )
        ) : (
          React.createElement(React.Fragment, null,
            React.createElement("svg", { 
              xmlns: "http://www.w3.org/2000/svg", 
              fill: "none", 
              viewBox: "0 0 24 24", 
              strokeWidth: 1.5, 
              stroke: "currentColor", 
              className: "w-10 h-10 text-blue-400 mb-3" 
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
            React.createElement("p", { className: "text-sm font-semibold text-gray-700 mb-1" }, "Drop food photo"),
            React.createElement("p", { className: "text-xs text-gray-500 text-center" }, "AI identifies & calculates nutrition")
          )
        )
      ),

      React.createElement("input", {
        ref: fileInputRef,
        type: "file",
        accept: "image/*",
        onChange: handleFileSelect,
        className: "hidden"
      }),

      React.createElement("div", { className: "mt-4" },
        React.createElement(Button, {
          variant: "outline",
          onClick: () => fileInputRef.current?.click(),
          disabled: isAnalyzing,
          className: "w-full text-sm"
        }, "Select from Gallery")
      )
    )
  );
};

export default FoodScannerCard;
