import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { ClassItem, ClassLink, CLASS_COLORS } from '../../types'
import { LinkIconButton, LinkIconSelect } from '../LinkIconButton'

type FormData = Omit<ClassItem, 'id' | 'createdAt' | 'updatedAt'>

interface ClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: FormData) => Promise<void>
  initial?: ClassItem | null
}

const genId = () => Math.random().toString(36).slice(2, 9)

const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, onSave, initial }) => {
  const [name, setName] = useState('')
  const [color, setColor] = useState(CLASS_COLORS[5])
  const [links, setLinks] = useState<ClassLink[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        setName(initial.name)
        setColor(initial.color)
        setLinks([...initial.links])
      } else {
        setName('')
        setColor(CLASS_COLORS[5])
        setLinks([])
      }
      setError('')
    }
  }, [isOpen, initial])

  const addLink = () => {
    setLinks([...links, { id: genId(), title: '', url: '', iconType: 'link' }])
  }

  const updateLink = (id: string, field: keyof ClassLink, value: string) => {
    setLinks(links.map((l) => l.id === id ? { ...l, [field]: value } : l))
  }

  const removeLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Class name is required'); return }
    try {
      setLoading(true)
      setError('')
      await onSave({
        name: name.trim(),
        color,
        links: links.filter((l) => l.title.trim() !== '' && l.url.trim() !== ''),
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
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial ? 'Edit Class' : 'New Class'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Class Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Biology, Calculus II"
                className="input-field"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {CLASS_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Class Links</label>
                <button
                  type="button"
                  onClick={addLink}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add link
                </button>
              </div>

              {links.length === 0 && (
                <p className="text-sm text-gray-400 py-2">No links added yet. Click "Add link" above.</p>
              )}

              <div className="space-y-3">
                {links.map((link) => (
                  <div key={link.id} className="p-3 bg-gray-50 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <LinkIconButton link={link} size="sm" />
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                        placeholder="Link title (e.g. Canvas)"
                        className="input-field flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(link.id)}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                      placeholder="https://..."
                      className="input-field"
                    />
                    <LinkIconSelect
                      value={link.iconType}
                      onChange={(v) => updateLink(link.id, 'iconType', v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors">
              {loading ? 'Saving...' : initial ? 'Save Changes' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClassModal