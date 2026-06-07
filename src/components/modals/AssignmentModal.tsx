import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Assignment } from '../../types'
import { useCollection } from '../../hooks/useCollection'
import { ClassItem } from '../../types'

type FormData = Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>

interface AssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: FormData) => Promise<void>
  initial?: Assignment | null
  prefillDate?: string
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen, onClose, onSave, initial, prefillDate,
}) => {
  const { items: classes } = useCollection<ClassItem>('classes')

  const [title, setTitle] = useState('')
  const [className, setClassName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [links, setLinks] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showClassSuggestions, setShowClassSuggestions] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        setTitle(initial.title)
        setClassName(initial.className)
        setDueDate(initial.dueDate)
        setNotes(initial.notes)
        setLinks(initial.links.length > 0 ? [...initial.links] : [''])
      } else {
        setTitle('')
        setClassName('')
        setDueDate(prefillDate ?? '')
        setNotes('')
        setLinks([''])
      }
      setError('')
    }
  }, [isOpen, initial, prefillDate])

  const classNameSuggestions = classes.filter((c) =>
    c.name.toLowerCase().includes(className.toLowerCase()) && className.length > 0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    if (!dueDate) { setError('Due date is required'); return }
    try {
      setLoading(true)
      setError('')
      await onSave({
        title: title.trim(),
        className: className.trim(),
        dueDate,
        notes: notes.trim(),
        links: links.filter((l) => l.trim() !== ''),
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial ? 'Edit Assignment' : 'New Assignment'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Linear Algebra Problem Set"
                className="input-field"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => { setClassName(e.target.value); setShowClassSuggestions(true) }}
                  onBlur={() => setTimeout(() => setShowClassSuggestions(false), 150)}
                  placeholder="e.g. Math 201"
                  className="input-field"
                />
                {showClassSuggestions && classNameSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                    {classNameSuggestions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={() => { setClassName(c.name); setShowClassSuggestions(false) }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date *</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any details or instructions..."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Resources</label>
                <button
                  type="button"
                  onClick={() => setLinks([...links, ''])}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add link
                </button>
              </div>
              <div className="space-y-2">
                {links.map((link, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => {
                        const updated = [...links]
                        updated[idx] = e.target.value
                        setLinks(updated)
                      }}
                      placeholder="https://..."
                      className="input-field"
                    />
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setLinks(links.filter((_, i) => i !== idx))}
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

          <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors">
              {loading ? 'Saving...' : initial ? 'Save Changes' : 'Add Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssignmentModal