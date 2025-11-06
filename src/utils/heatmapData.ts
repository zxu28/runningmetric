// Heatmap Data Processing Utilities

import { GPXData } from './gpxParser'

export interface HeatmapData {
  date: Date
  value: number // distance in miles or count
  runs: GPXData[]
}

// Process runs into heatmap data (aggregated by date)
export function processHeatmapData(runs: GPXData[]): HeatmapData[] {
  if (runs.length === 0) {
    return []
  }

  // Group runs by date (ignore time, just date)
  const runsByDate = new Map<string, { runs: GPXData[]; totalDistance: number }>()

  runs.forEach(run => {
    const dateKey = run.startTime.toISOString().split('T')[0]
    if (!runsByDate.has(dateKey)) {
      runsByDate.set(dateKey, { runs: [], totalDistance: 0 })
    }
    const dayData = runsByDate.get(dateKey)!
    dayData.runs.push(run)
    dayData.totalDistance += run.totalDistance
  })

  // Convert to array and sort by date
  const heatmapData: HeatmapData[] = Array.from(runsByDate.entries())
    .map(([dateKey, data]) => ({
      date: new Date(dateKey),
      value: data.totalDistance / 1609.34, // Convert to miles
      runs: data.runs
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  return heatmapData
}

// Get date range for heatmap (last year or all time)
export function getHeatmapDateRange(
  runs: GPXData[],
  range: 'year' | 'all' | 'recent'
): { startDate: Date; endDate: Date } {
  if (runs.length === 0) {
    const now = new Date()
    // Default to last 6 months if no runs
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    return {
      startDate: sixMonthsAgo,
      endDate: now
    }
  }

  const dates = runs.map(run => run.startTime.getTime())
  const minDate = new Date(Math.min(...dates))
  const maxDate = new Date(Math.max(...dates))

  if (range === 'recent') {
    // Show last 6 months, centered on today
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    sixMonthsAgo.setHours(0, 0, 0, 0)
    
    return {
      startDate: sixMonthsAgo < minDate ? minDate : sixMonthsAgo,
      endDate: new Date() // Always end at today
    }
  }

  if (range === 'year') {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    oneYearAgo.setHours(0, 0, 0, 0)
    
    return {
      startDate: oneYearAgo < minDate ? minDate : oneYearAgo,
      endDate: maxDate
    }
  }

  return {
    startDate: minDate,
    endDate: maxDate
  }
}

// Fill in missing dates for heatmap (for continuous visualization)
export function fillHeatmapDates(
  data: HeatmapData[],
  startDate: Date,
  endDate: Date
): HeatmapData[] {
  const filled: HeatmapData[] = []
  const dataMap = new Map<string, HeatmapData>()
  
  // Create map of existing data
  data.forEach(item => {
    const key = item.date.toISOString().split('T')[0]
    dataMap.set(key, item)
  })

  // Fill all dates in range
  const currentDate = new Date(startDate)
  currentDate.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  while (currentDate <= end) {
    const key = currentDate.toISOString().split('T')[0]
    if (dataMap.has(key)) {
      filled.push(dataMap.get(key)!)
    } else {
      filled.push({
        date: new Date(currentDate),
        value: 0,
        runs: []
      })
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return filled
}

// Get intensity level for a value (0-4 scale)
export function getIntensityLevel(value: number, maxValue: number): number {
  if (maxValue === 0) return 0
  const ratio = value / maxValue
  
  if (ratio === 0) return 0
  if (ratio < 0.2) return 1
  if (ratio < 0.4) return 2
  if (ratio < 0.7) return 3
  return 4
}

// Get color class for intensity level
export function getIntensityColor(level: number): string {
  switch (level) {
    case 0:
      return 'bg-earth-100 dark:bg-earth-800'
    case 1:
      return 'bg-sage-200 dark:bg-sage-800'
    case 2:
      return 'bg-sage-400 dark:bg-sage-700'
    case 3:
      return 'bg-sage-600 dark:bg-sage-600'
    case 4:
      return 'bg-sage-800 dark:bg-sage-500'
    default:
      return 'bg-earth-100 dark:bg-earth-800'
  }
}

