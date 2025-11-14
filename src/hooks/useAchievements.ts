// Custom Hook for Managing Achievements

import { useState, useEffect, useCallback } from 'react'
import { useDataContext } from '../contexts/DataContext'
import { useStoriesContext } from '../contexts/StoriesContext'
import { PersonalRecords } from '../utils/metrics'
import {
  Achievement,
  AchievementData,
  checkAchievements,
  ACHIEVEMENTS
} from '../utils/achievements'

const STORAGE_KEY = 'running-metrics-achievements'

// Load unlocked achievements from localStorage
function loadUnlockedAchievements(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (error) {
    console.error('Failed to load achievements:', error)
  }
  return []
}

// Save unlocked achievements to localStorage
function saveUnlockedAchievements(unlockedIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedIds))
  } catch (error) {
    console.error('Failed to save achievements:', error)
  }
}

export interface UseAchievementsReturn {
  achievements: Achievement[]
  unlockedIds: string[]
  newlyUnlocked: string[]
  checkAchievements: () => void
  clearNewlyUnlocked: () => void
  dismissAchievement: (id: string) => void
  unlockAchievement: (id: string) => void
}

export function useAchievements(bestEfforts: PersonalRecords): UseAchievementsReturn {
  const { parsedData } = useDataContext()
  const { stories } = useStoriesContext()
  
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([])
  const [shownAchievements, setShownAchievements] = useState<Set<string>>(new Set())

  // Save shown achievements to localStorage (helper function)
  const saveShownAchievements = useCallback((shown: Set<string>) => {
    try {
      localStorage.setItem('running-metrics-shown-achievements', JSON.stringify(Array.from(shown)))
    } catch (error) {
      console.error('Failed to save shown achievements:', error)
    }
  }, [])

  // Load unlocked achievements on mount
  useEffect(() => {
    const loaded = loadUnlockedAchievements()
    setUnlockedIds(loaded)
    // Load shown achievements from localStorage
    try {
      const shown = localStorage.getItem('running-metrics-shown-achievements')
      if (shown) {
        const parsed = JSON.parse(shown)
        if (Array.isArray(parsed)) {
          setShownAchievements(new Set(parsed))
        }
      } else {
        // If no shown achievements stored, mark all currently unlocked as shown
        // (they were unlocked before this feature was added)
        if (loaded.length > 0) {
          const shownSet = new Set(loaded)
          setShownAchievements(shownSet)
          saveShownAchievements(shownSet)
        }
      }
    } catch (error) {
      console.error('Failed to load shown achievements:', error)
      // On error, mark all currently unlocked as shown to prevent showing old achievements
      if (loaded.length > 0) {
        const shownSet = new Set(loaded)
        setShownAchievements(shownSet)
        saveShownAchievements(shownSet)
      }
    }
  }, [saveShownAchievements])

  // Check for new achievements
  const checkForAchievements = useCallback(() => {
    const achievementData: AchievementData = {
      runs: parsedData,
      stories: stories,
      bestEfforts: bestEfforts
    }

    const newUnlocked = checkAchievements(achievementData, unlockedIds)
    
    if (newUnlocked.length > 0) {
      const updatedUnlocked = [...unlockedIds, ...newUnlocked]
      setUnlockedIds(updatedUnlocked)
      saveUnlockedAchievements(updatedUnlocked)
      
      // Only add to newlyUnlocked if they haven't been shown before
      const trulyNew = newUnlocked.filter(id => !shownAchievements.has(id))
      if (trulyNew.length > 0) {
        // Mark these as shown IMMEDIATELY before adding to newlyUnlocked
        // This prevents them from being added again if checkForAchievements runs again
        const updatedShown = new Set([...shownAchievements, ...trulyNew])
        setShownAchievements(updatedShown)
        saveShownAchievements(updatedShown)
        
        // Only add to newlyUnlocked if they're not already in the array
        setNewlyUnlocked(prev => {
          const existing = new Set(prev)
          const toAdd = trulyNew.filter(id => !existing.has(id))
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev
        })
      }
    }
  }, [parsedData, stories, bestEfforts, unlockedIds, shownAchievements, saveShownAchievements])

  // Auto-check when data changes
  useEffect(() => {
    if (parsedData.length > 0 || stories.length > 0) {
      checkForAchievements()
    }
  }, [parsedData.length, stories.length, checkForAchievements])

  // Manual unlock function (for goal completion, etc.)
  const unlockAchievement = useCallback((id: string) => {
    if (!unlockedIds.includes(id)) {
      const updated = [...unlockedIds, id]
      setUnlockedIds(updated)
      saveUnlockedAchievements(updated)
      
      // Only add to newlyUnlocked if it hasn't been shown before
      if (!shownAchievements.has(id)) {
        setNewlyUnlocked(prev => [...prev, id])
        const updatedShown = new Set([...shownAchievements, id])
        setShownAchievements(updatedShown)
        saveShownAchievements(updatedShown)
      }
    }
  }, [unlockedIds, shownAchievements, saveShownAchievements])

  const clearNewlyUnlocked = useCallback(() => {
    // Clear the newly unlocked array - achievements are already marked as shown
    // so they won't appear again even if checkForAchievements runs
    setNewlyUnlocked([])
  }, [])

  const dismissAchievement = useCallback((id: string) => {
    // Remove a specific achievement from newlyUnlocked
    // Achievements are already marked as shown, so they won't reappear
    setNewlyUnlocked(prev => prev.filter(achievementId => achievementId !== id))
  }, [])

  return {
    achievements: ACHIEVEMENTS,
    unlockedIds,
    newlyUnlocked,
    checkAchievements: checkForAchievements,
    clearNewlyUnlocked,
    dismissAchievement,
    unlockAchievement
  }
}

