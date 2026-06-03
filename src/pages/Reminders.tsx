import React, { useState } from 'react'
import { Plus, Bell, ChevronDown } from 'lucide-react'
import { useCollection } from '../hooks/useCollection'
import { Reminder } from '../types'
import { formatDateTime, formatTime } from '../utils'
import { Checkbox, ViewToggle, Badge, ActionButtons, EmptyState, ConfirmDialog } from '../components/Shared'
import ReminderModal from '../components/modals/ReminderModal'

type Filter = 'all' | 'pending' | 'completed'
type View = 'list' | 'calendar'

const repeatLabel: Record<string, string> = {
  none: '',
  daily: 'Daily',
  weekly: 'Weekly',
  custom: 'Custom',
}

const Reminders: React.FC = () => {
  const { items, loading, addItem, updateItem, deleteItem } = useCollection<Reminder>('reminders')

  const [view, setView] = useState<View>('list')
  const [filter, setFilter] = useState<Filter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Reminder | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = items.filter((r) => {
    if (filter === 'pending') return !r.completed
    if (filter === 'completed') return r.completed
    return true
  })

  const sorted = [...filtered].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  )

  const handleSave = async (data: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      await updateItem(editingItem.id, data)
    } else {
      await addItem(data)
    }
  }

  const openAdd = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Reminder
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(['all', 'pending', 'completed'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <ViewToggle
          views={[
            { id: 'list', label: 'List' },
            { id: 'calendar', label: 'Calendar' },
          ]}
          active={view}
          onChange={(v) => setView(v as View)}
        />
      </div>

      {/* Content */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-10 h-10" />}
          title="No reminders yet"
          description="Click 'New Reminder' to add a time-based alert."
          action={{ label: 'Add Reminder', onClick: openAdd }}
        />
      ) : view === 'list' ? (
        <div className="space-y-2">
          {sorted.map((reminder) => {
            const isExpanded = expandedId === reminder.id
            const isPast = new Date(reminder.dateTime) < new Date() && !reminder.completed

            return (
              <div
                key={reminder.id}
                className={`bg-white rounded-xl border transition-shadow ${
                  isExpanded ? 'border-orange-200 shadow-md' : 'border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <Checkbox
                    checked={reminder.completed}
                    onChange={() => updateItem(reminder.id, { completed: !reminder.completed })}
                  />

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : reminder.id)}
                    className="flex-1 text-left flex items-center gap-3 min-w-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${reminder.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {reminder.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-xs ${isPast ? 'text-orange-500 font-medium' : 'text-gray-400'}`}>
                          {formatDateTime(reminder.dateTime)}
                        </span>
                        {reminder.repeatRule !== 'none' && (
                          <Badge label={repeatLabel[reminder.repeatRule]} variant="gray" />
                        )}
                        {isPast && <Badge label="Past due" variant="orange" />}
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <ActionButtons
                    onEdit={() => { setEditingItem(reminder); setModalOpen(true) }}
                    onDelete={() => setDeletingId(reminder.id)}
                  />
                </div>

                {isExpanded && reminder.notes && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 ml-8">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{reminder.notes}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <ReminderCalendar reminders={sorted} />
      )}

      <ReminderModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSave={handleSave}
        initial={editingItem}
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder?"
        confirmLabel="Delete"
        danger
        onConfirm={async () => { if (deletingId) { await deleteItem(deletingId); setDeletingId(null) } }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}

// ─── Calendar View ────────────────────────────────────────────
const ReminderCalendar: React.FC<{ reminders: Reminder[] }> = ({ reminders }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDOW = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const pad = (n: number) => String(n).padStart(2, '0')
  const dayStr = (d: number) => `${year}-${pad(month + 1)}-${pad(d)}`

  const calCells: (number | null)[] = [...Array(firstDOW).fill(null)]
  for (let i = 1; i <= daysInMonth; i++) calCells.push(i)

  const todayD = new Date().getDate()
  const todayM = new Date().getMonth()
  const todayY = new Date().getFullYear()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-1">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">‹</button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">›</button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-xs font-semibold text-gray-400 py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calCells.map((day, idx) => {
          if (day === null) return <div key={idx} />

          const ds = dayStr(day)
          const dayItems = reminders.filter((r) => r.dateTime.startsWith(ds))
          const isToday = day === todayD && month === todayM && year === todayY

          return (
            <div
              key={idx}
              className={`min-h-16 p-1.5 rounded-lg border text-left ${
                isToday ? 'bg-orange-50 border-orange-200' : dayItems.length > 0 ? 'bg-orange-50/40 border-orange-100' : 'border-transparent'
              }`}
            >
              <p className={`text-xs font-semibold mb-1 ${isToday ? 'text-orange-600' : 'text-gray-700'}`}>{day}</p>
              {dayItems.slice(0, 2).map((r) => (
                <div key={r.id} className="text-xs bg-orange-400 text-white px-1.5 py-0.5 rounded mb-0.5 truncate">
                  {formatTime(r.dateTime)} {r.title}
                </div>
              ))}
              {dayItems.length > 2 && <p className="text-xs text-gray-500">+{dayItems.length - 2}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Reminders