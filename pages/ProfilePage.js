
import React, { useState, useEffect } from 'react';
import DashboardTopBar from '../components/dashboard/DashboardTopBar.js';
import Button from '../components/Button.js';
import NavLink from '../components/NavLink.js';
import { profileAPI, authAPI } from '../services/api.js';

const ProfilePage = ({ onNavigate, user, onUserUpdate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile form state
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    heightCm: '',
    weightKg: '',
    dateOfBirth: '',
    gender: '',
    activityLevel: 'moderate',
    dietaryPreference: '',
    avatarUrl: ''
  });

  const dietaryOptions = [
    'No Preference',
    'Vegetarian',
    'Vegan',
    'Pescatarian',
    'Keto',
    'Paleo',
    'Low Carb',
    'Low Fat',
    'Mediterranean',
    'Gluten Free',
    'Dairy Free'
  ];

  const activityOptions = [
    { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
    { value: 'light', label: 'Light (exercise 1-3 days/week)' },
    { value: 'moderate', label: 'Moderate (exercise 3-5 days/week)' },
    { value: 'active', label: 'Active (exercise 6-7 days/week)' },
    { value: 'very_active', label: 'Very Active (hard exercise daily)' }
  ];

  const genderOptions = [
    { value: '', label: 'Prefer not to say' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await profileAPI.getProfile();
        if (response.profile) {
          const p = response.profile;
          setProfile({
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            nickname: p.nickname || '',
            email: p.email || '',
            heightCm: p.heightCm || '',
            weightKg: p.weightKg || '',
            dateOfBirth: p.dateOfBirth || '',
            gender: p.gender || '',
            activityLevel: p.activityLevel || 'moderate',
            dietaryPreference: p.dietaryPreference || 'No Preference',
            avatarUrl: p.avatarUrl || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Try to use stored user data as fallback
        if (user) {
          setProfile(prev => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            nickname: user.nickname || '',
            email: user.email || ''
          }));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await profileAPI.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        nickname: profile.nickname,
        heightCm: profile.heightCm ? parseFloat(profile.heightCm) : null,
        weightKg: profile.weightKg ? parseFloat(profile.weightKg) : null,
        dateOfBirth: profile.dateOfBirth || null,
        gender: profile.gender || null,
        activityLevel: profile.activityLevel,
        dietaryPreference: profile.dietaryPreference,
        avatarUrl: profile.avatarUrl
      });

      setMessage({ type: 'success', text: 'Profile saved successfully!' });

      // Update the user data in parent if callback provided
      if (onUserUpdate) {
        const updatedUser = {
          ...user,
          firstName: profile.firstName,
          lastName: profile.lastName,
          nickname: profile.nickname
        };
        onUserUpdate(updatedUser);
        // Also update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
      try {
        await profileAPI.deactivateAccount();
        authAPI.logout();
        onNavigate('home');
      } catch (error) {
        console.error('Failed to deactivate account:', error);
        setMessage({ type: 'error', text: 'Failed to deactivate account. Please try again.' });
      }
    }
  };

  const getInitials = () => {
    const first = profile.firstName?.charAt(0) || '';
    const last = profile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || profile.nickname?.charAt(0)?.toUpperCase() || '?';
  };

  if (isLoading) {
    return (
      React.createElement("div", { className: "flex-1 p-6 overflow-auto min-h-screen flex items-center justify-center" },
        React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" })
      )
    );
  }

  return (
    React.createElement("div", { className: "flex-1 p-6 overflow-auto min-h-screen" },
      /* Header Section */
      React.createElement(DashboardTopBar, { title: "Profile Settings", showSearchBar: false }),

      React.createElement("div", { className: "max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-100 mb-8" },
        
        /* Success/Error Message */
        message.text && (
          React.createElement("div", { 
            className: `mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`
          },
            message.text
          )
        ),

        React.createElement("form", { onSubmit: handleSaveProfile, className: "space-y-6" },
          /* Avatar Section */
          React.createElement("div", { className: "flex flex-col items-center mb-8" },
            React.createElement("div", { 
              className: "w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-4 border-white shadow-md"
            },
              profile.avatarUrl ? (
                React.createElement("img", { 
                  src: profile.avatarUrl, 
                  alt: "User avatar", 
                  className: "w-full h-full object-cover" 
                })
              ) : (
                React.createElement("span", { className: "text-3xl font-bold text-white" }, getInitials())
              )
            ),
            React.createElement("p", { className: "text-gray-500 mt-3 text-sm" },
              profile.email
            )
          ),

          /* Name Fields */
          React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6" },
            /* First Name */
            React.createElement("div", null,
              React.createElement("label", { htmlFor: "firstName", className: "block text-sm font-medium text-gray-700 mb-1" },
                "First Name"
              ),
              React.createElement("input", {
                type: "text",
                id: "firstName",
                value: profile.firstName,
                onChange: (e) => handleInputChange('firstName', e.target.value),
                className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none",
                placeholder: "Enter first name"
              })
            ),
            /* Last Name */
            React.createElement("div", null,
              React.createElement("label", { htmlFor: "lastName", className: "block text-sm font-medium text-gray-700 mb-1" },
                "Last Name"
              ),
              React.createElement("input", {
                type: "text",
                id: "lastName",
                value: profile.lastName,
                onChange: (e) => handleInputChange('lastName', e.target.value),
                className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none",
                placeholder: "Enter last name"
              })
            )
          ),

          /* Nickname */
          React.createElement("div", null,
            React.createElement("label", { htmlFor: "nickname", className: "block text-sm font-medium text-gray-700 mb-1" },
              "Nickname (Display Name)"
            ),
            React.createElement("input", {
              type: "text",
              id: "nickname",
              value: profile.nickname,
              onChange: (e) => handleInputChange('nickname', e.target.value),
              className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none",
              placeholder: "Enter your display name"
            })
          ),

          /* Email (Read-only) */
          React.createElement("div", null,
            React.createElement("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1" },
              "Email Address"
            ),
            React.createElement("input", {
              type: "email",
              id: "email",
              className: "block w-full px-4 py-2 text-gray-500 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed",
              value: profile.email,
              readOnly: true
            }),
            React.createElement("p", { className: "text-xs text-gray-500 mt-1" },
              "Email cannot be changed"
            )
          ),

          /* Date of Birth and Gender */
          React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6" },
            /* Date of Birth */
            React.createElement("div", null,
              React.createElement("label", { htmlFor: "dateOfBirth", className: "block text-sm font-medium text-gray-700 mb-1" },
                "Date of Birth"
              ),
              React.createElement("input", {
                type: "date",
                id: "dateOfBirth",
                value: profile.dateOfBirth,
                onChange: (e) => handleInputChange('dateOfBirth', e.target.value),
                className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none"
              })
            ),
            /* Gender */
            React.createElement("div", null,
              React.createElement("label", { htmlFor: "gender", className: "block text-sm font-medium text-gray-700 mb-1" },
                "Gender"
              ),
              React.createElement("select", {
                id: "gender",
                value: profile.gender,
                onChange: (e) => handleInputChange('gender', e.target.value),
                className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none bg-white"
              },
                genderOptions.map(opt => (
                  React.createElement("option", { key: opt.value, value: opt.value }, opt.label)
                ))
              )
            )
          ),

          /* Height and Weight */
          React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6" },
            React.createElement("div", null,
              React.createElement("label", { htmlFor: "height", className: "block text-sm font-medium text-gray-700 mb-1" },
                "Height (cm)"
              ),
              React.createElement("input", {
                type: "number",
                id: "height",
                value: profile.heightCm,
                onChange: (e) => handleInputChange('heightCm', e.target.value),
                className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none",
                placeholder: "e.g., 175",
                min: "0",
                step: "0.1"
              })
            ),
            React.createElement("div", null,
              React.createElement("label", { htmlFor: "weight", className: "block text-sm font-medium text-gray-700 mb-1" },
                "Weight (kg)"
              ),
              React.createElement("input", {
                type: "number",
                id: "weight",
                value: profile.weightKg,
                onChange: (e) => handleInputChange('weightKg', e.target.value),
                className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none",
                placeholder: "e.g., 70",
                min: "0",
                step: "0.1"
              })
            )
          ),

          /* Activity Level */
          React.createElement("div", null,
            React.createElement("label", { htmlFor: "activityLevel", className: "block text-sm font-medium text-gray-700 mb-1" },
              "Activity Level"
            ),
            React.createElement("select", {
              id: "activityLevel",
              value: profile.activityLevel,
              onChange: (e) => handleInputChange('activityLevel', e.target.value),
              className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none bg-white"
            },
              activityOptions.map(opt => (
                React.createElement("option", { key: opt.value, value: opt.value }, opt.label)
              ))
            )
          ),

          /* Dietary Preference */
          React.createElement("div", null,
            React.createElement("label", { htmlFor: "dietaryPreference", className: "block text-sm font-medium text-gray-700 mb-1" },
              "Dietary Preference"
            ),
            React.createElement("select", {
              id: "dietaryPreference",
              value: profile.dietaryPreference,
              onChange: (e) => handleInputChange('dietaryPreference', e.target.value),
              className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none bg-white"
            },
              dietaryOptions.map((pref) => (
                React.createElement("option", { key: pref, value: pref }, pref)
              ))
            )
          ),

          /* Save Button */
          React.createElement("div", { className: "pt-6" },
            React.createElement(Button, { 
              type: "submit", 
              variant: "primary", 
              className: "w-full py-2.5 text-lg",
              disabled: isSaving
            },
              isSaving ? "Saving..." : "Save Profile"
            )
          )
        ),

        /* Deactivate Account */
        React.createElement("div", { className: "mt-8 pt-6 border-t border-gray-200 text-center" },
          React.createElement("p", { className: "text-sm text-gray-500 mb-2" },
            "Want to deactivate your account?"
          ),
          React.createElement(NavLink, { 
            href: "#", 
            onClick: handleDeactivateAccount, 
            className: "text-red-600 hover:text-red-700 font-semibold" 
          },
            "Deactivate Account"
          )
        )
      ),

      /* Footer / Copyright */
      React.createElement("footer", { className: "text-sm text-gray-500 mt-8 text-center" },
        "© ", new Date().getFullYear(), " JmFitnessPal"
      )
    )
  );
};

export default ProfilePage;
