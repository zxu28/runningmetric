// Trend Analysis Utilities - Weekly, Monthly, and Custom Period Stats

import { GPXData } from './gpxParser'

export interface PeriodStats {
  period: string // "Week of Jan 1" or "January 2024"
  startDate: Date
  endDate: Date
  totalDistance: number // meters
  totalTime: number // seconds
  averagePace: number // min/mile
  totalElevation: number // meters
  runCount: number
  runs: GPXData[]
}

export type TimePeriod = 'last7days' | 'last30days' | 'last90days' | 'last4weeks' | 'thisMonth' | 'thisYear' | 'allTime'

// Get start date for a given time period
function getStartDateForPeriod(period: TimePeriod): Date {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case 'last7days':
      const last7 = new Date(today)
      last7.setDate(last7.getDate() - 7)
      return last7

    case 'last30days':
      const last30 = new Date(today)
      last30.setDate(last30.getDate() - 30)
      return last30

    case 'last90days':
      const last90 = new Date(today)
      last90.setDate(last90.getDate() - 90)
      return last90

    case 'last4weeks':
      const last4weeks = new Date(today)
      last4weeks.setDate(last4weeks.getDate() - 28)
      return last4weeks

    case 'thisMonth':
      return new Date(now.getFullYear(), now.getMonth(), 1)

    case 'thisYear':
      return new Date(now.getFullYear(), 0, 1)

    case 'allTime':
      return new Date(0) // Unix epoch

    default:
      return today
  }
}

// Filter runs by time period
export function filterRunsByPeriod(runs: GPXData[], period: TimePeriod): GPXData[] {
  const startDate = getStartDateForPeriod(period)
  return runs.filter(run => run.startTime >= startDate)
}

// Get week number and year for a date
function getWeekInfo(date: Date): { week: number; year: number; weekStart: Date } {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7)) // Thursday of this week
  
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  
  // Get Monday of this week
  const weekStart = new Date(d)
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
  
  return {
    week: weekNo,
    year: d.getFullYear(),
    weekStart
  }
}

// Group runs by week
export function getWeeklyTrends(runs: GPXData[], period: TimePeriod = 'last4weeks'): PeriodStats[] {
  const filteredRuns = filterRunsByPeriod(runs, period)
  
  // Group runs by week
  const weekMap = new Map<string, GPXData[]>()
  
  filteredRuns.forEach(run => {
    const { week, year } = getWeekInfo(run.startTime)
    const key = `${year}-W${week}`
    
    if (!weekMap.has(key)) {
      weekMap.set(key, [])
    }
    weekMap.get(key)!.push(run)
  })
  
  // Convert to PeriodStats array
  const stats: PeriodStats[] = []
  
  weekMap.forEach((runsInWeek) => {
    const { weekStart } = getWeekInfo(runsInWeek[0].startTime)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    const totalDistance = runsInWeek.reduce((sum, run) => sum + run.totalDistance, 0)
    const totalTime = runsInWeek.reduce((sum, run) => sum + run.totalDuration, 0)
    const totalElevation = runsInWeek.reduce((sum, run) => sum + run.elevationGain, 0)
    
    const distanceMiles = totalDistance / 1609.34
    const averagePace = distanceMiles > 0 ? (totalTime / 60) / distanceMiles : 0
    
    stats.push({
      period: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      startDate: weekStart,
      endDate: weekEnd,
      totalDistance,
      totalTime,
      averagePace,
      totalElevation,
      runCount: runsInWeek.length,
      runs: runsInWeek
    })
  })
  
  // Sort by date
  stats.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  
  return stats
}

// Group runs by month
export function getMonthlyTrends(runs: GPXData[], period: TimePeriod = 'thisYear'): PeriodStats[] {
  const filteredRuns = filterRunsByPeriod(runs, period)
  
  // Group runs by month
  const monthMap = new Map<string, GPXData[]>()
  
  filteredRuns.forEach(run => {
    const year = run.startTime.getFullYear()
    const month = run.startTime.getMonth()
    const key = `${year}-${month}`
    
    if (!monthMap.has(key)) {
      monthMap.set(key, [])
    }
    monthMap.get(key)!.push(run)
  })
  
  // Convert to PeriodStats array
  const stats: PeriodStats[] = []
  
  monthMap.forEach((runsInMonth) => {
    const firstRun = runsInMonth[0]
    const year = firstRun.startTime.getFullYear()
    const month = firstRun.startTime.getMonth()
    
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    
    const totalDistance = runsInMonth.reduce((sum, run) => sum + run.totalDistance, 0)
    const totalTime = runsInMonth.reduce((sum, run) => sum + run.totalDuration, 0)
    const totalElevation = runsInMonth.reduce((sum, run) => sum + run.elevationGain, 0)
    
    const distanceMiles = totalDistance / 1609.34
    const averagePace = distanceMiles > 0 ? (totalTime / 60) / distanceMiles : 0
    
    stats.push({
      period: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      startDate: monthStart,
      endDate: monthEnd,
      totalDistance,
      totalTime,
      averagePace,
      totalElevation,
      runCount: runsInMonth.length,
      runs: runsInMonth
    })
  })
  
  // Sort by date
  stats.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  
  return stats
}

// Calculate moving average for pace
export function calculateMovingAverage(data: number[], windowSize: number = 7): number[] {
  if (data.length === 0) return []
  
  const result: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2))
    const end = Math.min(data.length, i + Math.ceil(windowSize / 2))
    const window = data.slice(start, end)
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length
    result.push(avg)
  }
  
  return result
}

// Get summary stats for a period
export function getPeriodSummary(runs: GPXData[], period: TimePeriod): PeriodStats | null {
  const filteredRuns = filterRunsByPeriod(runs, period)
  
  if (filteredRuns.length === 0) return null
  
  const totalDistance = filteredRuns.reduce((sum, run) => sum + run.totalDistance, 0)
  const totalTime = filteredRuns.reduce((sum, run) => sum + run.totalDuration, 0)
  const totalElevation = filteredRuns.reduce((sum, run) => sum + run.elevationGain, 0)
  
  const distanceMiles = totalDistance / 1609.34
  const averagePace = distanceMiles > 0 ? (totalTime / 60) / distanceMiles : 0
  
  const startDate = getStartDateForPeriod(period)
  const endDate = new Date()
  
  return {
    period: period,
    startDate,
    endDate,
    totalDistance,
    totalTime,
    averagePace,
    totalElevation,
    runCount: filteredRuns.length,
    runs: filteredRuns
  }
}

