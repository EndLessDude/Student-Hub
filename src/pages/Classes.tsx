import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Link2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCollection } from '../hooks/useCollection'
import { ClassItem } from '../types'
import { EmptyState, ConfirmDialog } from '../components/Shared'
import { LinkIconButton } from '../components/LinkIconButton'
import ClassModal from '../components/modals/ClassModal'

const Classes: React.FC = () => {
  const navigate = useNavigate()
  const { items, loading, addItem, updateItem, deleteItem } = useCollection<ClassItem>('classes')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ClassItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleSave = async (data: Omit<ClassItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) { await updateItem(editingItem.id, data) }
    else { await addItem(data) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add your classes and their links — they'll appear across assignments and exams.
          </p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setModalOpen(true) }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Link2 className="w-10 h-10" />}
          title="No classes yet"
          description="Add your classes to organize assignments, exams, and keep class links in one place."
          action={{ label: 'Add Your First Class', onClick: () => { setEditingItem(null); setModalOpen(true) } }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((cls) => (
              <div
                key={cls.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow group cursor-pointer"
                onClick={() => navigate(`/classes/${cls.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: cls.color }}>
                      {cls.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{cls.name}</h3>
                      <p className="text-xs text-gray-500">{cls.links.length} link{cls.links.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingItem(cls); setModalOpen(true) }}
                      className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                      title="Edit class"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingId(cls.id) }}
                      className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Delete class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {cls.links.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {cls.links.map((link) => (
                      <div key={link.id} className="flex items-center gap-1.5">
                        <LinkIconButton link={link} size="sm" />
                        <span className="text-xs text-gray-500">{link.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No links added</p>
                )}
              </div>
            ))}
        </div>
      )}

      <ClassModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSave={handleSave}
        initial={editingItem}
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Class"
        message="Are you sure you want to delete this class? Associated links will be removed."
        confirmLabel="Delete"
        danger
        onConfirm={async () => { if (deletingId) { await deleteItem(deletingId); setDeletingId(null) } }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}

export default Classes