import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { GlobalLink, LinkIconType } from '../../types'
import { LinkIconButton, LinkIconSelect } from '../LinkIconButton'

type FormData = Omit<GlobalLink, 'id' | 'createdAt' | 'updatedAt'>

interface GlobalLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: FormData) => Promise<void>
  initial?: GlobalLink | null
}

const GlobalLinkModal: React.FC<GlobalLinkModalProps> = ({ isOpen, onClose, onSave, initial }) => {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [iconType, setIconType] = useState<LinkIconType>('link')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        setTitle(initial.title)
        setUrl(initial.url)
        setIconType(initial.iconType)
      } else {
        setTitle('')
        setUrl('')
        setIconType('link')
      }
      setError('')
    }
  }, [isOpen, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    if (!url.trim()) { setError('URL is required'); return }
    try {
      setLoading(true)
      setError('')
      await onSave({ title: title.trim(), url: url.trim(), iconType })
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial ? 'Edit Quick Link' : 'New Quick Link'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <div className="flex items-center gap-3">
              <LinkIconButton link={{ id: '', title, url, iconType }} size="md" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Parent Portal"
                  className="input-field"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">URL *</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon</label>
              <LinkIconSelect value={iconType} onChange={setIconType} />
            </div>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors">
              {loading ? 'Saving...' : initial ? 'Save Changes' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GlobalLinkModal