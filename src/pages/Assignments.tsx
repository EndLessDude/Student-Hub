import React, { useState } from 'react'
import { Plus, ChevronDown, BookOpen } from 'lucide-react'
import { useCollection } from '../hooks/useCollection'
import { Assignment } from '../types'
import { formatDate, isOverdue } from '../utils'
import { Checkbox, ViewToggle, Badge, ActionButtons, EmptyState, ConfirmDialog } from '../components/Shared'
import AssignmentModal from '../components/modals/AssignmentModal'

type Filter = 'all' | 'pending' | 'completed'
type View = 'list' | 'calendar' | 'board'

const Assignments: React.FC = () => {
  const { items, loading, addItem, updateItem, deleteItem } =
    useCollection<Assignment>('assignments')

  const [view, setView] = useState<View>('list')
  const [filter, setFilter] = useState<Filter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Assignment | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = items.filter((a) => {
    if (filter === 'pending') return !a.completed
    if (filter === 'completed') return a.completed
    return true
  })

  const sorted = [...filtered].sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate)
  )

  const handleSave = async (
    data: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingItem) {
      await updateItem(editingItem.id, data)
    } else {
      await addItem(data)
    }
  }

  const handleEdit = (assignment: Assignment) => {
    setEditingItem(assignment)
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (deletingId) {
      await deleteItem(deletingId)
      setDeletingId(null)
    }
  }

  const handleToggleComplete = async (assignment: Assignment) => {
    await updateItem(assignment.id, {
      completed: !assignment.completed,
    })
  }

  const openAdd = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          New Assignment
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
                filter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
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
            { id: 'board', label: 'Board' },
          ]}
          active={view}
          onChange={(v) => setView(v as View)}
        />
      </div>

      {/* Content */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-10 h-10" />}
          title="No assignments yet"
          description="Click 'New Assignment' to add your first one."
          action={{ label: 'Add Assignment', onClick: openAdd }}
        />
      ) : view === 'list' ? (
        <AssignmentList
          assignments={sorted}
          expandedId={expandedId}
          onToggleExpand={(id) =>
            setExpandedId(expandedId === id ? null : id)
          }
          onEdit={handleEdit}
          onDelete={(id) => setDeletingId(id)}
          onToggleComplete={handleToggleComplete}
        />
      ) : view === 'calendar' ? (
        <AssignmentCalendar assignments={sorted} />
      ) : (
        <AssignmentBoard
          assignments={sorted}
          onEdit={handleEdit}
          onDelete={(id: string) => setDeletingId(id)}
          onToggleComplete={handleToggleComplete}
        />
      )}

      {/* Modal */}
      <AssignmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSave}
        initial={editingItem}
      />

      {/* Delete */}
      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}

/* ───────────────────────── LIST VIEW ───────────────────────── */

interface AssignmentListProps {
  assignments: Assignment[]
  expandedId: string | null
  onToggleExpand: (id: string) => void
  onEdit: (a: Assignment) => void
  onDelete: (id: string) => void
  onToggleComplete: (a: Assignment) => void
}

const AssignmentList: React.FC<AssignmentListProps> = ({
  assignments,
  expandedId,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleComplete,
}) => (
  <div className="space-y-2">
    {assignments.map((assignment) => {
      const isLate =
        !assignment.completed && isOverdue(assignment.dueDate)
      const isExpanded = expandedId === assignment.id

      return (
        <div
          key={assignment.id}
          className={`bg-white rounded-xl border transition-shadow ${
            isExpanded
              ? 'border-blue-200 shadow-md'
              : 'border-gray-200 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Checkbox
              checked={assignment.completed}
              onChange={() => onToggleComplete(assignment)}
            />

            <button
              onClick={() => onToggleExpand(assignment.id)}
              className="flex-1 text-left flex items-center gap-3 min-w-0"
            >
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium text-sm truncate ${
                    assignment.completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-900'
                  }`}
                >
                  {assignment.title}
                </p>

                <div className="flex items-center gap-2 mt-0.5">
                  {assignment.className && (
                    <span className="text-xs text-gray-500">
                      {assignment.className}
                    </span>
                  )}
                  <span
                    className={`text-xs font-medium ${
                      isLate ? 'text-red-500' : 'text-gray-400'
                    }`}
                  >
                    {formatDate(assignment.dueDate)}
                  </span>
                  {isLate && <Badge label="Overdue" variant="red" />}
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            <ActionButtons
              onEdit={() => onEdit(assignment)}
              onDelete={() => onDelete(assignment.id)}
            />
          </div>

          {isExpanded && (
            <div className="px-4 pb-4 pt-1 border-t border-gray-100 ml-8 space-y-3">
              {assignment.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {assignment.notes}
                  </p>
                </div>
              )}

{assignment.links && assignment.links.length > 0 && (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
      Resources
    </p>

    <div className="space-y-1">
      {assignment.links.map((link, idx) => (
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

/* ───────────────────── CALENDAR + BOARD ───────────────────── */
/* (unchanged logic, only formatting kept consistent) */

const AssignmentCalendar: React.FC<{ assignments: Assignment[] }> = ({
  assignments,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDOW = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const pad = (n: number) => String(n).padStart(2, '0')
  const dayStr = (d: number) =>
    `${year}-${pad(month + 1)}-${pad(d)}`

  const calCells: (number | null)[] = [
    ...Array(firstDOW).fill(null),
  ]
  for (let i = 1; i <= daysInMonth; i++) calCells.push(i)

  const todayD = new Date().getDate()
  const todayM = new Date().getMonth()
  const todayY = new Date().getFullYear()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">
          {currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>

        <div className="flex gap-1">
          <button
            onClick={() =>
              setCurrentDate(new Date(year, month - 1, 1))
            }
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ‹
          </button>
          <button
            onClick={() =>
              setCurrentDate(new Date(year, month + 1, 1))
            }
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-xs font-semibold text-gray-400 py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calCells.map((day, idx) => {
          if (day === null) return <div key={idx} />

          const ds = dayStr(day)
          const dayItems = assignments.filter(
            (a) => a.dueDate === ds
          )
          const isToday =
            day === todayD &&
            month === todayM &&
            year === todayY

          return (
            <div
              key={idx}
              className={`min-h-16 p-1.5 rounded-lg border ${
                isToday
                  ? 'bg-blue-50 border-blue-200'
                  : dayItems.length > 0
                  ? 'bg-blue-50/40 border-blue-100'
                  : 'border-transparent'
              }`}
            >
              <p
                className={`text-xs font-semibold mb-1 ${
                  isToday ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {day}
              </p>

              {dayItems.slice(0, 2).map((a) => (
                <div
                  key={a.id}
                  className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded mb-0.5 truncate"
                >
                  {a.title}
                </div>
              ))}

              {dayItems.length > 2 && (
                <p className="text-xs text-gray-500">
                  +{dayItems.length - 2}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const AssignmentBoard: React.FC<any> = ({
  assignments,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const columns = [
    {
      id: 'upcoming',
      title: 'Upcoming',
      filter: (a: Assignment) =>
        !a.completed && !isOverdue(a.dueDate),
    },
    {
      id: 'overdue',
      title: 'Overdue',
      filter: (a: Assignment) =>
        !a.completed && isOverdue(a.dueDate),
    },
    {
      id: 'done',
      title: 'Completed',
      filter: (a: Assignment) => a.completed,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => (
        <div key={col.id} className="bg-gray-50 rounded-xl p-4 min-h-64">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
            {col.title}
          </h3>

          <div className="space-y-2">
            {assignments.filter(col.filter).map((a: Assignment) => (
              <div
                key={a.id}
                className="bg-white rounded-lg border p-3"
              >
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={a.completed}
                    onChange={() => onToggleComplete(a)}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        a.completed
                          ? 'line-through text-gray-400'
                          : 'text-gray-900'
                      }`}
                    >
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {a.className}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(a.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <ActionButtons
                    onEdit={() => onEdit(a)}
                    onDelete={() => onDelete(a.id)}
                  />
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