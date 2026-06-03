import React, { useState } from 'react'
import { ChevronRight, Download, Upload, Trash2, RotateCcw } from 'lucide-react'
import { Tabs } from '../components/Shared'

const Settings: React.FC = () => {
  const [theme, setTheme] = useState('light')
  const [fontSize, setFontSize] = useState('normal')
  const [cardDensity, setCardDensity] = useState('comfortable')
  const [notifications, setNotifications] = useState({
    reminders: true,
    exams: true,
    browser: false,
  })

  const themeOptions = [
    { id: 'light', label: 'Light', colors: 'bg-white border-gray-300' },
    { id: 'deep-focus', label: 'Deep Focus', colors: 'bg-blue-900' },
    { id: 'cool-dark', label: 'Cool Dark', colors: 'bg-slate-900' },
    { id: 'warm-dark', label: 'Warm Dark', colors: 'bg-amber-900' },
    { id: 'bright-focus', label: 'Bright Focus', colors: 'bg-yellow-50' },
  ]

  const tabs = [
    {
      id: 'appearance',
      label: 'Appearance',
      content: (
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Theme Preset</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {themeOptions.map(themeOption => (
                <button
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    theme === themeOption.id
                      ? 'border-blue-500 ring-2 ring-blue-300'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`w-full h-12 rounded-md mb-2 border ${themeOption.colors}`} />
                  <p className="text-xs font-medium text-gray-900">{themeOption.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Font Size</h3>
            <div className="flex gap-3">
              {[
                { id: 'small', label: 'Small' },
                { id: 'normal', label: 'Normal' },
                { id: 'large', label: 'Large' },
              ].map(size => (
                <button
                  key={size.id}
                  onClick={() => setFontSize(size.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    fontSize === size.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card Density */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Card Density</h3>
            <div className="space-y-3">
              {[
                { id: 'compact', label: 'Compact' },
                { id: 'comfortable', label: 'Comfortable' },
                { id: 'spacious', label: 'Spacious' },
              ].map(density => (
                <label key={density.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="density"
                    value={density.id}
                    checked={cardDensity === density.id}
                    onChange={() => setCardDensity(density.id)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-gray-900">{density.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'account',
      label: 'Account',
      content: (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Signed in as</p>
            <p className="font-semibold text-gray-900">student@university.edu</p>
          </div>

          <div className="space-y-3">
            <button className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition-colors">
              Change Password
            </button>
            <button className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition-colors">
              Two-Factor Authentication
            </button>
            <button className="w-full py-3 px-4 border border-red-300 rounded-lg text-red-600 font-medium hover:bg-red-50 transition-colors">
              Sign Out
            </button>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">Delete Account</h4>
            <p className="text-sm text-red-700 mb-4">
              Permanently delete your account and all associated data.
            </p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      content: (
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.reminders}
              onChange={() => setNotifications({ ...notifications, reminders: !notifications.reminders })}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Reminder Alerts</p>
              <p className="text-sm text-gray-600">Get notified when reminders are due</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.exams}
              onChange={() => setNotifications({ ...notifications, exams: !notifications.exams })}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Exam Alerts</p>
              <p className="text-sm text-gray-600">Get notified about upcoming exams</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.browser}
              onChange={() => setNotifications({ ...notifications, browser: !notifications.browser })}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Browser Notifications</p>
              <p className="text-sm text-gray-600">Enable desktop notifications</p>
            </div>
          </label>
        </div>
      ),
    },
    {
      id: 'data',
      label: 'Data Management',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Export Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download all your data as a JSON file.
            </p>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Import Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a JSON file to import data.
            </p>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Upload className="w-4 h-4" />
              Import JSON
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Maintenance</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors">
                <Trash2 className="w-4 h-4 text-orange-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium">Clear Completed Items</p>
                  <p className="text-xs text-gray-600">Remove completed items</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium">Archive Completed Items</p>
                  <p className="text-xs text-gray-600">Move completed items to archive</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <Tabs tabs={tabs} defaultTab="appearance" />
      </div>
    </div>
  )
}

export default Settings