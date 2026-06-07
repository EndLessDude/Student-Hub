import React, { useState } from 'react'
import { Plus, ChevronDown, BookOpen } from 'lucide-react'
import { useCollection } from '../hooks/useCollection'
import { Assignment, ClassItem } from '../types'
import { formatDate, isOverdue } from '../utils'
import { Checkbox, ViewToggle, Badge, ActionButtons, EmptyState, ConfirmDialog } from '../components/Shared'
import { LinkIconButton } from '../components/LinkIconButton'
import AssignmentModal from '../components/modals/AssignmentModal'

type Filter = 'all' | 'pending' | 'completed'
type View = 'list' | 'calendar' | 'board'

const emptyTitle: Record<Filter, string> = {
  all: 'No assignments yet',
  pending: 'No pending assignments',
  completed: 'No completed assignments',
}
const emptyDesc: Record<Filter, string> = {
  all: "Click 'New Assignment' to add your first one.",
  pending: 'All caught up! No pending assignments.',
  completed: 'No assignments marked as completed yet.',
}

const Assignments: React.FC = () => {
  const { items, loading, addItem, updateItem, deleteItem } = useCollection<Assignment>('assignments')
  const { items: classes } = useCollection<ClassItem>('classes')

  const [view, setView] = useState<View>('list')
  const [filter, setFilter] = useState<Filter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Assignment | null>(null)
  const [prefillDate, setPrefillDate] = useState<string | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = items.filter((a) => {
    if (filter === 'pending') return !a.completed
    if (filter === 'completed') return a.completed
    return true
  })
  const sorted = [...filtered].sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const openAdd = (date?: string) => {
    setEditingItem(null)
    setPrefillDate(date)
    setModalOpen(true)
  }

  const handleSave = async (data: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) { await updateItem(editingItem.id, data) }
    else { await addItem(data) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <button onClick={() => openAdd()} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Assignment
        </button>
      </div>

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
          views={[{ id: 'list', label: 'List' }, { id: 'calendar', label: 'Calendar' }, { id: 'board', label: 'Board' }]}
          active={view}
          onChange={(v) => setView(v as View)}
        />
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-10 h-10" />}
          title={emptyTitle[filter]}
          description={emptyDesc[filter]}
          action={filter !== 'completed' ? { label: 'Add Assignment', onClick: () => openAdd() } : undefined}
        />
      ) : view === 'list' ? (
        <AssignmentList
          assignments={sorted}
          classes={classes}
          expandedId={expandedId}
          onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
          onEdit={(a) => { setEditingItem(a); setPrefillDate(undefined); setModalOpen(true) }}
          onDelete={(id) => setDeletingId(id)}
          onToggleComplete={(a) => updateItem(a.id, { completed: !a.completed })}
        />
      ) : view === 'calendar' ? (
        <AssignmentCalendar
          assignments={sorted}
          filter={filter}
          classes={classes}
          onAdd={openAdd}
          onEdit={(a) => { setEditingItem(a); setPrefillDate(undefined); setModalOpen(true) }}
          onDelete={(id) => setDeletingId(id)}
          onToggleComplete={(a) => updateItem(a.id, { completed: !a.completed })}
        />
      ) : (
        <AssignmentBoard
          assignments={sorted}
          filter={filter}
          onEdit={(a) => { setEditingItem(a); setPrefillDate(undefined); setModalOpen(true) }}
          onDelete={(id) => setDeletingId(id)}
          onToggleComplete={(a) => updateItem(a.id, { completed: !a.completed })}
        />
      )}

      <AssignmentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); setPrefillDate(undefined) }}
        onSave={handleSave}
        initial={editingItem}
        prefillDate={prefillDate}
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={async () => { if (deletingId) { await deleteItem(deletingId); setDeletingId(null) } }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}

// ─── List View ────────────────────────────────────────────────
interface AssignmentListProps {
  assignments: Assignment[]
  classes: ClassItem[]
  expandedId: string | null
  onToggleExpand: (id: string) => void
  onEdit: (a: Assignment) => void
  onDelete: (id: string) => void
  onToggleComplete: (a: Assignment) => void
}

const AssignmentList: React.FC<AssignmentListProps> = ({
  assignments, classes, expandedId, onToggleExpand, onEdit, onDelete, onToggleComplete,
}) => (
  <div className="space-y-2">
    {assignments.map((a) => {
      const isLate = !a.completed && isOverdue(a.dueDate)
      const isExpanded = expandedId === a.id
      const matchedClass = classes.find((c) => c.name === a.className)

      return (
        <div key={a.id} className={`bg-white rounded-xl border transition-shadow ${isExpanded ? 'border-blue-200 shadow-md' : 'border-gray-200 hover:shadow-sm'}`}>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Checkbox checked={a.completed} onChange={() => onToggleComplete(a)} />
            <button onClick={() => onToggleExpand(a.id)} className="flex-1 text-left flex items-center gap-3 min-w-0">
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${a.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {a.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {a.className && <span className="text-xs text-gray-500">{a.className}</span>}
                  <span className={`text-xs font-medium ${isLate ? 'text-red-500' : 'text-gray-400'}`}>{formatDate(a.dueDate)}</span>
                  {isLate && <Badge label="Overdue" variant="red" />}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            <ActionButtons onEdit={() => onEdit(a)} onDelete={() => onDelete(a.id)} />
          </div>

          {isExpanded && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 ml-8 space-y-4">
              {matchedClass && matchedClass.links.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{matchedClass.name} Links</p>
                  <div className="flex gap-2 flex-wrap">
                    {matchedClass.links.map((link) => (
                      <LinkIconButton key={link.id} link={link} size="sm" />
                    ))}
                  </div>
                </div>
              )}
              {a.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.notes}</p>
                </div>
              )}
              {a.links && a.links.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Resources</p>
                  <div className="space-y-1">
                    {a.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-700 hover:underline truncate"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )
    })}
  </div>
)

// ─── Calendar View ────────────────────────────────────────────
interface AssignmentCalendarProps {
  assignments: Assignment[]
  filter: Filter
  classes: ClassItem[]
  onAdd: (date?: string) => void
  onEdit: (a: Assignment) => void
  onDelete: (id: string) => void
  onToggleComplete: (a: Assignment) => void
}

const AssignmentCalendar: React.FC<AssignmentCalendarProps> = ({
  assignments, classes, onAdd, onEdit, onDelete, onToggleComplete,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  const getItemsForDay = (d: number) => assignments.filter((a) => a.dueDate === dayStr(d))

  const selectedItems = selectedDay ? getItemsForDay(selectedDay) : []
  const selectedDateStr = selectedDay ? dayStr(selectedDay) : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Calendar grid */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-1">
            <button onClick={() => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null) }} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">‹</button>
            <button onClick={() => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null) }} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">›</button>
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
            const dayItems = getItemsForDay(day)
            const isToday = day === todayD && month === todayM && year === todayY
            const isSelected = selectedDay === day

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`min-h-20 p-1.5 rounded-lg border text-left transition-all ${
                  isSelected ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200' :
                  isToday ? 'border-blue-200 bg-blue-50/50' :
                  dayItems.length > 0 ? 'border-gray-200 hover:border-blue-200' :
                  'border-transparent hover:border-gray-200'
                }`}
              >
                <p className={`text-xs font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{day}</p>
                {dayItems.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className={`text-xs px-1.5 py-0.5 rounded mb-0.5 truncate ${
                      a.completed
                        ? 'bg-gray-100 text-gray-400 line-through'
                        : isOverdue(a.dueDate)
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {a.title}
                  </div>
                ))}
                {dayItems.length > 3 && <p className="text-xs text-gray-400">+{dayItems.length - 3}</p>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Detail sidebar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit sticky top-20">
        {selectedDay ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </h3>
              <button
                onClick={() => onAdd(selectedDateStr ?? undefined)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400 mb-3">Nothing due this day</p>
                <button onClick={() => onAdd(selectedDateStr ?? undefined)} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  + Add Assignment
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedItems.map((a) => {
                  const isExp = expandedId === a.id
                  const isLate = !a.completed && isOverdue(a.dueDate)
                  const matchedClass = classes.find((c) => c.name === a.className)

                  return (
                    <div key={a.id} className={`rounded-xl border transition-all ${isExp ? 'border-blue-200' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 p-3">
                        <Checkbox checked={a.completed} onChange={() => onToggleComplete(a)} />
                        <button onClick={() => setExpandedId(isExp ? null : a.id)} className="flex-1 text-left min-w-0">
                          <p className={`text-sm font-medium truncate ${a.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {a.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {a.className && <span className="text-xs text-gray-500">{a.className}</span>}
                            {isLate && <Badge label="Overdue" variant="red" />}
                          </div>
                        </button>
                        <ActionButtons onEdit={() => onEdit(a)} onDelete={() => onDelete(a.id)} />
                      </div>

                      {isExp && (
                        <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-3">
                          {matchedClass && matchedClass.links.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{matchedClass.name} Links</p>
                              <div className="flex gap-1.5 flex-wrap">
                                {matchedClass.links.map((link) => (
                                  <LinkIconButton key={link.id} link={link} size="sm" />
                                ))}
                              </div>
                            </div>
                          )}
                          {a.notes && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                              <p className="text-xs text-gray-700">{a.notes}</p>
                            </div>
                          )}
                          {a.links && a.links.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Resources</p>
                              {a.links.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-xs text-blue-600 hover:underline truncate"
                                >
                                  {link}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">Click a day to view assignments</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Board View ───────────────────────────────────────────────
interface AssignmentBoardProps {
  assignments: Assignment[]
  filter: Filter
  onEdit: (a: Assignment) => void
  onDelete: (id: string) => void
  onToggleComplete: (a: Assignment) => void
}

const AssignmentBoard: React.FC<AssignmentBoardProps> = ({ assignments, filter, onEdit, onDelete, onToggleComplete }) => {
  const allColumns = [
    { id: 'upcoming', title: 'Upcoming', filter: (a: Assignment) => !a.completed && !isOverdue(a.dueDate) },
    { id: 'overdue', title: 'Overdue', filter: (a: Assignment) => !a.completed && isOverdue(a.dueDate) },
    { id: 'done', title: 'Completed', filter: (a: Assignment) => a.completed },
  ]

  const visibleColumns = allColumns.filter((col) => {
    if (filter === 'pending') return col.id !== 'done'
    if (filter === 'completed') return col.id === 'done'
    return true
  })

  return (
    <div className={`grid gap-4 ${visibleColumns.length === 1 ? 'grid-cols-1 max-w-sm' : visibleColumns.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
      {visibleColumns.map((col) => (
        <div key={col.id} className="bg-gray-50 rounded-xl p-4 min-h-48">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{col.title}</h3>
          <div className="space-y-2">
            {assignments.filter(col.filter).map((a) => (
              <div key={a.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-2">
                  <Checkbox checked={a.completed} onChange={() => onToggleComplete(a)} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${a.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.className}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(a.dueDate)}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-1">
                  <ActionButtons onEdit={() => onEdit(a)} onDelete={() => onDelete(a.id)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Assignments