import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Calendar, Clock, AlertCircle } from 'lucide-react'
import { useCollection } from '../hooks/useCollection'
import { Assignment, Exam, Reminder } from '../types'
import { formatDate, calculateExamProgress, isOverdue } from '../utils'
import { Checkbox } from '../components/Shared'

const Home: React.FC = () => {
  const { items: assignments, updateItem: updateAssignment, loading: loadA } = useCollection<Assignment>('assignments')
  const { items: exams, updateItem: updateExam, loading: loadE } = useCollection<Exam>('exams')
  const { items: reminders, updateItem: updateReminder, loading: loadR } = useCollection<Reminder>('reminders')

  const loading = loadA || loadE || loadR

  const pendingAssignments = assignments.filter((a) => !a.completed)
  const pendingExams = exams.filter((e) => !e.completed)
  const pendingReminders = reminders.filter((r) => !r.completed)

  const overdueAssignments = pendingAssignments.filter((a) => isOverdue(a.dueDate))
  const overdueReminders = pendingReminders.filter((r) => isOverdue(r.dateTime.split('T')[0]))

  const upcomingAssignments = [...pendingAssignments]
    .filter((a) => !isOverdue(a.dueDate))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3)

  const upcomingExams = [...pendingExams]
    .filter((e) => !isOverdue(e.examDate))
    .sort((a, b) => a.examDate.localeCompare(b.examDate))
    .slice(0, 3)

  const todayStr = new Date().toISOString().split('T')[0]
  const todayReminders = pendingReminders.filter((r) =>
    r.dateTime.startsWith(todayStr)
  )

  const totalOverdue = overdueAssignments.length + overdueReminders.length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Good {greeting}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<BookOpen className="w-4 h-4" />} label="Pending" value={pendingAssignments.length} color="blue" />
        <StatCard icon={<AlertCircle className="w-4 h-4" />} label="Overdue" value={totalOverdue} color={totalOverdue > 0 ? 'red' : 'gray'} />
        <StatCard icon={<Calendar className="w-4 h-4" />} label="Upcoming Exams" value={pendingExams.length} color="purple" />
        <StatCard icon={<Clock className="w-4 h-4" />} label="Today's Reminders" value={todayReminders.length} color="orange" />
      </div>

      {/* Overdue alert */}
      {totalOverdue > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 text-sm">You have overdue items</p>
            <p className="text-red-700 text-sm">
              {overdueAssignments.length > 0 && `${overdueAssignments.length} assignment${overdueAssignments.length !== 1 ? 's' : ''}`}
              {overdueAssignments.length > 0 && overdueReminders.length > 0 && ' and '}
              {overdueReminders.length > 0 && `${overdueReminders.length} reminder${overdueReminders.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      )}

      {/* Two column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Assignments */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Assignments</h2>
            <Link to="/assignments" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View all →
            </Link>
          </div>
          {upcomingAssignments.length > 0 ? (
            <div className="space-y-1">
              {upcomingAssignments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group">
                  <Checkbox
                    checked={a.completed}
                    onChange={() => updateAssignment(a.id, { completed: !a.completed })}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${a.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-500">{a.className}</p>
                  </div>
                  <span className={`text-xs font-medium flex-shrink-0 ${isOverdue(a.dueDate) ? 'text-red-500' : 'text-gray-400'}`}>
                    {formatDate(a.dueDate)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No upcoming assignments</p>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Exams</h2>
            <Link to="/exams" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View all →
            </Link>
          </div>
          {upcomingExams.length > 0 ? (
            <div className="space-y-1">
              {upcomingExams.map((exam) => {
                const progress = calculateExamProgress(exam)
                return (
                  <div key={exam.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <Checkbox
                      checked={exam.completed}
                      onChange={() => updateExam(exam.id, { completed: !exam.completed })}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{exam.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{progress}%</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-400 flex-shrink-0">
                      {formatDate(exam.examDate)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No upcoming exams</p>
          )}
        </div>
      </div>

      {/* Today's Reminders */}
      {todayReminders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Today's Reminders</h2>
          <div className="space-y-1">
            {todayReminders.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <Checkbox
                  checked={r.completed}
                  onChange={() => updateReminder(r.id, { completed: !r.completed })}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                  {r.notes && <p className="text-xs text-gray-500 truncate">{r.notes}</p>}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(r.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  color: 'blue' | 'red' | 'gray' | 'purple' | 'orange'
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  const styles: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    red: 'bg-red-50 border-red-100 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    orange: 'bg-orange-50 border-orange-100 text-orange-700',
  }

  return (
    <div className={`border rounded-xl p-4 ${styles[color]}`}>
      <div className="flex items-center gap-2 opacity-70 mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

export default Home