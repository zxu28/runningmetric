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
  // First Steps & Early Milestones
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'You logged your very first run! Every journey begins with a single step. Keep going!',
    emoji: '👣',
    category: 'runs',
    condition: (data) => data.runs.length >= 1
  },
  {
    id: '5-runs-club',
    title: 'Getting Started',
    description: 'You\'ve completed 5 runs! You\'re building a solid foundation. Consistency is key!',
    emoji: '🌱',
    category: 'runs',
    condition: (data) => data.runs.length >= 5
  },
  {
    id: '10-runs-club',
    title: '10 Runs Club',
    description: 'Double digits! You\'ve logged 10 runs. You\'re officially a runner now!',
    emoji: '🏃',
    category: 'runs',
    condition: (data) => data.runs.length >= 10
  },
  {
    id: '25-runs-club',
    title: 'Quarter Century',
    description: '25 runs completed! You\'re building serious momentum. Keep pushing forward!',
    emoji: '💪',
    category: 'runs',
    condition: (data) => data.runs.length >= 25
  },
  {
    id: '50-runs-club',
    title: '50 Runs Club',
    description: 'Half a century of runs! You\'ve shown incredible dedication. This is just the beginning!',
    emoji: '🏃‍♂️',
    category: 'runs',
    condition: (data) => data.runs.length >= 50
  },
  {
    id: '100-runs-club',
    title: 'Century Club',
    description: '100 runs! You\'ve reached a major milestone. Your commitment to running is truly inspiring!',
    emoji: '🏃‍♀️',
    category: 'runs',
    condition: (data) => data.runs.length >= 100
  },
  {
    id: '250-runs-club',
    title: '250 Runs',
    description: '250 runs completed! You\'re in elite territory. Your consistency is remarkable!',
    emoji: '⭐',
    category: 'runs',
    condition: (data) => data.runs.length >= 250
  },
  {
    id: '500-runs-club',
    title: '500 Runs',
    description: '500 runs! You\'re a running legend. Few achieve this level of dedication!',
    emoji: '👑',
    category: 'runs',
    condition: (data) => data.runs.length >= 500
  },
  
  // Distance Milestones
  {
    id: '10-miles',
    title: '10 Miles Total',
    description: 'You\'ve run 10 total miles! Every mile counts. Keep adding to your total!',
    emoji: '📏',
    category: 'milestones',
    condition: (data) => getTotalDistanceMiles(data.runs) >= 10
  },
  {
    id: '50-miles',
    title: '50 Miles Total',
    description: '50 miles completed! You could run from one city to another. Keep going!',
    emoji: '🗺️',
    category: 'milestones',
    condition: (data) => getTotalDistanceMiles(data.runs) >= 50
  },
  {
    id: '100-miles',
    title: '100 Miles',
    description: '100 miles! That\'s like running from New York to Philadelphia. Incredible achievement!',
    emoji: '💯',
    category: 'milestones',
    condition: (data) => getTotalDistanceMiles(data.runs) >= 100
  },
  {
    id: '250-miles',
    title: '250 Miles',
    description: '250 miles total! You\'re covering serious ground. Your dedication is paying off!',
    emoji: '🌟',
    category: 'milestones',
    condition: (data) => getTotalDistanceMiles(data.runs) >= 250
  },
  {
    id: '500-miles',
    title: '500 Miles',
    description: '500 miles! That\'s like running from Boston to Washington DC. You\'re unstoppable!',
    emoji: '🌟',
    category: 'milestones',
    condition: (data) => getTotalDistanceMiles(data.runs) >= 500
  },
  {
    id: '1000-miles',
    title: '1000 Miles',
    description: '1000 miles! You could run across multiple states. This is a legendary achievement!',
    emoji: '🎯',
    category: 'milestones',
    condition: (data) => getTotalDistanceMiles(data.runs) >= 1000
  },
  {
    id: '2500-miles',
    title: '2500 Miles',
    description: '2500 miles! You\'ve run the equivalent of crossing the United States. Absolutely incredible!',
    emoji: '🌎',
    category: 'milestones',
    condition: (data) => getTotalDistanceMiles(data.runs) >= 2500
  },
  
  // Streaks
  {
    id: '3-day-streak',
    title: '3 Day Streak',
    description: 'You ran 3 days in a row! Building consistency is the foundation of success.',
    emoji: '🔥',
    category: 'streaks',
    condition: (data) => getLongestStreak(data.runs) >= 3
  },
  {
    id: '7-day-streak',
    title: 'Week Warrior',
    description: '7 consecutive days of running! You\'ve completed a full week. Your dedication is inspiring!',
    emoji: '🔥',
    category: 'streaks',
    condition: (data) => getLongestStreak(data.runs) >= 7
  },
  {
    id: '14-day-streak',
    title: 'Two Week Champion',
    description: '14 days straight! Two full weeks of consistency. You\'re building unstoppable momentum!',
    emoji: '🔥🔥',
    category: 'streaks',
    condition: (data) => getLongestStreak(data.runs) >= 14
  },
  {
    id: '30-day-streak',
    title: 'Monthly Master',
    description: '30 consecutive days! A full month of running. This level of consistency is extraordinary!',
    emoji: '🔥🔥🔥',
    category: 'streaks',
    condition: (data) => getLongestStreak(data.runs) >= 30
  },
  {
    id: '60-day-streak',
    title: '60 Day Legend',
    description: '60 days in a row! Two full months of running. You\'re in a league of your own!',
    emoji: '🔥🔥🔥🔥',
    category: 'streaks',
    condition: (data) => getLongestStreak(data.runs) >= 60
  },
  {
    id: '100-day-streak',
    title: 'Century Streak',
    description: '100 consecutive days! Over three months of daily running. This is legendary dedication!',
    emoji: '🔥🔥🔥🔥🔥',
    category: 'streaks',
    condition: (data) => getLongestStreak(data.runs) >= 100
  },
  
  // Speed Achievements
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'You\'ve achieved your fastest mile! Speed is impressive, but consistency is everything.',
    emoji: '⚡',
    category: 'milestones',
    condition: (data) => data.bestEfforts.fastestMile !== null
  },
  {
    id: '5k-warrior',
    title: '5K Warrior',
    description: 'You\'ve recorded your fastest 5K! The classic distance that tests both speed and endurance.',
    emoji: '🏃',
    category: 'milestones',
    condition: (data) => data.bestEfforts.fastest5K !== null
  },
  {
    id: '10k-champion',
    title: '10K Champion',
    description: 'You\'ve achieved your fastest 10K! Double the distance, double the challenge, double the achievement!',
    emoji: '🏆',
    category: 'milestones',
    condition: (data) => data.bestEfforts.fastest10K !== null
  },
  
  // Elevation Achievements
  {
    id: 'hill-climber',
    title: 'Hill Climber',
    description: 'You\'ve climbed 1,000 feet total elevation! Hills build strength and character.',
    emoji: '⛰️',
    category: 'milestones',
    condition: (data) => getTotalElevationFeet(data.runs) >= 1000
  },
  {
    id: 'mountain-goat',
    title: 'Mountain Goat',
    description: '10,000 feet of elevation gain! That\'s like climbing Mount Washington. Incredible!',
    emoji: '⛰️',
    category: 'milestones',
    condition: (data) => getTotalElevationFeet(data.runs) >= 10000
  },
  {
    id: 'everest-climber',
    title: 'Everest Climber',
    description: '29,029 feet total elevation! You\'ve climbed the equivalent of Mount Everest. Legendary!',
    emoji: '🏔️',
    category: 'milestones',
    condition: (data) => getTotalElevationFeet(data.runs) >= 29029
  },
  
  // Distance Records
  {
    id: 'half-marathoner',
    title: 'Half Marathoner',
    description: 'You completed a run over 13.1 miles! Half marathon distance is a major achievement!',
    emoji: '🏃',
    category: 'milestones',
    condition: (data) => {
      const HALF_MARATHON_METERS = 21097
      return data.runs.some(run => run.totalDistance >= HALF_MARATHON_METERS)
    }
  },
  {
    id: 'marathoner',
    title: 'Marathoner',
    description: 'You ran over 26.2 miles! The classic marathon distance. You\'re a true endurance athlete!',
    emoji: '🏅',
    category: 'milestones',
    condition: (data) => {
      const MARATHON_DISTANCE_METERS = 42195
      return data.runs.some(run => run.totalDistance >= MARATHON_DISTANCE_METERS)
    }
  },
  {
    id: 'ultra-runner',
    title: 'Ultra Runner',
    description: 'You completed a run over 50 miles! Ultra distance running. You\'re in elite company!',
    emoji: '🏃‍♂️',
    category: 'milestones',
    condition: (data) => {
      const ULTRA_DISTANCE_METERS = 80467
      return data.runs.some(run => run.totalDistance >= ULTRA_DISTANCE_METERS)
    }
  },
  
  // Story Achievements
  {
    id: 'storyteller',
    title: 'Storyteller',
    description: 'You created your first running story! Stories capture the emotion and journey behind your runs.',
    emoji: '📖',
    category: 'stories',
    condition: (data) => data.stories.length >= 1
  },
  {
    id: 'story-collector',
    title: 'Story Collector',
    description: 'You\'ve created 5 stories! You\'re building a beautiful narrative of your running journey.',
    emoji: '📚',
    category: 'stories',
    condition: (data) => data.stories.length >= 5
  },
  {
    id: 'story-master',
    title: 'Story Master',
    description: '10 stories created! You\'re a master storyteller, capturing the essence of your running adventures.',
    emoji: '📚',
    category: 'stories',
    condition: (data) => data.stories.length >= 10
  },
  {
    id: 'story-legend',
    title: 'Story Legend',
    description: '25 stories! You\'ve created an epic collection of running narratives. Your journey is beautifully documented!',
    emoji: '📖',
    category: 'stories',
    condition: (data) => data.stories.length >= 25
  },
  
  // Goal Achievements
  {
    id: 'goal-crusher',
    title: 'Goal Crusher',
    description: 'You completed your first goal! Setting and achieving goals is the path to greatness.',
    emoji: '🎯',
    category: 'milestones',
    condition: () => {
      // This will be checked separately when goals are completed
      // For now, always return false - will be set by GoalsContext
      return false
    }
  },
  {
    id: 'goal-master',
    title: 'Goal Master',
    description: 'You\'ve completed 5 goals! You know how to set targets and achieve them. Keep crushing it!',
    emoji: '🎯',
    category: 'milestones',
    condition: () => false // Will be set by GoalsContext
  },
  
  // Special Achievements
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'You completed a run before 6 AM! Early morning runs show incredible dedication and discipline.',
    emoji: '🌅',
    category: 'milestones',
    condition: (data) => {
      return data.runs.some(run => {
        const hour = run.startTime.getHours()
        return hour < 6
      })
    }
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'You completed a run after 9 PM! Running at night requires special dedication. Impressive!',
    emoji: '🌙',
    category: 'milestones',
    condition: (data) => {
      return data.runs.some(run => {
        const hour = run.startTime.getHours()
        return hour >= 21
      })
    }
  },
  {
    id: 'weekend-warrior',
    title: 'Weekend Warrior',
    description: 'You completed 10 weekend runs! Making the most of your free time. Keep it up!',
    emoji: '🎉',
    category: 'runs',
    condition: (data) => {
      const weekendRuns = data.runs.filter(run => {
        const day = run.startTime.getDay()
        return day === 0 || day === 6 // Sunday or Saturday
      })
      return weekendRuns.length >= 10
    }
  },
  {
    id: 'long-distance-lover',
    title: 'Long Distance Lover',
    description: 'You completed 10 runs over 10 miles! You love the long runs. Endurance is your strength!',
    emoji: '🛣️',
    category: 'milestones',
    condition: (data) => {
      const longRuns = data.runs.filter(run => run.totalDistance >= 16093.4) // 10 miles in meters
      return longRuns.length >= 10
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

