import React, { useState } from 'react'
import { Plus, ChevronRight, ChevronDown, BookMarked } from 'lucide-react'
import { useCollection } from '../hooks/useCollection'
import { Exam } from '../types'
import { formatDate, calculateExamProgress } from '../utils'
import { Checkbox, ViewToggle, ProgressBar, ActionButtons, EmptyState, ConfirmDialog } from '../components/Shared'
import ExamModal from '../components/modals/ExamModal'

type Filter = 'all' | 'pending' | 'completed'
type View = 'list' | 'calendar' | 'board'

const Exams: React.FC = () => {
  const { items, loading, addItem, updateItem, deleteItem } = useCollection<Exam>('exams')

  const [view, setView] = useState<View>('list')
  const [filter, setFilter] = useState<Filter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Exam | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = items.filter((e) => {
    if (filter === 'pending') return !e.completed
    if (filter === 'completed') return e.completed
    return true
  })

  const sorted = [...filtered].sort((a, b) => a.examDate.localeCompare(b.examDate))

  const handleSave = async (data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      await updateItem(editingItem.id, data)
    } else {
      await addItem(data)
    }
  }

  const handleToggleObjective = async (exam: Exam, objectiveId: string) => {
    const updatedObjectives = exam.objectives.map((obj) =>
      obj.id === objectiveId ? { ...obj, completed: !obj.completed } : obj
    )
    await updateItem(exam.id, { objectives: updatedObjectives })
  }

  const handleToggleComplete = async (exam: Exam) => {
    await updateItem(exam.id, { completed: !exam.completed })
  }

  const openAdd = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
          <Plus className="w-4 h-4" />
          New Exam
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
            { id: 'board', label: 'Board' },
          ]}
          active={view}
          onChange={(v) => setView(v as View)}
        />
      </div>

      {/* Content */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={<BookMarked className="w-10 h-10" />}
          title="No exams yet"
          description="Click 'New Exam' to add your first exam and start tracking your preparation."
          action={{ label: 'Add Exam', onClick: openAdd }}
        />
      ) : view === 'list' ? (
        <ExamList
          exams={sorted}
          expandedId={expandedId}
          onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
          onEdit={(e) => { setEditingItem(e); setModalOpen(true) }}
          onDelete={(id) => setDeletingId(id)}
          onToggleComplete={handleToggleComplete}
          onToggleObjective={handleToggleObjective}
        />
      ) : view === 'calendar' ? (
        <ExamCalendar exams={sorted} />
      ) : (
        <ExamBoard
          exams={sorted}
          onEdit={(e) => { setEditingItem(e); setModalOpen(true) }}
          onDelete={(id) => setDeletingId(id)}
          onToggleComplete={handleToggleComplete}
        />
      )}

      <ExamModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSave={handleSave}
        initial={editingItem}
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Exam"
        message="Are you sure you want to delete this exam? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={async () => { if (deletingId) { await deleteItem(deletingId); setDeletingId(null) } }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}

// ─── List View ────────────────────────────────────────────────
interface ExamListProps {
  exams: Exam[]
  expandedId: string | null
  onToggleExpand: (id: string) => void
  onEdit: (e: Exam) => void
  onDelete: (id: string) => void
  onToggleComplete: (e: Exam) => void
  onToggleObjective: (e: Exam, objId: string) => void
}

const ExamList: React.FC<ExamListProps> = ({
  exams,
  expandedId,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleComplete,
  onToggleObjective,
}) => (
  <div className="space-y-2">
    {exams.map((exam) => {
      const isExpanded = expandedId === exam.id
      const progress = calculateExamProgress(exam)

      return (
        <div
          key={exam.id}
          className={`bg-white rounded-xl border transition-shadow ${
            isExpanded ? 'border-red-200 shadow-md' : 'border-gray-200 hover:shadow-sm'
          }`}
        >
          {/* Row */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Checkbox checked={exam.completed} onChange={() => onToggleComplete(exam)} />

            <button
              onClick={() => onToggleExpand(exam.id)}
              className="flex-1 text-left flex items-center gap-3 min-w-0"
            >
              <div className="mr-1 text-gray-400">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${exam.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {exam.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {exam.className && (
                    <span className="text-xs text-gray-500">{exam.className}</span>
                  )}
                  <span className="text-xs text-gray-400">{formatDate(exam.examDate)}</span>
                </div>
                {!exam.completed && exam.objectives.length > 0 && (
                  <div className="flex items-center gap-2 mt-1.5 w-40">
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{progress}%</span>
                  </div>
                )}
              </div>
            </button>

            <ActionButtons onEdit={() => onEdit(exam)} onDelete={() => onDelete(exam.id)} />
          </div>

          {/* Expanded */}
          {isExpanded && (
            <div className="px-4 pb-4 pt-1 border-t border-gray-100 ml-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Objectives */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Study Objectives
                  </p>
                  {exam.objectives.length > 0 ? (
                    <div className="space-y-2">
                      {exam.objectives.map((obj) => (
                        <div key={obj.id} className="flex items-start gap-2.5">
                          <Checkbox
                            checked={obj.completed}
                            onChange={() => onToggleObjective(exam, obj.id)}
                          />
                          <span className={`text-sm pt-0.5 ${obj.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {obj.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No objectives added</p>
                  )}
                  {exam.objectives.length > 0 && (
                    <ProgressBar value={progress} showLabel className="mt-3" />
                  )}
                </div>

                {/* Study Resources */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Study Materials
                  </p>
                  {exam.studyResources && exam.studyResources.length > 0 ? (
                    <div className="space-y-2">
                      {exam.studyResources.map((resource) => (
                        <a>
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col p-2.5 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          <span className="text-sm font-medium text-blue-600">{resource.title}</span>
                          <span className="text-xs text-gray-400 truncate mt-0.5">{resource.url}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No resources added</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    })}
  </div>
)

// ─── Calendar View ────────────────────────────────────────────
const ExamCalendar: React.FC<{ exams: Exam[] }> = ({ exams }) => {
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
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ›
          </button>
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
          const dayExams = exams.filter((e) => e.examDate === ds)
          const isToday = day === todayD && month === todayM && year === todayY

          return (
            <div
              key={idx}
              className={`min-h-16 p-1.5 rounded-lg border text-left ${
                isToday ? 'bg-red-50 border-red-200' : dayExams.length > 0 ? 'bg-red-50/40 border-red-100' : 'border-transparent'
              }`}
            >
              <p className={`text-xs font-semibold mb-1 ${isToday ? 'text-red-600' : 'text-gray-700'}`}>{day}</p>
              {dayExams.slice(0, 2).map((e) => (
                <div key={e.id} className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded mb-0.5 truncate">
                  {e.title}
                </div>
              ))}
              {dayExams.length > 2 && <p className="text-xs text-gray-500">+{dayExams.length - 2}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Board View ───────────────────────────────────────────────
interface ExamBoardProps {
  exams: Exam[]
  onEdit: (e: Exam) => void
  onDelete: (id: string) => void
  onToggleComplete: (e: Exam) => void
}

const ExamBoard: React.FC<ExamBoardProps> = ({ exams, onEdit, onDelete, onToggleComplete }) => {
  const columns = [
    { id: 'ns', title: 'Not Started', filter: (e: Exam) => !e.completed && calculateExamProgress(e) === 0 },
    { id: 'ip', title: 'In Progress', filter: (e: Exam) => !e.completed && calculateExamProgress(e) > 0 && calculateExamProgress(e) < 100 },
    { id: 'rdy', title: 'Ready', filter: (e: Exam) => !e.completed && calculateExamProgress(e) === 100 },
    { id: 'done', title: 'Completed', filter: (e: Exam) => e.completed },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map((col) => (
        <div key={col.id} className="bg-gray-50 rounded-xl p-4 min-h-48">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{col.title}</h3>
          <div className="space-y-2">
            {exams.filter(col.filter).map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-2">
                  <Checkbox checked={exam.completed} onChange={() => onToggleComplete(exam)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{exam.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{exam.className}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(exam.examDate)}</p>
                    {!exam.completed && exam.objectives.length > 0 && (
                      <ProgressBar value={calculateExamProgress(exam)} showLabel className="mt-2" />
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-1">
                  <ActionButtons onEdit={() => onEdit(exam)} onDelete={() => onDelete(exam.id)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Exams