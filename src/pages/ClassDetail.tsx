import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCollection } from '../hooks/useCollection'
import { Assignment, Exam, ClassItem } from '../types'
import { Plus, ExternalLink, BookOpen, Target, Link as LinkIcon } from 'lucide-react'
import { isOverdue } from '../utils'
import { CLASS_COLORS } from '../types'
import { format, parseISO } from 'date-fns'

interface ClassDetailPageProps {
  classId: string
}

function ClassDetailContent({ classId }: ClassDetailPageProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'assignments' | 'exams' | 'links'>('assignments')
  const [classItem, setClassItem] = useState<ClassItem | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch class data
  const { items: classes, loading: classesLoading } = useCollection<ClassItem>('classes')
  
  // Fetch assignments for this class
  const { items: allAssignments } = useCollection<Assignment>('assignments')
  
  // Fetch exams for this class
  const { items: allExams } = useCollection<Exam>('exams')

  // Filter assignments and exams for this class
  const assignments = allAssignments.filter(a => a.classId === classId || a.className === classItem?.name)
  const exams = allExams.filter(e => e.classId === classId || e.className === classItem?.name)

  // Find the class item
  useEffect(() => {
    if (classes.length > 0) {
      const found = classes.find(c => c.id === classId)
      if (found) {
        setClassItem(found)
      }
    }
    setLoading(false)
  }, [classes, classId])

  if (loading || classesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!classItem) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Class not found</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">This class may have been deleted.</p>
        <button
          onClick={() => navigate('/classes')}
          className="mt-4 px-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
        >
          Back to Classes
        </button>
      </div>
    )
  }

  const classColor = classItem.color || CLASS_COLORS[0]

  // Sort assignments by due date
  const sortedAssignments = [...assignments].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  // Sort exams by exam date
  const sortedExams = [...exams].sort((a, b) => 
    new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  )

  const handleNewAssignment = () => {
    navigate('/assignments', { state: { prefillClassId: classId, prefillClassName: classItem.name } })
  }

  const handleNewExam = () => {
    navigate('/exams', { state: { prefillClassId: classId, prefillClassName: classItem.name } })
  }

  return (
    <div className="animate-fadeIn">
      {/* Class Header */}
      <div className="mb-6 p-6 rounded-2xl" style={{ background: `linear-gradient(135deg, ${classColor}15, ${classColor}05)` }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: classColor }}
            >
              {classItem.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{classItem.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {assignments.length} assignments • {exams.length} exams • {classItem.links.length} links
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleNewAssignment}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Assignment
            </button>
            <button
              onClick={handleNewExam}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Exam
            </button>
          </div>
        </div>

        {/* Class Links - Quick Access */}
        {classItem.links.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Quick Links</h3>
            <div className="flex flex-wrap gap-2">
              {classItem.links.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  style={{ borderLeftColor: classColor, borderLeftWidth: '3px' }}
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{link.title}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-1" aria-label="Class detail tabs">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'assignments'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-1" />
            Assignments ({assignments.length})
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'exams'
                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-b-2 border-orange-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Target className="w-4 h-4 inline mr-1" />
            Exams ({exams.length})
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'links'
                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <LinkIcon className="w-4 h-4 inline mr-1" />
            Links ({classItem.links.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'assignments' && (
          <div>
            {sortedAssignments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No assignments yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Create your first assignment for this class</p>
                <button
                  onClick={handleNewAssignment}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add Assignment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedAssignments.map(assignment => (
                  <div
                    key={assignment.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      assignment.completed
                        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                        : isOverdue(assignment.dueDate) && !assignment.completed
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${classColor}20` }}>
                        <BookOpen className="w-5 h-5" style={{ color: classColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium truncate ${assignment.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {assignment.title}
                          </h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            assignment.completed
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : isOverdue(assignment.dueDate)
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {assignment.completed ? 'Completed' : isOverdue(assignment.dueDate) ? 'Overdue' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Due {format(parseISO(assignment.dueDate), 'MMM d, yyyy')}
                          </span>
                          {assignment.notes && (
            <span className="flex items-center gap-1 truncate max-w-[200px]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="truncate">{assignment.notes}</span>
            </span>
                          )}
                        </div>
                        {assignment.links.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {assignment.links.slice(0, 3).map((link, idx) => (
                              <a
                                key={idx}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Link {idx + 1}
                              </a>
                            ))}
                            {assignment.links.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">+{assignment.links.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'exams' && (
          <div>
            {sortedExams.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No exams yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Create your first exam for this class</p>
                <button
                  onClick={handleNewExam}
                  className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Add Exam
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedExams.map(exam => (
                  <div
                    key={exam.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      exam.completed
                        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                        : isOverdue(exam.examDate) && !exam.completed
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
                        <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium truncate ${exam.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {exam.title}
                          </h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            exam.completed
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : isOverdue(exam.examDate)
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                          }`}>
                            {exam.completed ? 'Completed' : isOverdue(exam.examDate) ? 'Overdue' : 'Upcoming'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Exam {format(parseISO(exam.examDate), 'MMM d, yyyy')}
                          </span>
                          {exam.objectives.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {exam.objectives.filter(o => o.completed).length}/{exam.objectives.length} objectives
                            </span>
                          )}
                        </div>
                        {exam.studyResources.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {exam.studyResources.slice(0, 3).map((resource) => (
                              <a
                                key={resource.id}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                              >
                                <BookOpen className="w-3 h-3" />
                                {resource.title}
                              </a>
                            ))}
                            {exam.studyResources.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">+{exam.studyResources.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div>
            {classItem.links.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <LinkIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No links yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Add links from the Classes page</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classItem.links.map(link => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors group"
                    style={{ borderLeftColor: classColor, borderLeftWidth: '3px' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: classColor }}>
                        {getLinkIcon(link.iconType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {link.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{link.url}</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function getLinkIcon(type: string) {
  switch (type) {
    case 'canvas':
      return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
    case 'google-classroom':
      return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
    case 'gmail':
      return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
    case 'outlook':
      return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
    case 'genesis':
      return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
    default:
      return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
  }
}

export default function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>()
  
  if (!classId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Invalid class ID</h2>
      </div>
    )
  }

  return <ClassDetailContent classId={classId} />
}