
import React, { useState, useEffect } from 'react';
import DashboardTopBar from '../components/dashboard/DashboardTopBar.js';
import Button from '../components/Button.js';
import NavLink from '../components/NavLink.js';
import { profileAPI, authAPI } from '../services/api.js';

// Build initial profile from stored user (e.g. height/weight from sign-up) so fields are pre-filled
const getInitialProfile = (user) => {
  if (!user) {
    return {
      firstName: '', lastName: '', nickname: '', email: '',
      heightCm: '', weightKg: '', dateOfBirth: '', gender: '', avatarUrl: '',
      dailyCalorieGoal: '2000'
    };
  }
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    nickname: user.nickname || '',
    email: user.email || '',
    heightCm: user.profile?.heightCm != null ? String(user.profile.heightCm) : '',
    weightKg: user.profile?.weightKg != null ? String(user.profile.weightKg) : '',
    dateOfBirth: '',
    gender: '',
    avatarUrl: user.avatar || '',
    dailyCalorieGoal: user.goals?.dailyCalorieGoal != null ? String(user.goals.dailyCalorieGoal) : '2000'
  };
};

const ProfilePage = ({ onNavigate, user, onUserUpdate, onLogout }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile form state – pre-fill from stored user (height/weight from sign-up)
  const [profile, setProfile] = useState(() => getInitialProfile(user));

  const genderOptions = [
    { value: '', label: 'Prefer not to say' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  // Pre-fill from stored user when user is set (height/weight from sign-up)
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        firstName: user.firstName ?? prev.firstName,
        lastName: user.lastName ?? prev.lastName,
        nickname: user.nickname ?? prev.nickname,
        email: user.email ?? prev.email,
        heightCm: user.profile?.heightCm != null ? String(user.profile.heightCm) : prev.heightCm,
        weightKg: user.profile?.weightKg != null ? String(user.profile.weightKg) : prev.weightKg,
        dailyCalorieGoal: user.goals?.dailyCalorieGoal != null ? String(user.goals.dailyCalorieGoal) : prev.dailyCalorieGoal
      }));
    }
  }, [user?.id]);

  // Fetch full profile from API on mount (overwrites with server data including height/weight from DB)
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
            heightCm: p.heightCm != null && p.heightCm !== '' ? String(p.heightCm) : (user?.profile?.heightCm != null ? String(user.profile.heightCm) : ''),
            weightKg: p.weightKg != null && p.weightKg !== '' ? String(p.weightKg) : (user?.profile?.weightKg != null ? String(user.profile.weightKg) : ''),
            dateOfBirth: p.dateOfBirth || '',
            gender: p.gender || '',
            avatarUrl: p.avatarUrl || '',
            dailyCalorieGoal: p.dailyCalorieGoal != null ? String(p.dailyCalorieGoal) : (user?.goals?.dailyCalorieGoal != null ? String(user.goals.dailyCalorieGoal) : '2000')
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        if (user) {
          setProfile(prev => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            nickname: user.nickname || '',
            email: user.email || '',
            heightCm: user.profile?.heightCm != null ? String(user.profile.heightCm) : prev.heightCm,
            weightKg: user.profile?.weightKg != null ? String(user.profile.weightKg) : prev.weightKg,
            dailyCalorieGoal: user.goals?.dailyCalorieGoal != null ? String(user.goals.dailyCalorieGoal) : '2000'
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
        avatarUrl: profile.avatarUrl,
        dailyCalorieGoal: profile.dailyCalorieGoal ? parseInt(profile.dailyCalorieGoal, 10) : null
      });

      setMessage({ type: 'success', text: 'Profile saved successfully!' });

      // Update the user data in parent if callback provided
      if (onUserUpdate) {
        const updatedUser = {
          ...user,
          firstName: profile.firstName,
          lastName: profile.lastName,
          nickname: profile.nickname,
          goals: {
            ...(user?.goals || {}),
            dailyCalorieGoal: profile.dailyCalorieGoal ? parseInt(profile.dailyCalorieGoal, 10) : (user?.goals?.dailyCalorieGoal || 2000)
          }
        };
        onUserUpdate(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      const text = error?.message && !error.message.includes('fetch') ? error.message : 'Failed to save profile. Please try again.';
      setMessage({ type: 'error', text });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
      try {
        await profileAPI.deactivateAccount();
        await authAPI.logout();
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
      React.createElement(DashboardTopBar, { title: "Profile Settings", showSearchBar: false, user: user, onLogout: onLogout }),

      React.createElement("div", { className: "max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-100 mb-8" },
        
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
          /* Avatar + Top fields row */
          React.createElement("div", { className: "flex flex-col lg:flex-row lg:items-start gap-8 mb-6" },
          /* Avatar Section */
          React.createElement("div", { className: "flex flex-col items-center lg:flex-shrink-0" },
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
          /* Right: Name, Nickname, DOB, Gender */
          React.createElement("div", { className: "flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6" },
            React.createElement("div", null,
              React.createElement("label", { htmlFor: "firstName", className: "block text-sm font-medium text-gray-700 mb-1" }, "First Name"),
              React.createElement("input", {
                type: "text", id: "firstName", value: profile.firstName,
                onChange: (e) => handleInputChange('firstName', e.target.value),
                className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none",
                placeholder: "Enter first name"
              })
            ),
            React.createElement("div", null,
              React.createElement("label", { htmlFor: "lastName", className: "block text-sm font-medium text-gray-700 mb-1" }, "Last Name"),
              React.createElement("input", {
                type: "text", id: "lastName", value: profile.lastName,
                onChange: (e) => handleInputChange('lastName', e.target.value),
                className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none",
                placeholder: "Enter last name"
              })
            ),
            React.createElement("div", { className: "sm:col-span-2" },
              React.createElement("label", { htmlFor: "nickname", className: "block text-sm font-medium text-gray-700 mb-1" }, "Nickname (Display Name)"),
              React.createElement("input", {
                type: "text", id: "nickname", value: profile.nickname,
                onChange: (e) => handleInputChange('nickname', e.target.value),
                className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none",
                placeholder: "Enter your display name"
              })
            ),
            React.createElement("div", null,
              React.createElement("label", { htmlFor: "dateOfBirth", className: "block text-sm font-medium text-gray-700 mb-1" }, "Date of Birth"),
              React.createElement("input", {
                type: "date", id: "dateOfBirth", value: profile.dateOfBirth,
                onChange: (e) => handleInputChange('dateOfBirth', e.target.value),
                className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none"
              })
            ),
            React.createElement("div", null,
              React.createElement("label", { htmlFor: "gender", className: "block text-sm font-medium text-gray-700 mb-1" }, "Gender"),
              React.createElement("select", {
                id: "gender", value: profile.gender,
                onChange: (e) => handleInputChange('gender', e.target.value),
                className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none bg-white"
              },
                genderOptions.map(opt => React.createElement("option", { key: opt.value, value: opt.value }, opt.label))
              )
            )
          )
          ),

          /* Second row: Email, Calorie, Height, Weight */
          React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6" },
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
          React.createElement("div", null,
            React.createElement("label", { htmlFor: "dailyCalorieGoal", className: "block text-sm font-medium text-gray-700 mb-1" }, "Daily calorie goal"),
            React.createElement("input", {
              type: "number", id: "dailyCalorieGoal", value: profile.dailyCalorieGoal,
              onChange: (e) => handleInputChange('dailyCalorieGoal', e.target.value),
              className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none",
              placeholder: "e.g. 2000", min: "1000", max: "10000", step: "50"
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { htmlFor: "height", className: "block text-sm font-medium text-gray-700 mb-1" }, "Height (cm)"),
            React.createElement("input", {
              type: "number", id: "height", value: profile.heightCm,
              onChange: (e) => handleInputChange('heightCm', e.target.value),
              className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none",
              placeholder: "e.g., 175", min: "0", step: "0.1"
            })
          ),
          React.createElement("div", null,
            React.createElement("label", { htmlFor: "weight", className: "block text-sm font-medium text-gray-700 mb-1" }, "Weight (kg)"),
            React.createElement("input", {
              type: "number", id: "weight", value: profile.weightKg,
              onChange: (e) => handleInputChange('weightKg', e.target.value),
              className: "block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none",
              placeholder: "e.g., 70", min: "0", step: "0.1"
            })
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
