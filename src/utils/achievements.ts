// Achievement System - Definitions and Condition Checking

import { GPXData } from './gpxParser'
import { RunningStory } from './storyTypes'
import { PersonalRecords } from './metrics'

export interface AchievementData {
  runs: GPXData[]
  stories: RunningStory[]
  bestEfforts: PersonalRecords
}

export type AchievementCategory = 'runs' | 'stories' | 'streaks' | 'milestones'

export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  condition: (data: AchievementData) => boolean
  category: AchievementCategory
}

// Helper function to calculate total distance in miles
function getTotalDistanceMiles(runs: GPXData[]): number {
  return runs.reduce((sum, run) => sum + run.totalDistance, 0) / 1609.34
}

// Helper function to calculate longest streak
function getLongestStreak(runs: GPXData[]): number {
  if (runs.length === 0) return 0
  
  // Sort runs by date
  const sortedRuns = [...runs].sort((a, b) => 
    a.startTime.getTime() - b.startTime.getTime()
  )
  
  // Group runs by date (ignore time, just date)
  const runsByDate = new Map<string, GPXData[]>()
  sortedRuns.forEach(run => {
    const dateKey = run.startTime.toISOString().split('T')[0]
    if (!runsByDate.has(dateKey)) {
      runsByDate.set(dateKey, [])
    }
    runsByDate.get(dateKey)!.push(run)
  })
  
  const dates = Array.from(runsByDate.keys()).sort()
  if (dates.length === 0) return 0
  
  let longestStreak = 1
  let currentStreak = 1
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1])
    const currDate = new Date(dates[i])
    const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 1) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }
  
  return longestStreak
}

// Helper function to calculate total elevation gain in feet
function getTotalElevationFeet(runs: GPXData[]): number {
  return runs.reduce((sum, run) => sum + run.elevationGain, 0) * 3.28084
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Logged your first run',
    emoji: '👣',
    category: 'runs',
    condition: (data) => data.runs.length >= 1
  },
  {
    id: 'storyteller',
    title: 'Storyteller',
    description: 'Created your first story',
    emoji: '📖',
    category: 'stories',
    condition: (data) => data.stories.length >= 1
  },
  {
    id: '10-runs-club',
    title: '10 Runs Club',
    description: 'Logged 10 runs',
    emoji: '🏃',
    category: 'runs',
    condition: (data) => data.runs.length >= 10
  },
  {
    id: '50-runs-club',
    title: '50 Runs Club',
    description: 'Logged 50 runs',
    emoji: '🏃‍♂️',
    category: 'runs',
    condition: (data) => data.runs.length >= 50
  },
  {
    id: '100-runs-club',
    title: '100 Runs Club',
    description: 'Logged 100 runs',
    emoji: '🏃‍♀️',
    category: 'runs',
    condition: (data) => data.runs.length >= 100
  },
  {
    id: '100-miles',
    title: '100 Miles',
    description: 'Ran 100 total miles',
    emoji: '💯',
    category: 'milestones',
    condition: (data) => getTotalDistanceMiles(data.runs) >= 100
  },
  {
    id: '500-miles',
    title: '500 Miles',
    description: 'Ran 500 total miles',
    emoji: '🌟',
    category: 'milestones',
    condition: (data) => getTotalDistanceMiles(data.runs) >= 500
  },
  {
    id: '1000-miles',
    title: '1000 Miles',
    description: 'Ran 1000 total miles',
    emoji: '🎯',
    category: 'milestones',
    condition: (data) => getTotalDistanceMiles(data.runs) >= 1000
  },
  {
    id: '7-day-streak',
    title: '7 Day Streak',
    description: 'Ran for 7 consecutive days',
    emoji: '🔥',
    category: 'streaks',
    condition: (data) => getLongestStreak(data.runs) >= 7
  },
  {
    id: '30-day-streak',
    title: '30 Day Streak',
    description: 'Ran for 30 consecutive days',
    emoji: '🔥🔥',
    category: 'streaks',
    condition: (data) => getLongestStreak(data.runs) >= 30
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Achieved your fastest mile',
    emoji: '⚡',
    category: 'milestones',
    condition: (data) => data.bestEfforts.fastestMile !== null
  },
  {
    id: 'mountain-goat',
    title: 'Mountain Goat',
    description: 'Climbed 10,000 feet total elevation',
    emoji: '⛰️',
    category: 'milestones',
    condition: (data) => getTotalElevationFeet(data.runs) >= 10000
  },
  {
    id: 'goal-crusher',
    title: 'Goal Crusher',
    description: 'Completed your first goal',
    emoji: '🎯',
    category: 'milestones',
    condition: (data) => {
      // This will be checked separately when goals are completed
      // For now, always return false - will be set by GoalsContext
      return false
    }
  },
  {
    id: 'story-master',
    title: 'Story Master',
    description: 'Created 10 stories',
    emoji: '📚',
    category: 'stories',
    condition: (data) => data.stories.length >= 10
  },
  {
    id: 'marathoner',
    title: 'Marathoner',
    description: 'Completed a run over 26.2 miles',
    emoji: '🏅',
    category: 'milestones',
    condition: (data) => {
      const MARATHON_DISTANCE_METERS = 42195
      return data.runs.some(run => run.totalDistance >= MARATHON_DISTANCE_METERS)
    }
  }
]

// Check which achievements should be unlocked based on current data
export function checkAchievements(
  data: AchievementData,
  unlockedIds: string[]
): string[] {
  const newlyUnlocked: string[] = []
  
  ACHIEVEMENTS.forEach(achievement => {
    // Skip if already unlocked
    if (unlockedIds.includes(achievement.id)) {
      return
    }
    
    // Check condition
    if (achievement.condition(data)) {
      newlyUnlocked.push(achievement.id)
    }
  })
  
  return newlyUnlocked
}

// Get achievement by ID
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(achievement => achievement.id === id)
}

// Get achievements by category
export function getAchievementsByCategory(
  category: AchievementCategory
): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => achievement.category === category)
}

// Get all unlocked achievements
export function getUnlockedAchievements(unlockedIds: string[]): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => unlockedIds.includes(achievement.id))
}

// Get all locked achievements
export function getLockedAchievements(unlockedIds: string[]): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => !unlockedIds.includes(achievement.id))
}

