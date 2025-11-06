// Goal Storage Utilities for localStorage persistence

import { RunningGoal } from './goalTypes'

const STORAGE_KEY = 'running-metrics-goals'

// Serialize goal (convert Date objects to ISO strings)
function serializeGoal(goal: RunningGoal): any {
  return {
    ...goal,
    startDate: goal.startDate.toISOString(),
    endDate: goal.endDate.toISOString(),
    completedAt: goal.completedAt?.toISOString(),
  }
}

// Deserialize goal (convert ISO strings back to Date objects)
function deserializeGoal(data: any): RunningGoal {
  return {
    ...data,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
  }
}

// Save goals to localStorage
export function saveGoals(goals: RunningGoal[]): void {
  try {
    const serialized = goals.map(serializeGoal)
    const dataStr = JSON.stringify(serialized)
    const dataSizeMB = (dataStr.length / 1024 / 1024).toFixed(2)
    
    console.log(`Saving ${goals.length} goals to localStorage (${dataSizeMB} MB)`)
    
    // Check localStorage quota before saving
    const quotaEstimate = 5 * 1024 * 1024 // ~5MB typical limit
    if (dataStr.length > quotaEstimate * 0.9) {
      console.warn(`⚠️ Warning: Goals data size (${dataSizeMB} MB) is approaching localStorage limit`)
    }
    
    localStorage.setItem(STORAGE_KEY, dataStr)
  } catch (error) {
    console.error('Failed to save goals to localStorage:', error)
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please delete some goals or runs to free up space.')
    }
    throw error
  }
}

// Load goals from localStorage
export function loadGoals(): RunningGoal[] {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY)
    if (!storedData) {
      return []
    }
    
    const parsed = JSON.parse(storedData)
    if (!Array.isArray(parsed)) {
      console.warn('Invalid goals data in localStorage, returning empty array')
      return []
    }
    
    return parsed.map(deserializeGoal)
  } catch (error) {
    console.error('Failed to load goals from localStorage:', error)
    return []
  }
}

// Clear all goals
export function clearGoals(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('Goals cleared from localStorage')
  } catch (error) {
    console.error('Failed to clear goals from localStorage:', error)
  }
}

