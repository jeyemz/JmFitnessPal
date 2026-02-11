import React, { useState, useEffect, useCallback } from 'react';
import DashboardTopBar from '../components/dashboard/DashboardTopBar.js';
import Button from '../components/Button.js';
import { MACRO_PRESETS } from '../constants.js';
import { userAPI } from '../services/api.js';

const GoalsPage = ({ onNavigate, user, onLogout }) => {
  const DEFAULT_CALORIE_GOAL = 2000;
  const DEFAULT_TARGET_WEIGHT = 75.0;
  const DEFAULT_MACRO_PRESET = 'Balanced';

  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(user?.goals?.dailyCalorieGoal ?? DEFAULT_CALORIE_GOAL);
  const [targetWeight, setTargetWeight] = useState(DEFAULT_TARGET_WEIGHT);
  const [selectedMacroPreset, setSelectedMacroPreset] = useState(DEFAULT_MACRO_PRESET);
  const [proteinGrams, setProteinGrams] = useState(user?.goals?.proteinGoal ?? 150);
  const [carbsGrams, setCarbsGrams] = useState(user?.goals?.carbsGoal ?? 250);
  const [fatGrams, setFatGrams] = useState(user?.goals?.fatGoal ?? 65);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadGoals = useCallback(async () => {
    try {
      const res = await userAPI.getGoals();
      const g = res?.goals;
      if (g) {
        setDailyCalorieGoal(g.dailyCalorieGoal ?? DEFAULT_CALORIE_GOAL);
        setProteinGrams(g.proteinGoal ?? 150);
        setCarbsGrams(g.carbsGoal ?? 250);
        setFatGrams(g.fatGoal ?? 65);
      }
    } catch (_) { /* use defaults */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleRecalculate = async () => {
    try {
      const res = await userAPI.calculateGoals();
      const g = res?.goals;
      if (g) {
        setDailyCalorieGoal(g.dailyCalorieGoal);
        setProteinGrams(g.proteinGoal);
        setCarbsGrams(g.carbsGoal);
        setFatGrams(g.fatGoal);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateMacroGrams = useCallback(() => {
    const preset = MACRO_PRESETS[selectedMacroPreset];
    if (!preset) return;

    const proteinCalories = dailyCalorieGoal * (preset.protein / 100);
    const carbsCalories = dailyCalorieGoal * (preset.carbs / 100);
    const fatCalories = dailyCalorieGoal * (preset.fat / 100);

    setProteinGrams(Math.round(proteinCalories / 4)); // 4 kcal/g protein
    setCarbsGrams(Math.round(carbsCalories / 4));     // 4 kcal/g carbs
    setFatGrams(Math.round(fatCalories / 9));         // 9 kcal/g fat
  }, [dailyCalorieGoal, selectedMacroPreset]);

  useEffect(() => {
    calculateMacroGrams();
  }, [calculateMacroGrams]);

  const handleCalorieChange = (delta) => {
    setDailyCalorieGoal((prev) => Math.max(1000, prev + delta)); // Prevent going below a reasonable minimum
  };

  const handleWeightChange = (delta) => {
    setTargetWeight((prev) => Math.max(30, prev + delta)); // Prevent going below a reasonable minimum
  };

  const handleMacroSelect = (presetName) => {
    setSelectedMacroPreset(presetName);
  };

  const handleUpdateGoals = async () => {
    setSaving(true);
    try {
      await userAPI.updateGoals({
        goalType: 'maintain_weight',
        dailyCalorieGoal,
        proteinGoal: proteinGrams,
        carbsGoal: carbsGrams,
        fatGoal: fatGrams
      });
      alert('Goals updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update goals.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!window.confirm('Recalculate goals from your profile (age, weight, height, activity)?')) return;
    await handleRecalculate();
  };

  return (
    React.createElement("div", { className: "flex-1 p-6 overflow-auto" },
      React.createElement(DashboardTopBar, { title: "My Goals", subtitle: "Keep it simple. Adjust your daily targets here.", showSearchBar: false, user: user, onLogout: onLogout }),

      React.createElement("div", { className: "space-y-6 max-w-4xl mx-auto" },
        /* Daily Calorie Goal Section */
        React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between" },
          React.createElement("div", null,
            React.createElement("p", { className: "text-sm uppercase text-gray-500 font-medium mb-1" }, "Daily Calorie Goal"),
            React.createElement("p", { className: "text-gray-600 text-sm" }, "Target amount to consume per day.")
          ),
          React.createElement("div", { className: "flex items-center space-x-3" },
            React.createElement("button", {
              onClick: () => handleCalorieChange(-50),
              className: "w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
              "aria-label": "Decrease calorie goal by 50"
            },
              React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: "w-5 h-5" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 12h-15" }))
            ),
            React.createElement("div", { className: "text-center" },
              loading ? React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" }) : React.createElement("p", { className: "text-3xl font-bold text-gray-900" }, dailyCalorieGoal.toLocaleString()),
              !loading && React.createElement("p", { className: "text-sm text-blue-600" }, "cal / day")
            ),
            React.createElement("button", {
              onClick: () => handleCalorieChange(50),
              className: "w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
              "aria-label": "Increase calorie goal by 50"
            },
              React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: "w-5 h-5" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" }))
            )
          )
        ),

        /* Target Weight Section */
        React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between" },
          React.createElement("div", null,
            React.createElement("p", { className: "text-sm uppercase text-gray-500 font-medium mb-1" }, "Target Weight"),
            React.createElement("p", { className: "text-gray-600 text-sm" }, "Your ideal weight benchmark.")
          ),
          React.createElement("div", { className: "flex items-center space-x-3" },
            React.createElement("button", {
              onClick: () => handleWeightChange(-0.5),
              className: "w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
              "aria-label": "Decrease target weight by 0.5 kg"
            },
              React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: "w-5 h-5" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 12h-15" }))
            ),
            React.createElement("div", { className: "text-center" },
              React.createElement("p", { className: "text-3xl font-bold text-gray-900" }, targetWeight.toFixed(1)),
              React.createElement("p", { className: "text-sm text-blue-600" }, "kg")
            ),
            React.createElement("button", {
              onClick: () => handleWeightChange(0.5),
              className: "w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
              "aria-label": "Increase target weight by 0.5 kg"
            },
              React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: "w-5 h-5" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" }))
            )
          )
        ),

        /* Macro Ratios Section */
        React.createElement("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-gray-100" },
          React.createElement("h3", { className: "text-xl font-bold text-gray-900 mb-2" }, "Macro Ratios"),
          React.createElement("p", { className: "text-gray-600 text-sm mb-6" }, "Select a predefined distribution preset."),

          React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" },
            Object.entries(MACRO_PRESETS).map(([presetName, presetData]) => (
              React.createElement("button", {
                key: presetName,
                onClick: () => handleMacroSelect(presetName),
                className: `p-4 rounded-lg border-2 ${
                  selectedMacroPreset === presetName
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white text-gray-800 hover:border-blue-300'
                } transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-500`
              },
                React.createElement("p", { className: "font-semibold text-lg mb-1" }, presetName),
                React.createElement("p", { className: "text-sm" }, presetData.description)
              )
            ))
          ),

          React.createElement("div", { className: "grid grid-cols-3 gap-4 text-center mt-6" },
            React.createElement("div", null,
              React.createElement("p", { className: "text-xs uppercase text-gray-500 font-medium" }, "Protein"),
              React.createElement("p", { className: "text-xl font-bold text-gray-900" }, proteinGrams, React.createElement("span", { className: "text-base text-gray-600" }, "g"))
            ),
            React.createElement("div", null,
              React.createElement("p", { className: "text-xs uppercase text-gray-500 font-medium" }, "Carbohydrates"),
              React.createElement("p", { className: "text-xl font-bold text-gray-900" }, carbsGrams, React.createElement("span", { className: "text-base text-gray-600" }, "g"))
            ),
            React.createElement("div", null,
              React.createElement("p", { className: "text-xs uppercase text-gray-500 font-medium" }, "Fats"),
              React.createElement("p", { className: "text-xl font-bold text-gray-900" }, fatGrams, React.createElement("span", { className: "text-base text-gray-600" }, "g"))
            )
          )
        )
      ),

      /* Action Buttons */
      React.createElement("div", { className: "flex justify-between items-center max-w-4xl mx-auto mt-8 py-4 border-t border-gray-200" },
        React.createElement("button", {
          onClick: handleResetToDefaults,
          className: "text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-200"
        },
          "Recalculate from my profile"
        ),
        React.createElement(Button, { variant: "primary", onClick: handleUpdateGoals, disabled: saving, className: "py-2 px-6 text-md" },
          saving ? "Saving..." : "Update All Goals"
        )
      )
    )
  );
};

export default GoalsPage;