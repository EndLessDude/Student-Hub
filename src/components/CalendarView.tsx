import React, { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, isToday, parseISO } from 'date-fns'

interface CalendarItem {
  id: string
  title: string
  date: string // ISO date string
  className?: string
  classColor?: string
  completed?: boolean
  [key: string]: any
}

interface CalendarViewProps {
  items: CalendarItem[]
  dateField: string // Field name to use for date (e.g., 'dueDate', 'examDate', 'dateTime')
  renderItem: (item: CalendarItem, isSelected: boolean) => React.ReactNode
  onItemClick?: (item: CalendarItem) => void
  onDayClick?: (date: Date, items: CalendarItem[]) => void
  onAdd?: (date: Date) => void
  selectedDate?: Date
  classFilter?: string // classId to filter by
  classItems?: { id: string; name: string; color: string }[] // For class filter dropdown
  title?: string
  emptyMessage?: string
}

export function CalendarView({
  items,
  dateField,
  renderItem,
  onItemClick,
  onDayClick,
  onAdd,
  selectedDate,
  classFilter,
  classItems = [],
  emptyMessage = 'No items this month',
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarDate, setSidebarDate] = useState<Date | null>(null)
  const [sidebarItems, setSidebarItems] = useState<CalendarItem[]>([])

  // Filter items by class if classFilter is provided
  const filteredItems = useMemo(() => {
    if (!classFilter) return items
    return items.filter(item => item.classId === classFilter)
  }, [items, classFilter])

  // Group items by date
  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>()
    filteredItems.forEach(item => {
      const dateStr = item[dateField]
      if (dateStr) {
        const date = parseISO(dateStr)
        const key = format(date, 'yyyy-MM-dd')
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(item)
      }
    })
    return map
  }, [filteredItems, dateField])

  // Get days for the calendar grid
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days: Date[] = []
    let day = calendarStart
    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentMonth])

  const handleDayClick = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd')
    const dayItems = itemsByDate.get(key) || []
    
    if (onDayClick) {
      onDayClick(date, dayItems)
    }
    
    if (dayItems.length > 0) {
      setSidebarDate(date)
      setSidebarItems(dayItems)
      setSidebarOpen(true)
    } else if (onAdd) {
      onAdd(date)
    }
  }

  const handleItemClick = (item: CalendarItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onItemClick) {
      onItemClick(item)
    }
  }

  const prevMonth = () => setCurrentMonth(d => addDays(startOfMonth(d), -1))
  const nextMonth = () => setCurrentMonth(d => addDays(startOfMonth(d), 1))
  const goToToday = () => setCurrentMonth(new Date())

  const monthName = format(currentMonth, 'MMMM yyyy')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white min-w-[160px] text-center">
            {monthName}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        {/* Class Filter Dropdown */}
        {classItems.length > 0 && (
          <div className="w-full sm:w-auto">
            <label htmlFor="class-filter" className="sr-only">Filter by class</label>
            <select
              id="class-filter"
              value={classFilter || ''}
              onChange={e => {
                // This will be handled by parent component via prop
                // We dispatch a custom event for the parent to listen to
                window.dispatchEvent(new CustomEvent('class-filter-change', { detail: e.target.value }))
              }}
              className="w-full sm:w-48 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Classes</option>
              {classItems.map(cls => (
                <option key={cls.id} value={cls.id} style={{ borderLeft: `3px solid ${cls.color}` }}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 min-h-[500px]">
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd')
          const dayItems = itemsByDate.get(key) || []
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isTodayDate = isToday(day)

          return (
            <button
              key={key}
              onClick={() => handleDayClick(day)}
              className={`
                relative p-2 min-h-[100px] min-w-0
                border-r border-b border-gray-200 dark:border-gray-700
                ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/30 text-gray-400' : 'bg-white dark:bg-gray-800'}
                ${isTodayDate ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                ${isSelected ? 'ring-2 ring-primary-500 ring-inset' : ''}
                hover:bg-gray-100 dark:hover:bg-gray-700/50
                transition-colors
                flex flex-col
              `}
              style={{ minHeight: '120px' }}
              disabled={dayItems.length === 0 && !onAdd}
            >
              <span className={`
                text-sm font-medium
                ${isTodayDate ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}
                ${!isCurrentMonth ? 'text-gray-400' : ''}
              `}>
                {format(day, 'd')}
              </span>

              {/* Items in this day */}
              <div className="flex-1 overflow-y-auto mt-1 space-y-1 min-h-0">
                {dayItems.slice(0, 4).map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    onClick={e => handleItemClick(item, e)}
                    className={`
                      px-2 py-1 text-xs rounded truncate cursor-pointer
                      ${item.completed ? 'line-through opacity-60' : ''}
                      ${item.classColor ? `bg-[${item.classColor}]/20 border-l-2 border-[${item.classColor}]` : 'bg-gray-100 dark:bg-gray-700'}
                      hover:opacity-80 transition-opacity
                    `}
                    title={item.title}
                  >
                    {item.title}
                  </div>
                ))}
                {dayItems.length > 4 && (
                  <div className="px-2 py-0.5 text-xs text-center text-gray-500 dark:text-gray-400">
                    +{dayItems.length - 4} more
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Sidebar for day details */}
      {sidebarOpen && sidebarDate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-black/50 p-4" onClick={() => setSidebarOpen(false)}>
          <div className="w-full sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl animate-fadeIn max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {format(sidebarDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {sidebarItems.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">{emptyMessage}</p>
              ) : (
                sidebarItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      handleItemClick(item, { stopPropagation: () => {} } as any)
                      setSidebarOpen(false)
                    }}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-colors
                      ${item.classColor ? `bg-[${item.classColor}]/10 border border-[${item.classColor}]/30` : 'bg-gray-50 dark:bg-gray-700/50'}
                      hover:bg-gray-100 dark:hover:bg-gray-700
                    `}
                  >
                    <div className="flex items-start gap-2">
                      {item.classColor && (
                        <div className="w-2 h-2 mt-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.classColor }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className={`
                          font-medium text-sm truncate
                          ${item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}
                        `}>
                          {item.title}
                        </h4>
                        {item.className && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.className}</p>
                        )}
                        {renderItem(item, true)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {onAdd && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    onAdd(sidebarDate!)
                    setSidebarOpen(false)
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  + Add Item
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}