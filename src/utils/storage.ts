import { STORAGE_KEY } from '../constants/assets'
import type { AppSettings } from '../types/assets'

export function loadStoredSettings() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return null

  try {
    return JSON.parse(saved) as Partial<AppSettings>
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function saveStoredSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
