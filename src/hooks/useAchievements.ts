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
  unlockAchievement: (id: string) => void
}

export function useAchievements(bestEfforts: PersonalRecords): UseAchievementsReturn {
  const { parsedData } = useDataContext()
  const { stories } = useStoriesContext()
  
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([])

  // Load unlocked achievements on mount
  useEffect(() => {
    const loaded = loadUnlockedAchievements()
    setUnlockedIds(loaded)
  }, [])

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
      setNewlyUnlocked(newUnlocked)
      saveUnlockedAchievements(updatedUnlocked)
    }
  }, [parsedData, stories, bestEfforts, unlockedIds])

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
      setNewlyUnlocked(prev => [...prev, id])
      saveUnlockedAchievements(updated)
    }
  }, [unlockedIds])

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([])
  }, [])

  return {
    achievements: ACHIEVEMENTS,
    unlockedIds,
    newlyUnlocked,
    checkAchievements: checkForAchievements,
    clearNewlyUnlocked,
    unlockAchievement
  }
}

