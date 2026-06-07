import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

type CollectionName = 'assignments' | 'exams' | 'reminders' | 'classes' | 'globalLinks'

export function useCollection<
  T extends { id: string; createdAt: string; updatedAt: string }
>(collectionName: CollectionName) {
  const { currentUser } = useAuth()
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser) { setItems([]); setLoading(false); return }

    const colRef = collection(db, 'users', currentUser.uid, collectionName)
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const data = snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() })) as T[]
        setItems(data)
        setLoading(false)
      },
      (err) => { console.error('Firestore error:', err); setError(err.message); setLoading(false) }
    )
    return unsub
  }, [currentUser, collectionName])

  const addItem = async (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!currentUser) throw new Error('Not authenticated')
    const now = new Date().toISOString()
    const colRef = collection(db, 'users', currentUser.uid, collectionName)
    const ref = await addDoc(colRef, { ...data, createdAt: now, updatedAt: now })
    return ref.id
  }

  const updateItem = async (id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> => {
    if (!currentUser) throw new Error('Not authenticated')
    const ref = doc(db, 'users', currentUser.uid, collectionName, id)
    await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() })
  }

  const deleteItem = async (id: string): Promise<void> => {
    if (!currentUser) throw new Error('Not authenticated')
    const ref = doc(db, 'users', currentUser.uid, collectionName, id)
    await deleteDoc(ref)
  }

  return { items, loading, error, addItem, updateItem, deleteItem }
}