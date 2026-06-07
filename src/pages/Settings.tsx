import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Download, Trash2, RotateCcw, LogOut, AlertTriangle, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSettings } from '../contexts/SettingsContext'
import { useCollection } from '../hooks/useCollection'
import { Assignment, Exam, Reminder, UserSettings, CLASS_COLORS } from '../types'
import { Tabs, ConfirmDialog } from '../components/Shared'

const themeOptions = [
  { id: 'light', label: 'Light', cls: 'bg-white border-gray-300' },
  { id: 'deep-focus', label: 'Deep Focus', cls: 'bg-blue-950' },
  { id: 'cool-dark', label: 'Cool Dark', cls: 'bg-slate-900' },
  { id: 'warm-dark', label: 'Warm Dark', cls: 'bg-amber-950' },
  { id: 'bright-focus', label: 'Bright Focus', cls: 'bg-yellow-50 border-gray-300' },
]

const Settings: React.FC = () => {
  const { currentUser, logout } = useAuth()
  const { settings, saveSettings } = useSettings()
  const navigate = useNavigate()

  const { items: assignments } = useCollection<Assignment>('assignments')
  const { items: exams } = useCollection<Exam>('exams')
  const { items: reminders } = useCollection<Reminder>('reminders')

  const [pending, setPending] = useState<UserSettings>(settings)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  useEffect(() => {
    setPending(settings)
  }, [settings])

  const update = (patch: Partial<UserSettings>) => {
    const next = { ...pending, ...patch }
    setPending(next)
    setHasChanges(JSON.stringify(next) !== JSON.stringify(settings))
    setSaved(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await saveSettings(pending)
      setHasChanges(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleExport = () => {
    const data = { assignments, exams, reminders, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `studenthub-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabs = [
    {
      id: 'appearance',
      label: 'Appearance',
      content: (
        <div className="space-y-7">
          {/* Theme */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Theme</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {themeOptions.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update({ theme: t.id })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    pending.theme === t.id ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-10 rounded-lg mb-2 border ${t.cls}`} />
                  <p className="text-xs font-medium text-gray-700">{t.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Accent Color</h3>
            <div className="flex gap-2 flex-wrap">
              {CLASS_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => update({ ...pending })}
                  className="w-7 h-7 rounded-full hover:scale-110 transition-all"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Font size */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Font Size</h3>
            <div className="flex gap-2">
              {[
                { id: 'small', label: 'Small', example: 'Aa', size: 'text-xs' },
                { id: 'normal', label: 'Normal', example: 'Aa', size: 'text-sm' },
                { id: 'large', label: 'Large', example: 'Aa', size: 'text-base' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => update({ fontSize: s.id })}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 text-center transition-all ${
                    pending.fontSize === s.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`font-semibold text-gray-900 ${s.size}`}>{s.example}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Card density */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Card Density</h3>
            <div className="space-y-2">
              {[
                { id: 'compact', label: 'Compact', desc: 'Tighter spacing, more content visible' },
                { id: 'comfortable', label: 'Comfortable', desc: 'Balanced spacing (default)' },
                { id: 'spacious', label: 'Spacious', desc: 'More breathing room' },
              ].map((d) => (
                <label key={d.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="density"
                    checked={pending.density === d.id}
                    onChange={() => update({ density: d.id })}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{d.label}</p>
                    <p className="text-xs text-gray-500">{d.desc}</p>
                  </div>
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
        <div className="space-y-5">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-1">Signed in as</p>
            <p className="font-semibold text-gray-900">{currentUser?.email}</p>
          </div>

          <button
            onClick={() => setLogoutDialogOpen(true)}
            className="w-full flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium flex-1 text-left">Sign out</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-900">Danger Zone</h4>
                <p className="text-xs text-red-700 mt-0.5">These actions are permanent and cannot be undone.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors">
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
        <div className="space-y-3">
          {[
            { key: 'reminders' as const, label: 'Reminder Alerts', desc: 'Get notified when reminders are due' },
            { key: 'exams' as const, label: 'Exam Alerts', desc: 'Get notified about upcoming exams' },
            { key: 'browser' as const, label: 'Browser Notifications', desc: 'Enable desktop push notifications' },
          ].map((n) => (
            <label key={n.key} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={pending.notifications[n.key]}
                onChange={() => update({ notifications: { ...pending.notifications, [n.key]: !pending.notifications[n.key] } })}
                className="w-4 h-4 accent-blue-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{n.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
              </div>
            </label>
          ))}
        </div>
      ),
    },
    {
      id: 'data',
      label: 'Data',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Export Data</h3>
            <p className="text-xs text-gray-500 mb-3">Download all your assignments, exams, and reminders as JSON.</p>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
              <Download className="w-4 h-4" /> Export JSON
            </button>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Maintenance</h3>
            <button className="w-full flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              <Trash2 className="w-4 h-4 text-orange-500" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Clear Completed Items</p>
                <p className="text-xs text-gray-500">Remove all completed items</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              <RotateCcw className="w-4 h-4 text-blue-500" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Reset Settings</p>
                <p className="text-xs text-gray-500">Restore all settings to defaults</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : hasChanges
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {hasChanges && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          You have unsaved changes. Click "Save Changes" to apply them.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <Tabs tabs={tabs} defaultTab="appearance" />
      </div>

      <ConfirmDialog
        isOpen={logoutDialogOpen}
        title="Sign out"
        message="Are you sure you want to sign out of StudentHub?"
        confirmLabel="Sign out"
        onConfirm={handleLogout}
        onCancel={() => setLogoutDialogOpen(false)}
      />
    </div>
  )
}

export default Settings