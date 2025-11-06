// Goal Type Definitions

export type GoalType = 'distance' | 'time' | 'runs' | 'streak' | 'elevation'

export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

export interface RunningGoal {
  id: string
  type: GoalType
  target: number // target value
  progress: number // current progress
  period: GoalPeriod
  startDate: Date
  endDate: Date
  title?: string
  completed: boolean
  completedAt?: Date
}

// Helper function to get unit label for goal type
export function getGoalUnit(type: GoalType): string {
  switch (type) {
    case 'distance':
      return 'miles'
    case 'time':
      return 'hours'
    case 'runs':
      return 'runs'
    case 'streak':
      return 'days'
    case 'elevation':
      return 'feet'
    default:
      return ''
  }
}

// Helper function to format goal value with unit
export function formatGoalValue(value: number, type: GoalType): string {
  const unit = getGoalUnit(type)
  if (type === 'time') {
    return `${value.toFixed(1)} ${unit}`
  }
  if (type === 'distance' || type === 'elevation') {
    return `${Math.round(value)} ${unit}`
  }
  return `${Math.round(value)} ${unit}`
}

// Calculate period dates based on period type
export function calculatePeriodDates(period: GoalPeriod, customStart?: Date, customEnd?: Date): { startDate: Date; endDate: Date } {
  const now = new Date()
  
  switch (period) {
    case 'daily':
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayEnd = new Date(todayStart)
      todayEnd.setDate(todayEnd.getDate() + 1)
      return { startDate: todayStart, endDate: todayEnd }
    
    case 'weekly':
      const dayOfWeek = now.getDay()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - dayOfWeek)
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)
      return { startDate: weekStart, endDate: weekEnd }
    
    case 'monthly':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      return { startDate: monthStart, endDate: monthEnd }
    
    case 'yearly':
      const yearStart = new Date(now.getFullYear(), 0, 1)
      const yearEnd = new Date(now.getFullYear() + 1, 0, 1)
      return { startDate: yearStart, endDate: yearEnd }
    
    case 'custom':
      if (customStart && customEnd) {
        return { startDate: customStart, endDate: customEnd }
      }
      // Default to weekly if custom dates not provided
      return calculatePeriodDates('weekly')
    
    default:
      return calculatePeriodDates('weekly')
  }
}

