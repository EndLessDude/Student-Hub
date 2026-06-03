/* New:
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCollection } from '../hooks/useCollection'
import { Assignment, Exam, Reminder } from '../types'
import { formatTime } from '../utils'

const Calendar: React.FC = () => {
  const { items: assignments } = useCollection<Assignment>('assignments')
  const { items: exams } = useCollection<Exam>('exams')
  const { items: reminders } = useCollection<Reminder>('reminders')

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

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

  const getItems = (day: number) => {
    const ds = dayStr(day)
    return {
      assignments: assignments.filter((a) => a.dueDate === ds),
      exams: exams.filter((e) => e.examDate === ds),
      reminders: reminders.filter((r) => r.dateTime.startsWith(ds)),
    }
  }

  const selectedItems
  */
//Old:

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { mockAssignments, mockExams, mockReminders } from '../mockData'

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const calendarDays: (number | null)[] = Array(startingDayOfWeek).fill(null)
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const getItemsForDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const dateStr = date.toISOString().split('T')[0]

    const dayAssignments = mockAssignments.filter(a => a.dueDate === dateStr)
    const dayExams = mockExams.filter(e => e.examDate === dateStr)
    const dayReminders = mockReminders.filter(r => r.dateTime.startsWith(dateStr))

    return {
      assignments: dayAssignments,
      exams: dayExams,
      reminders: dayReminders,
      total: dayAssignments.length + dayExams.length + dayReminders.length,
    }
  }

  const selectedDateItems = selectedDate ? getItemsForDay(selectedDate.getDate()) : null
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
              <div className="flex gap-2">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={idx} className="bg-gray-50 rounded-lg h-32 border border-transparent" />
                }

                const items = getItemsForDay(day)
                const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString()
                const isSelected = selectedDate?.toDateString() === new Date(currentYear, currentMonth, day).toDateString()

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                    className={`h-32 p-2 rounded-lg border transition-all text-left ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                        : isToday
                        ? 'bg-blue-50 border-blue-300'
                        : items.total > 0
                        ? 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <p className={`font-semibold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>{day}</p>
                    {items.total > 0 && (
                      <div className="mt-2 space-y-1 overflow-hidden">
                        {items.assignments.slice(0, 1).map(a => (
                          <div key={a.id} className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded truncate">
                            {a.title}
                          </div>
                        ))}
                        {items.exams.slice(0, 1).map(e => (
                          <div key={e.id} className="text-xs bg-red-500 text-white px-2 py-0.5 rounded truncate">
                            {e.title}
                          </div>
                        ))}
                        {items.reminders.slice(0, 1).map(r => (
                          <div key={r.id} className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded truncate">
                            {r.title}
                          </div>
                        ))}
                        {items.total > 3 && (
                          <p className="text-xs text-gray-600 px-2">+{items.total - 3} more</p>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-sm text-gray-600">Assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-sm text-gray-600">Exams</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded" />
                <span className="text-sm text-gray-600">Reminders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Selected day details */}
        {selectedDateItems && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">
              {selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
            </h3>

            {selectedDateItems.assignments.length === 0 &&
              selectedDateItems.exams.length === 0 &&
              selectedDateItems.reminders.length === 0 ? (
              <p className="text-gray-500 text-sm">No items scheduled</p>
            ) : (
              <div className="space-y-6">
                {/* Assignments */}
                {selectedDateItems.assignments.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-blue-600">Assignments</h4>
                    <div className="space-y-2">
                      {selectedDateItems.assignments.map(a => (
                        <div
                          key={a.id}
                          className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900">{a.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{a.className}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exams */}
                {selectedDateItems.exams.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-red-600">Exams</h4>
                    <div className="space-y-2">
                      {selectedDateItems.exams.map(e => (
                        <div
                          key={e.id}
                          className="p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900">{e.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{e.className}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reminders */}
                {selectedDateItems.reminders.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-gray-600">Reminders</h4>
                    <div className="space-y-2">
                      {selectedDateItems.reminders.map(r => (
                        <div
                          key={r.id}
                          className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900">{r.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{new Date(r.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Calendar 