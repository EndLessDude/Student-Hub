import React, { useState } from 'react'
import { Plus, ChevronRight, ChevronDown, BookMarked, ExternalLink } from 'lucide-react'
import { useCollection } from '../hooks/useCollection'
import { Exam, ClassItem } from '../types'
import { formatDate, calculateExamProgress } from '../utils'
import { Checkbox, ViewToggle, ProgressBar, ActionButtons, EmptyState, ConfirmDialog } from '../components/Shared'
import { LinkIconButton } from '../components/LinkIconButton'
import ExamModal from '../components/modals/ExamModal'

type Filter = 'all' | 'pending' | 'completed'
type View = 'list' | 'calendar' | 'board'

const emptyTitle: Record<Filter, string> = {
  all: 'No exams yet',
  pending: 'No pending exams',
  completed: 'No completed exams',
}
const emptyDesc: Record<Filter, string> = {
  all: "Click 'New Exam' to add your first exam.",
  pending: 'All caught up! No pending exams.',
  completed: 'No exams marked as completed yet.',
}

const Exams: React.FC = () => {
  const { items, loading, addItem, updateItem, deleteItem } = useCollection<Exam>('exams')
  const { items: classes } = useCollection<ClassItem>('classes')

  const [view, setView] = useState<View>('list')
  const [filter, setFilter] = useState<Filter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Exam | null>(null)
  const [prefillDate, setPrefillDate] = useState<string | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = items.filter((e) => {
    if (filter === 'pending') return !e.completed
    if (filter === 'completed') return e.completed
    return true
  })
  const sorted = [...filtered].sort((a, b) => a.examDate.localeCompare(b.examDate))

  const openAdd = (date?: string) => {
    setEditingItem(null)
    setPrefillDate(date)
    setModalOpen(true)
  }

  const handleSave = async (data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) { await updateItem(editingItem.id, data) }
    else { await addItem(data) }
  }

  const handleToggleObjective = async (exam: Exam, objId: string) => {
    const updated = exam.objectives.map((o) => o.id === objId ? { ...o, completed: !o.completed } : o)
    await updateItem(exam.id, { objectives: updated })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
        <button
          onClick={() => openAdd()}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Exam
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
          icon={<BookMarked className="w-10 h-10" />}
          title={emptyTitle[filter]}
          description={emptyDesc[filter]}
          action={filter !== 'completed' ? { label: 'Add Exam', onClick: () => openAdd() } : undefined}
        />
      ) : view === 'list' ? (
        <ExamList
          exams={sorted}
          classes={classes}
          expandedId={expandedId}
          onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
          onEdit={(e) => { setEditingItem(e); setPrefillDate(undefined); setModalOpen(true) }}
          onDelete={(id) => setDeletingId(id)}
          onToggleComplete={(e) => updateItem(e.id, { completed: !e.completed })}
          onToggleObjective={handleToggleObjective}
        />
      ) : view === 'calendar' ? (
        <ExamCalendar
          exams={sorted}
          filter={filter}
          classes={classes}
          onAdd={openAdd}
          onEdit={(e) => { setEditingItem(e); setPrefillDate(undefined); setModalOpen(true) }}
          onDelete={(id) => setDeletingId(id)}
          onToggleComplete={(e) => updateItem(e.id, { completed: !e.completed })}
          onToggleObjective={handleToggleObjective}
        />
      ) : (
        <ExamBoard
          exams={sorted}
          filter={filter}
          onEdit={(e) => { setEditingItem(e); setPrefillDate(undefined); setModalOpen(true) }}
          onDelete={(id) => setDeletingId(id)}
          onToggleComplete={(e) => updateItem(e.id, { completed: !e.completed })}
        />
      )}

      <ExamModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); setPrefillDate(undefined) }}
        onSave={handleSave}
        initial={editingItem}
        prefillDate={prefillDate}
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
  classes: ClassItem[]
  expandedId: string | null
  onToggleExpand: (id: string) => void
  onEdit: (e: Exam) => void
  onDelete: (id: string) => void
  onToggleComplete: (e: Exam) => void
  onToggleObjective: (e: Exam, objId: string) => void
}

const ExamList: React.FC<ExamListProps> = ({
  exams, classes, expandedId, onToggleExpand, onEdit, onDelete, onToggleComplete, onToggleObjective,
}) => (
  <div className="space-y-2">
    {exams.map((exam) => {
      const isExpanded = expandedId === exam.id
      const progress = calculateExamProgress(exam)
      const matchedClass = classes.find((c) => c.name === exam.className)

      return (
        <div key={exam.id} className={`bg-white rounded-xl border transition-shadow ${isExpanded ? 'border-red-200 shadow-md' : 'border-gray-200 hover:shadow-sm'}`}>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Checkbox checked={exam.completed} onChange={() => onToggleComplete(exam)} />
            <button onClick={() => onToggleExpand(exam.id)} className="flex-1 text-left flex items-center gap-2 min-w-0">
              <span className="text-gray-400">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${exam.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {exam.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {exam.className && <span className="text-xs text-gray-500">{exam.className}</span>}
                  <span className="text-xs text-gray-400">{formatDate(exam.examDate)}</span>
                </div>
                {!exam.completed && exam.objectives.length > 0 && (
                  <div className="flex items-center gap-2 mt-1.5 w-36">
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{progress}%</span>
                  </div>
                )}
              </div>
            </button>
            <ActionButtons onEdit={() => onEdit(exam)} onDelete={() => onDelete(exam.id)} />
          </div>

          {isExpanded && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 ml-8">
              {matchedClass && matchedClass.links.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{matchedClass.name} Links</p>
                  <div className="flex gap-2 flex-wrap">
                    {matchedClass.links.map((link) => (
                      <LinkIconButton key={link.id} link={link} size="sm" />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Study Objectives</p>
                  {exam.objectives.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        {exam.objectives.map((obj) => (
                          <div key={obj.id} className="flex items-start gap-2.5">
                            <Checkbox checked={obj.completed} onChange={() => onToggleObjective(exam, obj.id)} />
                            <span className={`text-sm pt-0.5 ${obj.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                              {obj.text}
                            </span>
                          </div>
                        ))}
                      </div>
                      <ProgressBar value={progress} showLabel className="mt-3" />
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">No objectives added</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Study Materials</p>
                  {exam.studyResources && exam.studyResources.length > 0 ? (
                    <div className="space-y-2">
                      {exam.studyResources.map((resource) => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                        >
                          <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 truncate">
                            {resource.title}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-2" />
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
interface ExamCalendarProps {
  exams: Exam[]
  filter: Filter
  classes: ClassItem[]
  onAdd: (date?: string) => void
  onEdit: (e: Exam) => void
  onDelete: (id: string) => void
  onToggleComplete: (e: Exam) => void
  onToggleObjective: (e: Exam, objId: string) => void
}

const ExamCalendar: React.FC<ExamCalendarProps> = ({
  exams, classes, onAdd, onEdit, onDelete, onToggleComplete, onToggleObjective,
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

  const getItemsForDay = (d: number) => exams.filter((e) => e.examDate === dayStr(d))
  const selectedItems = selectedDay ? getItemsForDay(selectedDay) : []
  const selectedDateStr = selectedDay ? dayStr(selectedDay) : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
                  isSelected ? 'border-red-400 bg-red-50 ring-1 ring-red-200' :
                  isToday ? 'border-red-200 bg-red-50/50' :
                  dayItems.length > 0 ? 'border-gray-200 hover:border-red-200' :
                  'border-transparent hover:border-gray-200'
                }`}
              >
                <p className={`text-xs font-semibold mb-1 ${isToday ? 'text-red-600' : 'text-gray-700'}`}>{day}</p>
                {dayItems.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    className={`text-xs px-1.5 py-0.5 rounded mb-0.5 truncate ${
                      e.completed
                        ? 'bg-gray-100 text-gray-400 line-through'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {e.title}
                  </div>
                ))}
                {dayItems.length > 3 && <p className="text-xs text-gray-400">+{dayItems.length - 3}</p>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit sticky top-20">
        {selectedDay ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </h3>
              <button
                onClick={() => onAdd(selectedDateStr ?? undefined)}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400 mb-3">No exams this day</p>
                <button onClick={() => onAdd(selectedDateStr ?? undefined)} className="text-sm text-red-600 hover:text-red-700 font-medium">+ Add Exam</button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedItems.map((exam) => {
                  const isExp = expandedId === exam.id
                  const progress = calculateExamProgress(exam)
                  const matchedClass = classes.find((c) => c.name === exam.className)

                  return (
                    <div key={exam.id} className={`rounded-xl border transition-all ${isExp ? 'border-red-200' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 p-3">
                        <Checkbox checked={exam.completed} onChange={() => onToggleComplete(exam)} />
                        <button onClick={() => setExpandedId(isExp ? null : exam.id)} className="flex-1 text-left min-w-0">
                          <p className={`text-sm font-medium truncate ${exam.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {exam.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {exam.className && <span className="text-xs text-gray-500">{exam.className}</span>}
                          </div>
                          {!exam.completed && exam.objectives.length > 0 && (
                            <div className="flex items-center gap-2 mt-1 w-24">
                              <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-red-400" style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-xs text-gray-400">{progress}%</span>
                            </div>
                          )}
                        </button>
                        <ActionButtons onEdit={() => onEdit(exam)} onDelete={() => onDelete(exam.id)} />
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
                          {exam.objectives.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Objectives</p>
                              <div className="space-y-1.5">
                                {exam.objectives.map((obj) => (
                                  <div key={obj.id} className="flex items-center gap-2">
                                    <Checkbox checked={obj.completed} onChange={() => onToggleObjective(exam, obj.id)} />
                                    <span className={`text-xs ${obj.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{obj.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {exam.studyResources && exam.studyResources.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Resources</p>
                              {exam.studyResources.map((r) => (
                                <a
                                  key={r.id}
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between text-xs text-blue-600 hover:underline py-0.5"
                                >
                                  {r.title}
                                  <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
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
            <p className="text-sm text-gray-400">Click a day to view exams</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Board View ───────────────────────────────────────────────
interface ExamBoardProps {
  exams: Exam[]
  filter: Filter
  onEdit: (e: Exam) => void
  onDelete: (id: string) => void
  onToggleComplete: (e: Exam) => void
}

const ExamBoard: React.FC<ExamBoardProps> = ({ exams, filter, onEdit, onDelete, onToggleComplete }) => {
  const allColumns = [
    { id: 'ns', title: 'Not Started', filter: (e: Exam) => !e.completed && calculateExamProgress(e) === 0 },
    { id: 'ip', title: 'In Progress', filter: (e: Exam) => !e.completed && calculateExamProgress(e) > 0 && calculateExamProgress(e) < 100 },
    { id: 'rdy', title: 'Ready', filter: (e: Exam) => !e.completed && calculateExamProgress(e) === 100 },
    { id: 'done', title: 'Completed', filter: (e: Exam) => e.completed },
  ]

  const visibleColumns = allColumns.filter((col) => {
    if (filter === 'pending') return col.id !== 'done'
    if (filter === 'completed') return col.id === 'done'
    return true
  })

  return (
    <div className={`grid gap-4 ${visibleColumns.length === 1 ? 'grid-cols-1 max-w-sm' : visibleColumns.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : visibleColumns.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-4'}`}>
      {visibleColumns.map((col) => (
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