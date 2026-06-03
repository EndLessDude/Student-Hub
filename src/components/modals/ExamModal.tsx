import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Exam, ExamObjective, StudyResource } from '../../types'

type FormData = Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>

interface ExamModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: FormData) => Promise<void>
  initial?: Exam | null
}

const genId = () => Math.random().toString(36).slice(2, 9)

const ExamModal: React.FC<ExamModalProps> = ({ isOpen, onClose, onSave, initial }) => {
  const [title, setTitle] = useState('')
  const [className, setClassName] = useState('')
  const [examDate, setExamDate] = useState('')
  const [objectives, setObjectives] = useState<ExamObjective[]>([{ id: genId(), text: '', completed: false }])
  const [resources, setResources] = useState<StudyResource[]>([{ id: genId(), title: '', url: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        setTitle(initial.title)
        setClassName(initial.className)
        setExamDate(initial.examDate)
        setObjectives(initial.objectives.length > 0 ? [...initial.objectives] : [{ id: genId(), text: '', completed: false }])
        setResources(initial.studyResources.length > 0 ? [...initial.studyResources] : [{ id: genId(), title: '', url: '' }])
      } else {
        setTitle('')
        setClassName('')
        setExamDate('')
        setObjectives([{ id: genId(), text: '', completed: false }])
        setResources([{ id: genId(), title: '', url: '' }])
      }
      setError('')
    }
  }, [isOpen, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    if (!examDate) { setError('Exam date is required'); return }

    try {
      setLoading(true)
      setError('')
      await onSave({
        title: title.trim(),
        className: className.trim(),
        examDate,
        objectives: objectives.filter((o) => o.text.trim() !== ''),
        studyResources: resources.filter((r) => r.title.trim() !== '' || r.url.trim() !== ''),
        completed: initial?.completed ?? false,
      })
      onClose()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial ? 'Edit Exam' : 'New Exam'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Calculus II Midterm"
                className="input-field"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Math 102"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Exam Date *</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Study Objectives</label>
                <button
                  type="button"
                  onClick={() => setObjectives([...objectives, { id: genId(), text: '', completed: false }])}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add objective
                </button>
              </div>
              <div className="space-y-2">
                {objectives.map((obj) => (
                  <div key={obj.id} className="flex gap-2">
                    <input
                      type="text"
                      value={obj.text}
                      onChange={(e) =>
                        setObjectives(objectives.map((o) => o.id === obj.id ? { ...o, text: e.target.value } : o))
                      }
                      placeholder="e.g. Integration by parts"
                      className="input-field"
                    />
                    {objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setObjectives(objectives.filter((o) => o.id !== obj.id))}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Study Resources</label>
                <button
                  type="button"
                  onClick={() => setResources([...resources, { id: genId(), title: '', url: '' }])}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add resource
                </button>
              </div>
              <div className="space-y-2">
                {resources.map((res) => (
                  <div key={res.id} className="flex gap-2">
                    <input
                      type="text"
                      value={res.title}
                      onChange={(e) =>
                        setResources(resources.map((r) => r.id === res.id ? { ...r, title: e.target.value } : r))
                      }
                      placeholder="Title"
                      className="input-field"
                    />
                    <input
                      type="url"
                      value={res.url}
                      onChange={(e) =>
                        setResources(resources.map((r) => r.id === res.id ? { ...r, url: e.target.value } : r))
                      }
                      placeholder="https://..."
                      className="input-field"
                    />
                    {resources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setResources(resources.filter((r) => r.id !== res.id))}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors">
              {loading ? 'Saving...' : initial ? 'Save Changes' : 'Add Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExamModal