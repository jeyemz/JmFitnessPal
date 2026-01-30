import React, { useState } from 'react';
import Button from './Button.js';
import NavLink from './NavLink.js';
import { authAPI } from '../services/api.js';

const SignUpPage = ({ onNavigate, onSignUpSuccess }) => {
  const [step, setStep] = useState(0);
  const [preferredName, setPreferredName] = useState('');
  const [goals, setGoals] = useState([]);
  const [barriers, setBarriers] = useState([]);
  const [activityLevel, setActivityLevel] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 'welcome', title: 'Welcome', subtitle: "Let's get to know you." },
    { id: 'goals', title: 'Goals', subtitle: 'Pick up to three goals.' },
    { id: 'habits', title: 'Habits', subtitle: 'Tell us about barriers and activity.' },
    { id: 'stats', title: 'You', subtitle: 'Add your height and weight.' },
    { id: 'account', title: 'Account', subtitle: 'Create your login details.' },
    { id: 'summary', title: 'Account Created', subtitle: 'Your custom plan is ready.' },
  ];

  const goalOptions = [
    'Lose weight',
    'Maintain weight',
    'Gain weight',
    'Gain muscle',
    'Modify my diet',
    'Plan meals',
    'Manage stress',
  ];

  const barrierOptions = [
    'Lack of time',
    'The regimen was hard to follow',
    'Healthy diets lack variety',
    'Food cravings',
  ];

  const activityOptions = [
    { id: 'not-active', label: 'Not Very Active', description: 'Spend most of the day sitting.' },
    { id: 'lightly-active', label: 'Lightly Active', description: 'Spend a good part of the day on your feet.' },
    { id: 'active', label: 'Active', description: 'Spend a good part of the day moving.' },
    { id: 'very-active', label: 'Very Active', description: 'Spend a good part of the day doing heavy activity.' },
  ];

  const isLastStep = step === steps.length - 1;
  const canProceed = () => {
    if (step === 0) return preferredName.trim().length > 0;
    if (step === 1) return goals.length > 0;
    if (step === 2) return activityLevel.length > 0;
    if (step === 3) return heightFeet && heightInches && currentWeight && goalWeight;
    if (step === 4) {
      return email.trim().length > 0 && password.trim().length > 0 && confirmPassword.trim().length > 0 && password === confirmPassword;
    }
    if (step === 5) return true;
    return false;
  };

  const toggleSelection = (value, items, setter, max) => {
    if (items.includes(value)) {
      setter(items.filter((item) => item !== value));
      return;
    }
    if (max && items.length >= max) {
      return;
    }
    setter([...items, value]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isLastStep) {
      if (step === 4 && password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      
      // On step 4 (account creation), call the API to register
      if (step === 4 && canProceed()) {
        setIsSubmitting(true);
        try {
          const response = await authAPI.register({
            email: email,
            password: password,
            firstName: preferredName,
            lastName: preferredName, // Using preferredName as last name for simplicity
            nickname: preferredName
          });
          
          // Store user data with calculated goals
          const userData = {
            ...response.user,
            goals: {
              dailyCalorieGoal: dailyCalories,
              proteinGoal: Math.round(dailyCalories * 0.3 / 4), // 30% from protein
              carbsGoal: Math.round(dailyCalories * 0.4 / 4), // 40% from carbs
              fatGoal: Math.round(dailyCalories * 0.3 / 9) // 30% from fat
            }
          };
          
          // Move to summary step
          setStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
        } catch (err) {
          setError(err.message || 'Registration failed. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
        return;
      }
      
      if (canProceed()) {
        setStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
      }
      return;
    }
    
    // On last step, complete signup
    const userData = authAPI.getStoredUser();
    if (userData) {
      userData.goals = {
        dailyCalorieGoal: dailyCalories,
        proteinGoal: Math.round(dailyCalories * 0.3 / 4),
        carbsGoal: Math.round(dailyCalories * 0.4 / 4),
        fatGoal: Math.round(dailyCalories * 0.3 / 9)
      };
      onSignUpSuccess(userData);
    } else {
      onSignUpSuccess({ nickname: preferredName });
    }
  };

  const calculateDailyCalories = () => {
    const weightValue = parseFloat(currentWeight);
    if (!weightValue) {
      return 1800;
    }

    const activityMultipliers = {
      'not-active': 11,
      'lightly-active': 12,
      'active': 13,
      'very-active': 14,
    };

    const base = weightValue * (activityMultipliers[activityLevel] || 12);
    let adjustment = 0;

    if (goals.includes('Lose weight')) adjustment = -300;
    if (goals.includes('Gain weight') || goals.includes('Gain muscle')) adjustment = 250;

    return Math.max(1200, Math.round(base + adjustment));
  };

  const dailyCalories = calculateDailyCalories();

  return (
    React.createElement("section", { className: "flex items-center justify-center min-h-screen py-10 bg-gradient-to-br from-blue-50 to-white" },
      React.createElement("div", { className: "w-full max-w-2xl p-8 bg-white rounded-xl shadow-lg border border-gray-100 animate-fade-in-up" },
        React.createElement("div", { className: "mb-6" },
          React.createElement("div", { className: "flex items-center justify-between text-sm text-gray-500 mb-3" },
            React.createElement("span", null, "Step ", step + 1, " of ", steps.length),
            React.createElement("span", { className: "font-semibold text-blue-600" }, steps[step].title)
          ),
          React.createElement("div", { className: "grid grid-cols-6 gap-2 mb-5" },
            steps.map((item, index) => (
              React.createElement("div", {
                key: item.id,
                className: `h-2 rounded-full ${index <= step ? 'bg-blue-600' : 'bg-gray-200'}`
              })
            ))
          ),
          React.createElement("h2", { className: "text-3xl font-bold text-gray-900 text-center mb-2" },
            step === 5 ? "Congratulations!" : "Create Your Plan"
          ),
          React.createElement("p", { className: "text-center text-sm text-gray-500" },
            step === 5 ? `Your custom plan is ready, ${preferredName || 'there'}.` : steps[step].subtitle
          )
        ),
        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
          /* Error message */
          error && React.createElement("div", { 
            className: "p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center" 
          }, error),
          
          step === 0 && React.createElement("div", { className: "space-y-3" },
            React.createElement("label", { htmlFor: "preferredName", className: "block text-sm font-medium text-gray-700 mb-1" }, "Preferred first name"),
            React.createElement("input", {
              type: "text",
              id: "preferredName",
              name: "preferredName",
              value: preferredName,
              onChange: (e) => setPreferredName(e.target.value),
              required: true,
              className: "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
              "aria-label": "Preferred first name",
              placeholder: "Enter your name",
              autoFocus: true
            })
          ),
          step === 1 && React.createElement("div", { className: "space-y-4" },
            React.createElement("p", { className: "text-sm text-gray-500" }, "Select up to three goals that are most important to you."),
            React.createElement("div", { className: "grid grid-cols-1 gap-3" },
              goalOptions.map((goal) => (
                React.createElement("button", {
                  key: goal,
                  type: "button",
                  onClick: () => toggleSelection(goal, goals, setGoals, 3),
                  className: `w-full text-left px-4 py-3 rounded-xl border transition ${goals.includes(goal) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'}`
                },
                  React.createElement("span", { className: "font-semibold" }, goal),
                  goals.includes(goal) && React.createElement("span", { className: "float-right text-blue-600 font-semibold" }, "OK")
                )
              ))
            )
          ),
          step === 2 && React.createElement("div", { className: "space-y-6" },
            React.createElement("div", null,
              React.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, "Barriers to progress"),
              React.createElement("p", { className: "text-sm text-gray-500 mb-3" }, "Select all that apply."),
              React.createElement("div", { className: "grid grid-cols-1 gap-3" },
                barrierOptions.map((barrier) => (
                  React.createElement("button", {
                    key: barrier,
                    type: "button",
                    onClick: () => toggleSelection(barrier, barriers, setBarriers),
                    className: `w-full text-left px-4 py-3 rounded-xl border transition ${barriers.includes(barrier) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'}`
                  },
                    React.createElement("span", { className: "font-semibold" }, barrier),
                    barriers.includes(barrier) && React.createElement("span", { className: "float-right text-blue-600 font-semibold" }, "OK")
                  )
                ))
              )
            ),
            React.createElement("div", null,
              React.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, "Baseline activity level"),
              React.createElement("div", { className: "grid grid-cols-1 gap-3" },
                activityOptions.map((option) => (
                  React.createElement("button", {
                    key: option.id,
                    type: "button",
                    onClick: () => setActivityLevel(option.id),
                    className: `w-full text-left px-4 py-3 rounded-xl border transition ${activityLevel === option.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'}`
                  },
                    React.createElement("div", { className: "font-semibold" }, option.label),
                    React.createElement("div", { className: "text-xs text-gray-500 mt-1" }, option.description)
                  )
                ))
              )
            )
          ),
          step === 3 && React.createElement("div", { className: "space-y-5" },
            React.createElement("div", null,
              React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "How tall are you?"),
              React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                React.createElement("input", {
                  type: "text",
                  value: heightFeet,
                  onChange: (e) => setHeightFeet(e.target.value),
                  placeholder: "ft",
                  className: "block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                }),
                React.createElement("input", {
                  type: "text",
                  value: heightInches,
                  onChange: (e) => setHeightInches(e.target.value),
                  placeholder: "in",
                  className: "block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                })
              )
            ),
            React.createElement("div", null,
              React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "How much do you weigh?"),
              React.createElement("input", {
                type: "text",
                value: currentWeight,
                onChange: (e) => setCurrentWeight(e.target.value),
                placeholder: "kg",
                className: "block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              }),
              React.createElement("p", { className: "text-xs text-gray-500 mt-2" }, "It's okay to estimate, you can update later.")
            ),
            React.createElement("div", null,
              React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "What's your goal weight?"),
              React.createElement("input", {
                type: "text",
                value: goalWeight,
                onChange: (e) => setGoalWeight(e.target.value),
                placeholder: "kg",
                className: "block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              })
            )
          ),
          step === 4 && React.createElement("div", { className: "space-y-4" },
            React.createElement("div", null,
              React.createElement("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1" }, "Email"),
              React.createElement("input", {
                type: "email",
                id: "email",
                name: "email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                required: true,
                className: "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                "aria-label": "Email address"
              })
            ),
            React.createElement("div", null,
              React.createElement("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1" }, "Create a password"),
              React.createElement("input", {
                type: "password",
                id: "password",
                name: "password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                required: true,
                className: "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                "aria-label": "Password"
              })
            ),
            React.createElement("div", null,
              React.createElement("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium text-gray-700 mb-1" }, "Confirm password"),
              React.createElement("input", {
                type: "password",
                id: "confirmPassword",
                name: "confirmPassword",
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                required: true,
                className: "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                "aria-label": "Confirm password"
              })
            )
          ),
          step === 5 && React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 text-2xl font-bold" }, "OK"),
            React.createElement("div", { className: "rounded-2xl border border-gray-200 bg-gray-50 px-6 py-5 text-center" },
              React.createElement("p", { className: "text-xs uppercase tracking-widest text-gray-500" }, "Your daily net goal is"),
              React.createElement("div", { className: "mt-3 flex items-center justify-center gap-3" },
                React.createElement("span", { className: "text-4xl font-extrabold text-emerald-500" }, dailyCalories.toLocaleString()),
                React.createElement("span", { className: "text-sm font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700" }, "Calories")
              )
            )
          ),
          React.createElement("div", { className: "flex items-center gap-3" },
            React.createElement("button", {
              type: "button",
              onClick: () => setStep((prevStep) => Math.max(prevStep - 1, 0)),
              className: `px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 transition ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`
            }, "Back"),
            React.createElement(Button, {
              type: "submit",
              variant: "primary",
              className: "flex-1 py-2 text-lg",
              disabled: !canProceed() || isSubmitting
            }, isSubmitting ? "Creating Account..." : (isLastStep ? "Start Tracking" : "Next"))
          )
        ),
        step !== 5 && React.createElement("p", { className: "mt-6 text-center text-sm text-gray-600" },
          "Already have an account?", ' ',
          React.createElement(NavLink, { href: "#", onClick: () => onNavigate('login'), className: "font-semibold text-blue-600 hover:text-blue-700" },
            "Log In"
          )
        )
      )
    )
  );
};

export default SignUpPage;

