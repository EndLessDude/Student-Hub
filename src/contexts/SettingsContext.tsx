import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { UserSettings, DEFAULT_SETTINGS } from '../types'

interface SettingsContextType {
  settings: UserSettings
  loading: boolean
  saveSettings: (s: UserSettings) => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}

function applySettingsToDOM(s: UserSettings) {
  const html = document.documentElement
  const fontMap: Record<string, string> = { small: '87.5%', normal: '100%', large: '112.5%' }
  html.style.fontSize = fontMap[s.fontSize] ?? '100%'
  html.setAttribute('data-density', s.density)
  html.setAttribute('data-theme', s.theme)
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const ref = doc(db, 'users', currentUser.uid, 'preferences', 'settings')
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) {
          const loaded = { ...DEFAULT_SETTINGS, ...snap.data() } as UserSettings
          setSettings(loaded)
          applySettingsToDOM(loaded)
        } else {
          applySettingsToDOM(DEFAULT_SETTINGS)
        }
        setLoading(false)
      })
      .catch(() => {
        applySettingsToDOM(DEFAULT_SETTINGS)
        setLoading(false)
      })
  }, [currentUser])

  const saveSettings = useCallback(
    async (s: UserSettings) => {
      if (!currentUser) return
      const ref = doc(db, 'users', currentUser.uid, 'preferences', 'settings')
      await setDoc(ref, s)
      setSettings(s)
      applySettingsToDOM(s)
    },
    [currentUser]
  )

  return (
    <SettingsContext.Provider value={{ settings, loading, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
