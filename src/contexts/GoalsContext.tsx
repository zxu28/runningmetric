import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { RunningGoal, calculatePeriodDates } from '../utils/goalTypes'
import { loadGoals, saveGoals } from '../utils/goalStorage'
import { useDataContext } from './DataContext'
import { GPXData } from '../utils/gpxParser'

interface GoalsContextType {
  goals: RunningGoal[]
  createGoal: (goal: Omit<RunningGoal, 'id' | 'progress' | 'completed' | 'completedAt'>) => void
  updateGoal: (id: string, updates: Partial<RunningGoal>) => void
  deleteGoal: (id: string) => void
  completeGoal: (id: string) => void
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined)

export const useGoalsContext = () => {
  const context = useContext(GoalsContext)
  if (context === undefined) {
    throw new Error('useGoalsContext must be used within a GoalsProvider')
  }
  return context
}

interface GoalsProviderProps {
  children: ReactNode
}

// Calculate progress for a goal based on runs
function calculateGoalProgress(goal: RunningGoal, runs: GPXData[]): number {
  // Filter runs within the goal period
  const periodRuns = runs.filter(run => {
    const runDate = run.startTime
    return runDate >= goal.startDate && runDate < goal.endDate
  })

  switch (goal.type) {
    case 'distance':
      // Sum total distance in miles
      return periodRuns.reduce((sum, run) => sum + run.totalDistance, 0) / 1609.34
    
    case 'time':
      // Sum total time in hours
      return periodRuns.reduce((sum, run) => sum + run.totalDuration, 0) / 3600
    
    case 'runs':
      // Count number of runs
      return periodRuns.length
    
    case 'streak':
      // Calculate longest streak within period
      if (periodRuns.length === 0) return 0
      
      const sortedRuns = [...periodRuns].sort((a, b) => 
        a.startTime.getTime() - b.startTime.getTime()
      )
      
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
    
    case 'elevation':
      // Sum total elevation gain in feet
      return periodRuns.reduce((sum, run) => sum + run.elevationGain, 0) * 3.28084
    
    default:
      return 0
  }
}

export const GoalsProvider: React.FC<GoalsProviderProps> = ({ children }) => {
  const [goals, setGoals] = useState<RunningGoal[]>([])
  const { parsedData } = useDataContext()

  // Load goals from localStorage on mount
  useEffect(() => {
    const loadedGoals = loadGoals()
    setGoals(loadedGoals)
    console.log(`Loaded ${loadedGoals.length} goals from localStorage`)
  }, [])

  // Update progress for all goals when runs change
  useEffect(() => {
    if (goals.length > 0 && parsedData.length > 0) {
      setGoals(prevGoals =>
        prevGoals.map(goal => {
          const progress = calculateGoalProgress(goal, parsedData)
          const wasCompleted = goal.completed
          const isCompleted = progress >= goal.target && !wasCompleted
          
          return {
            ...goal,
            progress: Math.min(progress, goal.target), // Cap at target
            completed: isCompleted || wasCompleted,
            completedAt: isCompleted && !wasCompleted ? new Date() : goal.completedAt
          }
        })
      )
    }
  }, [parsedData.length, goals.length])

  // Save goals to localStorage whenever they change
  useEffect(() => {
    try {
      saveGoals(goals)
      console.log(`Saved ${goals.length} goals to localStorage`)
    } catch (error) {
      console.error('Failed to save goals:', error)
      if (error instanceof Error && error.message.includes('quota')) {
        console.warn('Storage quota exceeded. Some goals may not be saved.')
      }
    }
  }, [goals])

  // Create a new goal
  const createGoal = useCallback((goalData: Omit<RunningGoal, 'id' | 'progress' | 'completed' | 'completedAt'>) => {
    const now = new Date()
    const { startDate, endDate } = calculatePeriodDates(goalData.period, goalData.startDate, goalData.endDate)
    
    const newGoal: RunningGoal = {
      ...goalData,
      startDate,
      endDate,
      id: `goal-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
      progress: calculateGoalProgress(
        { ...goalData, id: '', progress: 0, completed: false, startDate, endDate },
        parsedData
      ),
      completed: false
    }

    setGoals(prev => [...prev, newGoal])
  }, [parsedData])

  // Update an existing goal
  const updateGoal = useCallback((id: string, updates: Partial<RunningGoal>) => {
    setGoals(prev =>
      prev.map(goal => {
        if (goal.id === id) {
          const updated = { ...goal, ...updates }
          // Recalculate progress if period or type changed
          if (updates.period || updates.startDate || updates.endDate || updates.type) {
            updated.progress = calculateGoalProgress(updated, parsedData)
          }
          return updated
        }
        return goal
      })
    )
  }, [parsedData])

  // Delete a goal
  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id))
  }, [])

  // Manually complete a goal
  const completeGoal = useCallback((id: string) => {
    setGoals(prev =>
      prev.map(goal => {
        if (goal.id === id && !goal.completed) {
          return {
            ...goal,
            completed: true,
            completedAt: new Date(),
            progress: goal.target // Set progress to target
          }
        }
        return goal
      })
    )
  }, [])

  return (
    <GoalsContext.Provider
      value={{
        goals,
        createGoal,
        updateGoal,
        deleteGoal,
        completeGoal
      }}
    >
      {children}
    </GoalsContext.Provider>
  )
}

