import React, { useState } from 'react';
import { foodLogAPI } from '../../services/api.js';

const MEAL_TYPES = [
  { id: 1, name: 'Breakfast' },
  { id: 2, name: 'Lunch' },
  { id: 3, name: 'Dinner' },
  { id: 4, name: 'Snacks' }
];

const LoggedFoodItem = ({ item, onDeleteLog, onUpdateLog, canEdit }) => {
  const servingSize = item.servingSize ?? 100;
  const servingUnit = (item.servingUnit || 'g').toLowerCase();
  const initialGrams = (item.servings ?? 1) * servingSize;

  const [editing, setEditing] = useState(false);
  const [amountGrams, setAmountGrams] = useState(String(Math.round(initialGrams * 10) / 10));
  const [mealTypeId, setMealTypeId] = useState(item.mealTypeId ?? 1);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Remove "${item.name || item.foodName}" from your log?`)) return;
    setDeleting(true);
    try {
      await foodLogAPI.deleteLog(item.logId || item.id);
      if (onDeleteLog) onDeleteLog();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    const grams = parseFloat(amountGrams);
    if (isNaN(grams) || grams <= 0) return;
    setSaving(true);
    try {
      await foodLogAPI.updateLog(item.logId || item.id, { amountGrams: grams, mealTypeId });
      setEditing(false);
      if (onUpdateLog) onUpdateLog();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const name = item.name || item.foodName;
  const baseProtein = item.protein ?? 0;
  const baseCarbs = item.carbs ?? 0;
  const baseFat = item.fat ?? 0;
  const baseCalories = item.calories ?? 0;

  // Live nutrition: scale by current grams / initial grams (updates as user edits)
  const gramsNum = parseFloat(amountGrams);
  const mult = (initialGrams > 0 && !isNaN(gramsNum) && gramsNum > 0) ? gramsNum / initialGrams : 1;
  const displayCalories = Math.round((baseCalories || 0) * mult * 10) / 10;
  const displayProtein = Math.round((baseProtein || 0) * mult * 10) / 10;
  const displayCarbs = Math.round((baseCarbs || 0) * mult * 10) / 10;
  const displayFat = Math.round((baseFat || 0) * mult * 10) / 10;
  const hasMacros = baseProtein > 0 || baseCarbs > 0 || baseFat > 0;

  if (editing) {
    return (
      React.createElement("div", { className: "py-2 px-3 bg-blue-50 rounded-lg border border-blue-200" },
        React.createElement("p", { className: "font-semibold text-gray-800 mb-1" }, name),
        (baseCalories > 0 || (gramsNum > 0 && !isNaN(gramsNum))) && React.createElement("p", { className: "text-sm text-gray-600 mb-2" },
          displayCalories, " cal • ",
          (gramsNum > 0 && !isNaN(gramsNum) ? Math.round(gramsNum * 10) / 10 : Math.round(initialGrams * 10) / 10), "g"
        ),
        React.createElement("div", { className: "grid grid-cols-2 gap-2 mb-2" },
          React.createElement("div", null,
            React.createElement("label", { className: "block text-xs text-gray-600 mb-1" }, "Amount (g)"),
            React.createElement("input", {
              type: "number",
              min: "0.1",
              step: "0.1",
              value: amountGrams,
              onChange: (e) => setAmountGrams(e.target.value),
              className: "w-full px-2 py-1 border border-gray-300 rounded text-sm"
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { className: "block text-xs text-gray-600 mb-1" }, "Meal"),
            React.createElement("select", {
              value: mealTypeId,
              onChange: (e) => setMealTypeId(Number(e.target.value)),
              className: "w-full px-2 py-1 border border-gray-300 rounded text-sm"
            },
              MEAL_TYPES.map((m) => React.createElement("option", { key: m.id, value: m.id }, m.name))
            )
          )
        ),
        React.createElement("div", { className: "flex gap-2" },
          React.createElement("button", {
            onClick: handleSaveEdit,
            disabled: saving,
            className: "px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          }, saving ? "Saving..." : "Save"),
          React.createElement("button", {
            onClick: () => setEditing(false),
            className: "px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
          }, "Cancel")
        )
      )
    );
  }

  return (
    React.createElement("div", { className: "flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 group" },
      React.createElement("div", { className: "flex items-center min-w-0 flex-1" },
        item.imageUrl ? React.createElement("img", { src: item.imageUrl, alt: name, className: "w-12 h-12 rounded-lg object-cover mr-4 flex-shrink-0" }) : React.createElement("div", { className: "w-12 h-12 rounded-lg bg-gray-200 mr-4 flex-shrink-0 flex items-center justify-center" },
          React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-6 h-6 text-gray-400" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.081.768-2.015 1.837-2.175A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" })
          )
        ),
        React.createElement("div", { className: "min-w-0" },
          React.createElement("p", { className: "font-semibold text-gray-800 truncate" }, name),
          (baseCalories > 0 || item.servingSize) && React.createElement("div", { className: "flex items-center text-xs text-gray-500 mt-1" },
            React.createElement("span", null,
              Math.round(baseCalories || 0), " cal • ",
              Math.round(initialGrams * 10) / 10, "g"
            )
          )
        )
      ),
      React.createElement("div", { className: "flex items-center gap-2 flex-shrink-0" },
        React.createElement("div", { className: "text-right" },
          React.createElement("p", { className: "font-bold text-gray-900" }, Math.round(baseCalories || 0), " cal")
        ),
        canEdit && React.createElement("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" },
          React.createElement("button", {
            type: "button",
            onClick: () => setEditing(true),
            "aria-label": "Edit",
            className: "p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
          },
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4" },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.897L6 18l.879-2.652m-4.5-1.688a4.5 4.5 0 011.897-1.897l8.932-8.931a1.875 1.875 0 112.652 2.652L8.832 14.61a4.5 4.5 0 01-1.897 1.897L4 16l.879-2.652" })
            )
          ),
          React.createElement("button", {
            type: "button",
            onClick: handleDelete,
            disabled: deleting,
            "aria-label": "Delete",
            className: "p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
          },
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "w-4 h-4" },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" })
            )
          )
        )
      )
    )
  );
};

export default LoggedFoodItem;
