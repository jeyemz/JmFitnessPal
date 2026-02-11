import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar.js';
import AdminHeader from '../components/admin/AdminHeader.js';
import { nutritionAPI, adminNutritionAPI, adminFoodAPI } from '../services/api.js';
import { ADMIN_NAV_LINKS } from '../constants.js';

const AdminFoodDatabasePage = ({ onNavigate, currentPage, onLogout, user }) => {
  const [savedFoods, setSavedFoods] = useState([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualMessage, setManualMessage] = useState({ type: '', text: '' });
  const [manualForm, setManualForm] = useState({
    foodName: '',
    brandName: '',
    servingSize: 100,
    servingUnit: 'g',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  // USDA search state
  const [usdaSearchQuery, setUsdaSearchQuery] = useState('');
  const [usdaSearchResults, setUsdaSearchResults] = useState([]);
  const [isSearchingUsda, setIsSearchingUsda] = useState(false);
  const [savingFoodId, setSavingFoodId] = useState(null);
  const [usdaMessage, setUsdaMessage] = useState({ type: '', text: '' });

  // Excel import state
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState({ type: '', text: '', details: null });

  const handleNavigate = (page) => {
    onNavigate(page);
  };

  const loadSavedFoods = async () => {
    setIsLoadingSaved(true);
    setLoadError(null);
    try {
      const response = await adminNutritionAPI.getApiFoods();
      const foods = response && response.foods ? response.foods : [];
      setSavedFoods(foods);
    } catch (error) {
      console.error('Failed to load saved foods:', error);
      setLoadError(error && error.message ? error.message : 'Failed to load foods');
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    loadSavedFoods();
  }, []);

  // Debounced USDA search based on query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (usdaSearchQuery && usdaSearchQuery.length >= 2) {
        handleUsdaSearch();
      } else {
        setUsdaSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [usdaSearchQuery]);

  const updateManualField = (field, value) => {
    setManualForm(function (prev) {
      var next = {};
      for (var key in prev) next[key] = prev[key];
      next[field] = value;
      return next;
    });
    setManualMessage({ type: '', text: '' });
  };

  const handleManualSubmit = async (event) => {
    event.preventDefault();
    const name = manualForm.foodName ? manualForm.foodName.trim() : '';
    if (!name) {
      setManualMessage({ type: 'error', text: 'Food name is required.' });
      return;
    }

    setManualSaving(true);
    setManualMessage({ type: '', text: '' });

    try {
      await adminFoodAPI.createFood({
        foodName: name,
        servingSize: Number(manualForm.servingSize) || 100,
        servingUnit: (manualForm.servingUnit || 'g').trim() || 'g',
        calories: Number(manualForm.calories) || 0,
        protein: Number(manualForm.protein) || 0,
        carbohydrates: Number(manualForm.carbs) || 0,
        fat: Number(manualForm.fat) || 0,
        brandName: manualForm.brandName ? manualForm.brandName.trim() : undefined
      });

      setManualMessage({ type: 'success', text: '"' + name + '" added to database.' });
      setManualForm({
        foodName: '',
        brandName: '',
        servingSize: 100,
        servingUnit: 'g',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
      await loadSavedFoods();
    } catch (error) {
      console.error('Failed to add food:', error);
      setManualMessage({
        type: 'error',
        text: (error && error.message) ? error.message : 'Failed to add food.'
      });
    } finally {
      setManualSaving(false);
    }
  };

  const handleUsdaSearch = async () => {
    const query = usdaSearchQuery ? usdaSearchQuery.trim() : '';
    if (!query || query.length < 2) {
      return;
    }

    setIsSearchingUsda(true);
    setUsdaMessage({ type: '', text: '' });

    try {
      const response = await nutritionAPI.search(query);
      const foods = response && response.foods ? response.foods : [];
      setUsdaSearchResults(foods);

      if (!foods || foods.length === 0) {
        setUsdaMessage({
          type: 'info',
          text: 'No foods found. Try a different search term.'
        });
      }
    } catch (error) {
      console.error('USDA search error:', error);
      setUsdaMessage({
        type: 'error',
        text: (error && error.message) ? error.message : 'Search failed. Please try again.'
      });
      setUsdaSearchResults([]);
    } finally {
      setIsSearchingUsda(false);
    }
  };

  const handleSaveUsdaFood = async (food) => {
    if (!food) return;
    setSavingFoodId(food.id);
    setUsdaMessage({ type: '', text: '' });

    try {
      await nutritionAPI.saveToDatabase(food);
      setUsdaMessage({
        type: 'success',
        text: '"' + (food.name || 'Food') + '" saved to food database!'
      });

      // Remove from search results and refresh saved list
      setUsdaSearchResults(function (prev) {
        return (prev || []).filter(function (f) {
          return f.id !== food.id;
        });
      });
      await loadSavedFoods();
    } catch (error) {
      console.error('Failed to save USDA food:', error);
      setUsdaMessage({
        type: 'error',
        text: 'Failed to save food. It may already exist in the database.'
      });
    } finally {
      setSavingFoodId(null);
    }
  };

  const handleImportExcel = async () => {
    if (!importFile) {
      setImportMessage({
        type: 'error',
        text: 'Please select an Excel file.'
      });
      return;
    }

    setImporting(true);
    setImportMessage({ type: '', text: '', details: null });

    try {
      const result = await adminFoodAPI.importExcel(importFile);
      const messageText = result && result.message
        ? result.message
        : ('Imported ' + (result && result.created ? result.created : 0) + ' foods.');

      setImportMessage({
        type: 'success',
        text: messageText,
        details: result && result.errors && result.errors.length ? result.errors : null
      });
      setImportFile(null);
      await loadSavedFoods();
    } catch (error) {
      console.error('Import Excel error:', error);
      setImportMessage({
        type: 'error',
        text: (error && error.message) ? error.message : 'Import failed.',
        details: null
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    React.createElement(
      React.Fragment,
      null,
      React.createElement(
        "div",
        { className: "flex min-h-screen bg-gray-100" },
        React.createElement(
          "div",
          { className: "hidden lg:block" },
          React.createElement(AdminSidebar, {
            onNavigate: handleNavigate,
            currentPage: currentPage,
            onLogout: onLogout,
            user: user
          })
        ),
        React.createElement(
          "div",
          { className: "flex-1 p-6 pb-16 lg:pb-6 overflow-auto" },
          React.createElement(AdminHeader, {
            title: "Food Database",
            subtitle: "Search USDA, import via Excel, and add custom foods.",
            showSearchBar: false,
            user: user,
            onLogout: onLogout
          }),

          /* USDA Food Search & Import Section */
          React.createElement(
            "div",
            { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6" },
            React.createElement(
              "h2",
              { className: "text-lg font-bold text-gray-900 mb-4" },
              "Search & Import Foods from USDA"
            ),
            React.createElement(
              "div",
              { className: "flex gap-3 mb-4" },
              React.createElement(
                "div",
                { className: "flex-1 relative" },
                React.createElement("input", {
                  type: "text",
                  value: usdaSearchQuery,
                  onChange: function (e) {
                    setUsdaSearchQuery(e.target.value);
                  },
                  placeholder: "Search USDA database (e.g., 'chicken breast', 'apple', 'rice')...",
                  className:
                    "w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                }),
                React.createElement(
                  "svg",
                  {
                    xmlns: "http://www.w3.org/2000/svg",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    strokeWidth: 1.5,
                    stroke: "currentColor",
                    className:
                      "w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  },
                  React.createElement("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    d: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  })
                ),
                isSearchingUsda &&
                  React.createElement(
                    "div",
                    {
                      className:
                        "absolute right-3 top-1/2 transform -translate-y-1/2"
                    },
                    React.createElement("div", {
                      className:
                        "animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"
                    })
                  )
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: handleUsdaSearch,
                  disabled: isSearchingUsda || !usdaSearchQuery || usdaSearchQuery.length < 2,
                  className:
                    "px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                },
                "Search"
              )
            ),
            usdaMessage.text &&
              React.createElement(
                "div",
                {
                  className:
                    "mb-4 p-3 rounded-lg text-sm " +
                    (usdaMessage.type === 'success'
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : usdaMessage.type === 'info'
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-red-50 text-red-700 border border-red-200")
                },
                usdaMessage.text
              ),
            usdaSearchResults && usdaSearchResults.length > 0
              ? React.createElement(
                  "div",
                  { className: "border border-gray-200 rounded-lg overflow-hidden" },
                  React.createElement(
                    "div",
                    { className: "bg-gray-50 px-4 py-2 border-b border-gray-200" },
                    React.createElement(
                      "p",
                      { className: "text-sm font-medium text-gray-700" },
                      "Found ",
                      usdaSearchResults.length,
                      " results"
                    )
                  ),
                  React.createElement(
                    "div",
                    {
                      className:
                        "max-h-96 overflow-y-auto divide-y divide-gray-100"
                    },
                    usdaSearchResults.map(function (food) {
                      return React.createElement(
                        "div",
                        {
                          key: food.id,
                          className:
                            "flex items-center justify-between p-4 hover:bg-gray-50"
                        },
                        React.createElement(
                          "div",
                          { className: "flex-1 min-w-0" },
                          React.createElement(
                            "p",
                            {
                              className:
                                "font-medium text-gray-900 truncate"
                            },
                            food.name
                          ),
                          React.createElement(
                            "p",
                            { className: "text-sm text-gray-500 mt-1" },
                            food.calories,
                            " kcal \u2022 P: ",
                            food.protein,
                            "g \u2022 C: ",
                            food.carbs,
                            "g \u2022 F: ",
                            food.fat,
                            "g"
                          )
                        ),
                        React.createElement(
                          "button",
                          {
                            type: "button",
                            onClick: function () {
                              handleSaveUsdaFood(food);
                            },
                            disabled: savingFoodId === food.id,
                            className:
                              "ml-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center gap-2 whitespace-nowrap"
                          },
                          savingFoodId === food.id ? "Saving..." : "Save"
                        )
                      );
                    })
                  )
                )
              )
              : !usdaSearchQuery &&
                React.createElement(
                  "div",
                  { className: "text-center py-6 text-gray-500" },
                  React.createElement(
                    "p",
                    null,
                    "Search the USDA database to find and import foods."
                  ),
                  React.createElement(
                    "p",
                    { className: "text-sm text-gray-400 mt-1" },
                    "Enter at least 2 characters to search."
                  )
                )
          ),

          /* Manual Add Food callout */
          React.createElement(
            "div",
            { className: "bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-100 mb-6" },
            React.createElement(
              "div",
              { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3" },
              React.createElement(
                "div",
                null,
                React.createElement(
                  "h2",
                  { className: "text-lg font-bold text-gray-900" },
                  "Add Food Manually"
                ),
                React.createElement(
                  "p",
                  { className: "mt-1 text-sm text-gray-500" },
                  "Create a custom food entry when it is not available in the database."
                )
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: function () {
                    setShowManualForm(true);
                  },
                  className:
                    "inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                },
                React.createElement(
                  "svg",
                  {
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
                    d: "M12 4.5v15m7.5-7.5h-15"
                  })
                ),
                "Add food"
              )
            )
          ),

          /* Import from Excel */
          React.createElement(
            "div",
            { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6" },
            React.createElement(
              "h2",
              { className: "text-lg font-bold text-gray-900 mb-4" },
              "Import Foods from Excel"
            ),
            React.createElement(
              "p",
              { className: "text-sm text-gray-500 mb-3" },
              "Upload an .xlsx file with columns: food_name (or name), serving_size, serving_unit, calories, protein, carbs, fat. Optional: fiber, sugar, sodium, brand_name."
            ),
            importMessage.text &&
              React.createElement(
                "div",
                {
                  className:
                    "p-3 rounded-lg text-sm mb-3 " +
                    (importMessage.type === 'success'
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700")
                },
                importMessage.text,
                importMessage.details &&
                  importMessage.details.length > 0 &&
                  React.createElement(
                    "ul",
                    { className: "mt-2 text-xs list-disc list-inside" },
                    importMessage.details.slice(0, 5).map(function (err, index) {
                      return React.createElement(
                        "li",
                        { key: index },
                        err
                      );
                    })
                  )
              ),
            React.createElement(
              "div",
              { className: "flex flex-wrap items-center gap-3" },
              React.createElement("input", {
                type: "file",
                accept: ".xlsx,.xls",
                className: "text-sm",
                onChange: function (e) {
                  var files = e.target.files;
                  setImportFile(files && files[0] ? files[0] : null);
                }
              }),
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: handleImportExcel,
                  disabled: !importFile || importing,
                  className:
                    "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                },
                importing ? "Importing..." : "Import Excel"
              )
            )
          ),

          /* Manual Add Food modal */
          showManualForm &&
            React.createElement(
              "div",
              {
                className:
                  "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50",
                onClick: function () {
                  setShowManualForm(false);
                  setManualMessage({ type: '', text: '' });
                }
              },
              React.createElement(
                "div",
                {
                  className:
                    "bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto",
                  onClick: function (e) {
                    e.stopPropagation();
                  }
                },
                React.createElement(
                  "div",
                  { className: "p-6" },
                  React.createElement(
                    "div",
                    { className: "flex justify-between items-center mb-4" },
                    React.createElement(
                      "h2",
                      { className: "text-lg font-bold text-gray-900" },
                      "Add Food"
                    ),
                    React.createElement(
                      "button",
                      {
                        type: "button",
                        "aria-label": "Close",
                        onClick: function () {
                          setShowManualForm(false);
                          setManualMessage({ type: '', text: '' });
                        },
                        className:
                          "p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                      },
                      React.createElement(
                        "svg",
                        {
                          xmlns: "http://www.w3.org/2000/svg",
                          fill: "none",
                          viewBox: "0 0 24 24",
                          strokeWidth: 1.5,
                          stroke: "currentColor",
                          className: "w-6 h-6"
                        },
                        React.createElement("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          d: "M6 18L18 6M6 6l12 12"
                        })
                      )
                    )
                  ),
                  React.createElement(
                    "form",
                    { onSubmit: handleManualSubmit, className: "space-y-4" },
                    manualMessage.text &&
                      React.createElement(
                        "div",
                        {
                          className:
                            "p-3 rounded-lg text-sm " +
                            (manualMessage.type === 'success'
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700")
                        },
                        manualMessage.text
                      ),
                    React.createElement(
                      "div",
                      { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "label",
                          {
                            className:
                              "block text-sm font-medium text-gray-700 mb-1"
                          },
                          "Food name *"
                        ),
                        React.createElement("input", {
                          type: "text",
                          value: manualForm.foodName,
                          onChange: function (e) {
                            updateManualField('foodName', e.target.value);
                          },
                          className:
                            "w-full px-3 py-2 border border-gray-300 rounded-lg",
                          required: true
                        })
                      ),
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "label",
                          {
                            className:
                              "block text-sm font-medium text-gray-700 mb-1"
                          },
                          "Brand (optional)"
                        ),
                        React.createElement("input", {
                          type: "text",
                          value: manualForm.brandName,
                          onChange: function (e) {
                            updateManualField('brandName', e.target.value);
                          },
                          className:
                            "w-full px-3 py-2 border border-gray-300 rounded-lg"
                        })
                      )
                    ),
                    React.createElement(
                      "div",
                      { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "label",
                          {
                            className:
                              "block text-sm font-medium text-gray-700 mb-1"
                          },
                          "Serving size"
                        ),
                        React.createElement("input", {
                          type: "number",
                          min: 0.1,
                          step: 0.1,
                          value: manualForm.servingSize,
                          onChange: function (e) {
                            updateManualField('servingSize', e.target.value);
                          },
                          className:
                            "w-full px-3 py-2 border border-gray-300 rounded-lg"
                        })
                      ),
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "label",
                          {
                            className:
                              "block text-sm font-medium text-gray-700 mb-1"
                          },
                          "Unit"
                        ),
                        React.createElement("input", {
                          type: "text",
                          value: manualForm.servingUnit,
                          onChange: function (e) {
                            updateManualField('servingUnit', e.target.value);
                          },
                          className:
                            "w-full px-3 py-2 border border-gray-300 rounded-lg"
                        })
                      ),
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "label",
                          {
                            className:
                              "block text-sm font-medium text-gray-700 mb-1"
                          },
                          "Calories *"
                        ),
                        React.createElement("input", {
                          type: "number",
                          min: 0,
                          value: manualForm.calories,
                          onChange: function (e) {
                            updateManualField('calories', e.target.value);
                          },
                          className:
                            "w-full px-3 py-2 border border-gray-300 rounded-lg"
                        })
                      ),
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "label",
                          {
                            className:
                              "block text-sm font-medium text-gray-700 mb-1"
                          },
                          "Protein (g)"
                        ),
                        React.createElement("input", {
                          type: "number",
                          min: 0,
                          value: manualForm.protein,
                          onChange: function (e) {
                            updateManualField('protein', e.target.value);
                          },
                          className:
                            "w-full px-3 py-2 border border-gray-300 rounded-lg"
                        })
                      ),
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "label",
                          {
                            className:
                              "block text-sm font-medium text-gray-700 mb-1"
                          },
                          "Carbs (g)"
                        ),
                        React.createElement("input", {
                          type: "number",
                          min: 0,
                          value: manualForm.carbs,
                          onChange: function (e) {
                            updateManualField('carbs', e.target.value);
                          },
                          className:
                            "w-full px-3 py-2 border border-gray-300 rounded-lg"
                        })
                      ),
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "label",
                          {
                            className:
                              "block text-sm font-medium text-gray-700 mb-1"
                          },
                          "Fat (g)"
                        ),
                        React.createElement("input", {
                          type: "number",
                          min: 0,
                          value: manualForm.fat,
                          onChange: function (e) {
                            updateManualField('fat', e.target.value);
                          },
                          className:
                            "w-full px-3 py-2 border border-gray-300 rounded-lg"
                        })
                      )
                    ),
                    React.createElement(
                      "div",
                      { className: "flex gap-2 pt-2" },
                      React.createElement(
                        "button",
                        {
                          type: "submit",
                          disabled: manualSaving,
                          className:
                            "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        },
                        manualSaving ? "Saving..." : "Add Food"
                      ),
                      React.createElement(
                        "button",
                        {
                          type: "button",
                          onClick: function () {
                            setShowManualForm(false);
                            setManualMessage({ type: '', text: '' });
                          },
                          className:
                            "px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        },
                        "Cancel"
                      )
                    )
                  )
                )
              )
            ),

          /* Recently Saved Foods */
          React.createElement(
            "div",
            { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
            React.createElement(
              "h2",
              { className: "text-lg font-bold text-gray-900 mb-4" },
              "Recently Saved Foods"
            ),
            loadError &&
              React.createElement(
                "div",
                {
                  className:
                    "mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-700"
                },
                loadError
              ),
            isLoadingSaved
              ? React.createElement(
                  "div",
                  { className: "flex justify-center py-8" },
                  React.createElement("div", {
                    className:
                      "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
                  })
                )
              : savedFoods && savedFoods.length > 0
              ? React.createElement(
                  "div",
                  { className: "overflow-x-auto" },
                  React.createElement(
                    "table",
                    { className: "min-w-full divide-y divide-gray-200" },
                    React.createElement(
                      "thead",
                      { className: "bg-gray-50" },
                      React.createElement(
                        "tr",
                        null,
                        React.createElement(
                          "th",
                          {
                            className:
                              "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                          },
                          "Food Name"
                        ),
                        React.createElement(
                          "th",
                          {
                            className:
                              "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                          },
                          "Calories"
                        ),
                        React.createElement(
                          "th",
                          {
                            className:
                              "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                          },
                          "Protein"
                        ),
                        React.createElement(
                          "th",
                          {
                            className:
                              "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                          },
                          "Carbs"
                        ),
                        React.createElement(
                          "th",
                          {
                            className:
                              "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                          },
                          "Fat"
                        )
                      )
                    ),
                    React.createElement(
                      "tbody",
                      { className: "bg-white divide-y divide-gray-200" },
                      savedFoods.slice(0, 20).map(function (food) {
                        var name = food && food.name ? food.name : '';
                        return React.createElement(
                          "tr",
                          { key: food.id, className: "hover:bg-gray-50" },
                          React.createElement(
                            "td",
                            {
                              className:
                                "px-4 py-3 text-sm font-medium text-gray-900 uppercase"
                            },
                            name.toUpperCase()
                          ),
                          React.createElement(
                            "td",
                            { className: "px-4 py-3 text-sm text-gray-600" },
                            (food && food.calories) ? food.calories + " kcal" : "—"
                          ),
                          React.createElement(
                            "td",
                            { className: "px-4 py-3 text-sm text-gray-600" },
                            (food && food.protein) ? food.protein + "g" : "—"
                          ),
                          React.createElement(
                            "td",
                            { className: "px-4 py-3 text-sm text-gray-600" },
                            (food && food.carbs) ? food.carbs + "g" : "—"
                          ),
                          React.createElement(
                            "td",
                            { className: "px-4 py-3 text-sm text-gray-600" },
                            (food && food.fat) ? food.fat + "g" : "—"
                          )
                        );
                      })
                    )
                  )
                )
              : React.createElement(
                  "p",
                  { className: "text-center text-gray-500 py-8" },
                  "No foods saved yet. Use the button above to add a food."
                )
          )
        )
      ),
      React.createElement(
        "nav",
        {
          className:
            "lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-inner"
        },
        React.createElement(
          "div",
          { className: "flex justify-around" },
          ADMIN_NAV_LINKS.map(function (link) {
            return React.createElement(
              "button",
              {
                key: link.name,
                type: "button",
                onClick: function () {
                  handleNavigate(link.href);
                },
                className:
                  "flex flex-col items-center justify-center flex-1 py-2 text-xs " +
                  (currentPage === link.href
                    ? "text-blue-600 font-semibold"
                    : "text-gray-500")
              },
              React.createElement("span", { className: "mb-0.5" }, link.icon),
              React.createElement(
                "span",
                { className: "leading-tight" },
                link.name
              )
            );
          })
        )
      )
    )
  );
};

export default AdminFoodDatabasePage;
