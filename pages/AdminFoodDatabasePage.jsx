import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar.js';
import AdminHeader from '../components/admin/AdminHeader.js';
import { nutritionAPI, adminNutritionAPI, adminFoodAPI } from '../services/api.js';
import { ADMIN_NAV_LINKS } from '../constants.js';

const AdminFoodDatabasePage = ({ onNavigate, currentPage, onLogout, user }) => {
  const [savedFoods, setSavedFoods] = useState([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const [usdaSearchQuery, setUsdaSearchQuery] = useState('');
  const [usdaSearchResults, setUsdaSearchResults] = useState([]);
  const [isSearchingUsda, setIsSearchingUsda] = useState(false);
  const [savingFoodId, setSavingFoodId] = useState(null);
  const [usdaMessage, setUsdaMessage] = useState({ type: '', text: '' });

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
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  });

  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState({
    type: '',
    text: '',
    details: null,
  });
  const handleNavigate = (page) => onNavigate(page);

  const loadSavedFoods = async () => {
    setIsLoadingSaved(true);
    setLoadError(null);
    try {
      const response = await adminNutritionAPI.getApiFoods();
      setSavedFoods(response.foods || []);
    } catch (error) {
      setLoadError(error?.message || 'Failed to load foods');
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    loadSavedFoods();
  }, []);

  const handleUsdaSearch = async () => {
    const query = usdaSearchQuery.trim();
    if (query.length < 2) return;

    setIsSearchingUsda(true);
    setUsdaMessage({ type: '', text: '' });
    try {
      const response = await nutritionAPI.search(query);
      const foods = response?.foods || [];
      setUsdaSearchResults(foods);
      if (!foods.length) {
        setUsdaMessage({
          type: 'info',
          text: 'No foods found. Try a different search term.',
        });
      }
    } catch (error) {
      setUsdaMessage({
        type: 'error',
        text: error?.message || 'Search failed. Please try again.',
      });
      setUsdaSearchResults([]);
    } finally {
      setIsSearchingUsda(false);
    }
  };

  useEffect(() => {
    if (!usdaSearchQuery || usdaSearchQuery.length < 2) {
      setUsdaSearchResults([]);
      return;
    }
    const timer = setTimeout(handleUsdaSearch, 500);
    return () => clearTimeout(timer);
  }, [usdaSearchQuery]);

  const handleSaveUsdaFood = async (food) => {
    setSavingFoodId(food.id);
    setUsdaMessage({ type: '', text: '' });
    try {
      await nutritionAPI.saveToDatabase(food);
      setUsdaMessage({
        type: 'success',
        text: `"${food.name || 'Food'}" saved to food database!`,
      });
      setUsdaSearchResults((prev) => prev.filter((f) => f.id !== food.id));
      await loadSavedFoods();
    } catch (error) {
      setUsdaMessage({
        type: 'error',
        text: 'Failed to save food. It may already exist in the database.',
      });
    } finally {
      setSavingFoodId(null);
    }
  };

  const updateManualField = (field, value) => {
    setManualForm((prev) => ({ ...prev, [field]: value }));
    setManualMessage({ type: '', text: '' });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const name = manualForm.foodName.trim();
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
        fiber: Number(manualForm.fiber) || 0,
        sugar: Number(manualForm.sugar) || 0,
        sodium: Number(manualForm.sodium) || 0,
        brandName: manualForm.brandName?.trim() || undefined,
      });
      setManualMessage({ type: 'success', text: `"${name}" added to database.` });
      setManualForm({
        foodName: '',
        brandName: '',
        servingSize: 100,
        servingUnit: 'g',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      });
      await loadSavedFoods();
    } catch (error) {
      setManualMessage({
        type: 'error',
        text: error?.message || 'Failed to add food.',
      });
    } finally {
      setManualSaving(false);
    }
  };

  const handleImportExcel = async () => {
    if (!importFile) {
      setImportMessage({ type: 'error', text: 'Please select an Excel file.', details: null });
      return;
    }

    setImporting(true);
    setImportMessage({ type: '', text: '', details: null });
    try {
      const result = await adminFoodAPI.importExcel(importFile);
      const dupCount = result.duplicates ?? 0;
      let text = result.message || `Imported ${result.created || 0} foods.`;
      if (dupCount > 0) {
        text += ` There's a duplicate data - ${dupCount} row(s) were skipped because they already exist in the Local Database.`;
      }
      setImportMessage({
        type: dupCount > 0 && (result.created || 0) === 0 ? 'warning' : 'success',
        text,
        details: result.errors?.length ? result.errors : null,
      });
      setImportFile(null);
      await loadSavedFoods();
    } catch (error) {
      setImportMessage({
        type: 'error',
        text: error?.message || 'Import failed.',
        details: null,
      });
    } finally {
      setImporting(false);
    }
  };

  const normalizedLocalQuery = localSearchQuery.trim().toLowerCase();
  const filteredFoods =
    !normalizedLocalQuery
      ? savedFoods
      : savedFoods.filter((food) => {
          const name = (food.name || '').toLowerCase();
          const brand = (food.addedBy || '').toLowerCase();
          return name.includes(normalizedLocalQuery) || brand.includes(normalizedLocalQuery);
        });

  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        <div className="hidden lg:block">
          <AdminSidebar
            onNavigate={handleNavigate}
            currentPage={currentPage}
            onLogout={onLogout}
            user={user}
          />
        </div>

        <div className="flex-1 p-6 pb-16 lg:pb-6 overflow-auto">
          <AdminHeader
            title="Food Database"
            subtitle="Search USDA, import via Excel, and add custom foods."
            showSearchBar={false}
            user={user}
            onLogout={onLogout}
          />

          {/* USDA Search & Import */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Search &amp; Import Foods from USDA
            </h2>

            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={usdaSearchQuery}
                  onChange={(e) => setUsdaSearchQuery(e.target.value)}
                  placeholder="Search USDA database (e.g., 'chicken breast', 'apple', 'rice')..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                {isSearchingUsda && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleUsdaSearch}
                disabled={isSearchingUsda || usdaSearchQuery.trim().length < 2}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Search
              </button>
            </div>

            {usdaMessage.text && (
              <div
                className={
                  'mb-4 p-3 rounded-lg text-sm ' +
                  (usdaMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : usdaMessage.type === 'info'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-red-50 text-red-700 border border-red-200')
                }
              >
                {usdaMessage.text}
              </div>
            )}

            {usdaSearchResults.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700">
                    Found {usdaSearchResults.length} results
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                  {usdaSearchResults.map((food) => (
                    <div
                      key={food.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{food.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {food.calories} kcal • P: {food.protein}g • C: {food.carbs}g • F:{' '}
                          {food.fat}g
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSaveUsdaFood(food)}
                        disabled={savingFoodId === food.id}
                        className="ml-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center gap-2 whitespace-nowrap"
                      >
                        {savingFoodId === food.id ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : !usdaSearchQuery.trim() ? (
              <div className="text-center py-6 text-gray-500">
                <p>Search the USDA database to find and import foods.</p>
                <p className="text-sm text-gray-400 mt-1">Enter at least 2 characters to search.</p>
              </div>
            ) : null}
          </div>

          {/* Manual Add Food callout */}
          <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add Food Manually</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Create a custom food entry when it is not available in the database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowManualForm(true)}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add food
              </button>
            </div>
          </div>

          {/* Import from Excel */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Import Foods from Excel</h2>
            <p className="text-sm text-gray-500 mb-3">
              Upload an .xlsx file with columns: food_name (or name), serving_size, serving_unit,
              calories, protein, carbs, fat. Optional: fiber, sugar, sodium, brand_name.
            </p>
            {importMessage.text && (
              <div
                className={
                  'p-3 rounded-lg text-sm mb-3 ' +
                  (importMessage.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : importMessage.type === 'warning'
                      ? 'bg-amber-50 text-amber-800'
                      : 'bg-red-50 text-red-700')
                }
              >
                {importMessage.text}
                {importMessage.details?.length > 0 && (
                  <ul className="mt-2 text-xs list-disc list-inside">
                    {importMessage.details.slice(0, 5).map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept=".xlsx,.xls"
                className="text-sm"
                onChange={(e) => {
                  const files = e.target.files;
                  setImportFile(files && files[0] ? files[0] : null);
                }}
              />
              <button
                type="button"
                onClick={handleImportExcel}
                disabled={!importFile || importing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {importing ? 'Importing...' : 'Import Excel'}
              </button>
            </div>
          </div>

          {/* Manual Add Food modal */}
          {showManualForm && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => {
                setShowManualForm(false);
                setManualMessage({ type: '', text: '' });
              }}
            >
              <div
                className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Add Food</h2>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => {
                        setShowManualForm(false);
                        setManualMessage({ type: '', text: '' });
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    {manualMessage.text && (
                      <div
                        className={
                          'p-3 rounded-lg text-sm ' +
                          (manualMessage.type === 'success'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700')
                        }
                      >
                        {manualMessage.text}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Food name *
                        </label>
                        <input
                          type="text"
                          value={manualForm.foodName}
                          onChange={(e) => updateManualField('foodName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Brand (optional)
                        </label>
                        <input
                          type="text"
                          value={manualForm.brandName}
                          onChange={(e) => updateManualField('brandName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Serving size
                        </label>
                        <input
                          type="number"
                          min={0.1}
                          step={0.1}
                          value={manualForm.servingSize}
                          onChange={(e) => updateManualField('servingSize', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <input
                          type="text"
                          value={manualForm.servingUnit}
                          onChange={(e) => updateManualField('servingUnit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Calories *
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={manualForm.calories}
                          onChange={(e) => updateManualField('calories', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Protein (g)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={manualForm.protein}
                          onChange={(e) => updateManualField('protein', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Carbs (g)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={manualForm.carbs}
                          onChange={(e) => updateManualField('carbs', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fat (g)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={manualForm.fat}
                          onChange={(e) => updateManualField('fat', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fiber (g)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={manualForm.fiber}
                          onChange={(e) => updateManualField('fiber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sugar (g)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={manualForm.sugar}
                          onChange={(e) => updateManualField('sugar', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sodium (mg)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={manualForm.sodium}
                          onChange={(e) => updateManualField('sodium', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={manualSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {manualSaving ? 'Saving...' : 'Add Food'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowManualForm(false);
                          setManualMessage({ type: '', text: '' });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Recently Saved Foods */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recently Saved Foods</h2>
              <div className="w-full sm:w-64 relative">
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  placeholder="Search local foods..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
            </div>
            {loadError && (
              <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-700">{loadError}</div>
            )}
            {isLoadingSaved ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : filteredFoods.length > 0 ? (
              <div className="max-h-80 overflow-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Food Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Calories
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Protein
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Carbs
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fat
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFoods.map((food) => (
                      <tr key={food.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 uppercase">
                          {(food.name || '').toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {food.calories ? `${food.calories} kcal` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {food.protein ? `${food.protein}g` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {food.carbs ? `${food.carbs}g` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {food.fat ? `${food.fat}g` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No foods saved yet. Use the tools above to add foods.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile admin bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-inner">
        <div className="flex justify-around">
          {ADMIN_NAV_LINKS.map((link) => (
            <button
              key={link.name}
              type="button"
              onClick={() => handleNavigate(link.href)}
              className={
                'flex flex-col items-center justify-center flex-1 py-2 text-xs ' +
                (currentPage === link.href ? 'text-blue-600 font-semibold' : 'text-gray-500')
              }
            >
              <span className="mb-0.5">{link.icon}</span>
              <span className="leading-tight">{link.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default AdminFoodDatabasePage;

