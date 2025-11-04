// Story Insights Utility
// Generates meaningful insights about stories by comparing stats

import { RunningStory } from './storyTypes'
import { GPXData } from './gpxParser'
import { getRunId } from './storyTypes'

export interface StoryInsight {
  type: 'longest_distance' | 'biggest_elevation' | 'most_consistent_pace' | 
        'strongest_emotional' | 'fastest_pace' | 'longest_duration' | 
        'most_runs' | 'longest_span' | 'fastest_improvement'
  emoji: string
  title: string
  description: string
  value?: string | number
}

export interface StoryStats {
  totalDistance: number
  totalDuration: number
  totalElevation: number
  avgPace: number
  runCount: number
  moodTagCount: number
  dateSpan: number // days
  paceVariance: number
  startDate: Date
  endDate: Date
}

// Calculate stats for a story
export function calculateStoryStats(story: RunningStory, runs: GPXData[]): StoryStats {
  const storyRuns = runs.filter(run => story.runIds.includes(getRunId(run)))
  
  if (storyRuns.length === 0) {
    return {
      totalDistance: 0,
      totalDuration: 0,
      totalElevation: 0,
      avgPace: 0,
      runCount: 0,
      moodTagCount: story.moodTags.length,
      dateSpan: 0,
      paceVariance: 0,
      startDate: story.createdAt,
      endDate: story.createdAt,
    }
  }

  const totalDistance = storyRuns.reduce((sum, run) => sum + run.totalDistance, 0)
  const totalDuration = storyRuns.reduce((sum, run) => sum + run.totalDuration, 0)
  const totalElevation = storyRuns.reduce((sum, run) => sum + run.elevationGain, 0)
  const avgPace = totalDistance > 0 
    ? (totalDuration / 60) / (totalDistance / 1609.34) 
    : 0

  // Calculate pace variance
  const paces = storyRuns.map(run => run.avgPace).filter(p => p > 0)
  const paceVariance = paces.length > 1
    ? paces.reduce((sum, pace) => sum + Math.pow(pace - avgPace, 2), 0) / paces.length
    : 0

  // Calculate date span
  const dates = storyRuns.map(run => run.startTime.getTime()).sort((a, b) => a - b)
  const startDate = new Date(dates[0])
  const endDate = new Date(dates[dates.length - 1])
  const dateSpan = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  return {
    totalDistance,
    totalDuration,
    totalElevation,
    avgPace,
    runCount: storyRuns.length,
    moodTagCount: story.moodTags.length,
    dateSpan,
    paceVariance,
    startDate,
    endDate,
  }
}

// Generate insights for a single story compared to all stories
export function generateStoryInsights(
  story: RunningStory,
  allStories: RunningStory[],
  runs: GPXData[]
): StoryInsight[] {
  const insights: StoryInsight[] = []
  const storyStats = calculateStoryStats(story, runs)

  // Skip if no runs
  if (storyStats.runCount === 0) {
    return insights
  }

  // Calculate stats for all stories
  const allStoryStats = allStories.map(s => calculateStoryStats(s, runs))

  // Longest distance
  const longestDistance = allStoryStats.reduce((max, stats) => 
    stats.totalDistance > max ? stats.totalDistance : max, 0
  )
  if (storyStats.totalDistance === longestDistance && longestDistance > 0) {
    insights.push({
      type: 'longest_distance',
      emoji: '🏆',
      title: 'Longest Journey',
      description: `This is your longest story by total distance`,
      value: `${(storyStats.totalDistance / 1609.34).toFixed(1)} miles`
    })
  }

  // Biggest elevation challenge
  const biggestElevation = allStoryStats.reduce((max, stats) => 
    stats.totalElevation > max ? stats.totalElevation : max, 0
  )
  if (storyStats.totalElevation === biggestElevation && biggestElevation > 0) {
    insights.push({
      type: 'biggest_elevation',
      emoji: '💪',
      title: 'Biggest Elevation Challenge',
      description: `This story includes your most elevation gain`,
      value: `${storyStats.totalElevation.toFixed(0)}m`
    })
  }

  // Most consistent pace
  const consistentPaces = allStoryStats.filter(s => s.runCount > 1 && s.paceVariance > 0)
  if (consistentPaces.length > 0) {
    const mostConsistent = consistentPaces.reduce((min, stats) => 
      stats.paceVariance < min.paceVariance ? stats : min
    )
    if (storyStats.paceVariance === mostConsistent.paceVariance && storyStats.runCount > 1) {
      insights.push({
        type: 'most_consistent_pace',
        emoji: '📈',
        title: 'Most Consistent Pace',
        description: `Your runs had the most consistent pacing`,
        value: `Variance: ${storyStats.paceVariance.toFixed(2)} min/mi`
      })
    }
  }

  // Strongest emotional journey
  const strongestEmotional = allStoryStats.reduce((max, stats) => 
    stats.moodTagCount > max ? stats.moodTagCount : max, 0
  )
  if (storyStats.moodTagCount === strongestEmotional && strongestEmotional > 0) {
    insights.push({
      type: 'strongest_emotional',
      emoji: '🎯',
      title: 'Strongest Emotional Journey',
      description: `This story captures your most emotional running experience`,
      value: `${storyStats.moodTagCount} mood tags`
    })
  }

  // Fastest average pace
  const fastestPaces = allStoryStats.filter(s => s.avgPace > 0)
  if (fastestPaces.length > 0) {
    const fastest = fastestPaces.reduce((min, stats) => 
      stats.avgPace < min.avgPace ? stats : min
    )
    if (storyStats.avgPace === fastest.avgPace && storyStats.avgPace > 0) {
      insights.push({
        type: 'fastest_pace',
        emoji: '🏃',
        title: 'Fastest Story',
        description: `Your fastest average pace across all stories`,
        value: `${storyStats.avgPace.toFixed(2)} min/mi`
      })
    }
  }

  // Longest duration
  const longestDuration = allStoryStats.reduce((max, stats) => 
    stats.totalDuration > max ? stats.totalDuration : max, 0
  )
  if (storyStats.totalDuration === longestDuration && longestDuration > 0) {
    insights.push({
      type: 'longest_duration',
      emoji: '⏱️',
      title: 'Longest Running Time',
      description: `Your longest total running time`,
      value: `${Math.round(storyStats.totalDuration / 60)} minutes`
    })
  }

  // Most runs
  const mostRuns = allStoryStats.reduce((max, stats) => 
    stats.runCount > max ? stats.runCount : max, 0
  )
  if (storyStats.runCount === mostRuns && mostRuns > 1) {
    insights.push({
      type: 'most_runs',
      emoji: '📚',
      title: 'Most Runs Combined',
      description: `This story combines the most individual runs`,
      value: `${storyStats.runCount} runs`
    })
  }

  // Longest date span
  const longestSpan = allStoryStats.reduce((max, stats) => 
    stats.dateSpan > max ? stats.dateSpan : max, 0
  )
  if (storyStats.dateSpan === longestSpan && longestSpan > 0) {
    insights.push({
      type: 'longest_span',
      emoji: '📅',
      title: 'Longest Time Span',
      description: `This story spans the longest period of time`,
      value: `${storyStats.dateSpan} days`
    })
  }

  return insights
}

// Get top insight (most impressive)
export function getTopInsight(insights: StoryInsight[]): StoryInsight | null {
  if (insights.length === 0) return null

  // Priority order for insights
  const priority: Record<string, number> = {
    longest_distance: 1,
    biggest_elevation: 2,
    fastest_pace: 3,
    strongest_emotional: 4,
    most_consistent_pace: 5,
    most_runs: 6,
    longest_span: 7,
    longest_duration: 8,
  }

  return insights.sort((a, b) => {
    const aPriority = priority[a.type] || 99
    const bPriority = priority[b.type] || 99
    return aPriority - bPriority
  })[0]
}

