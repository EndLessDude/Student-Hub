import React, { useState } from 'react'
import { Trash2, Edit2, X } from 'lucide-react'

// ─── Checkbox ────────────────────────────────────────────────
interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, className = '' }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
      checked
        ? 'bg-blue-500 border-blue-500 hover:bg-blue-600'
        : 'border-gray-300 hover:border-blue-400 bg-white'
    } ${className}`}
    aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
  >
    {checked && (
      <svg className="w-3 h-3 text-white" viewBox="0 0 12 10" fill="none">
        <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </button>
)

// ─── Badge ────────────────────────────────────────────────────
type BadgeVariant = 'blue' | 'red' | 'gray' | 'green' | 'orange'

const badgeStyles: Record<BadgeVariant, string> = {
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
  green: 'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
}

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'gray', className = '' }) => (
  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeStyles[variant]} ${className}`}>
    {label}
  </span>
)

// ─── ProgressBar ──────────────────────────────────────────────
interface ProgressBarProps {
  value: number
  showLabel?: boolean
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, showLabel = true, className = '' }) => (
  <div className={className}>
    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
      <div
        className="bg-blue-500 h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
    {showLabel && (
      <p className="text-xs text-gray-500 mt-1">{Math.round(value)}% complete</p>
    )}
  </div>
)

// ─── EmptyState ───────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div className="mb-4 text-gray-300">{icon}</div>}
    <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 max-w-xs mb-6">{description}</p>
    {action && (
      <button onClick={action.onClick} className="btn-primary text-sm">
        {action.label}
      </button>
    )}
  </div>
)

// ─── ViewToggle ───────────────────────────────────────────────
interface ViewToggleProps {
  views: Array<{ id: string; label: string }>
  active: string
  onChange: (id: string) => void
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ views, active, onChange }) => (
  <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
    {views.map((v) => (
      <button
        key={v.id}
        onClick={() => onChange(v.id)}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          active === v.id
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {v.label}
      </button>
    ))}
  </div>
)

// ─── ActionButtons ────────────────────────────────────────────
interface ActionButtonsProps {
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onEdit, onDelete, className = '' }) => (
  <div className={`flex gap-1 ${className}`}>
    {onEdit && (
      <button
        onClick={onEdit}
        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
        title="Edit"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    )}
    {onDelete && (
      <button
        onClick={onDelete}
        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )}
  </div>
)

// ─── Tabs ─────────────────────────────────────────────────────
interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab }) => {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id)

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-6 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              active === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  )
}

// ─── ConfirmDialog ────────────────────────────────────────────
interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}