// Custom Hook for Managing Best Efforts

import { useState, useEffect, useCallback } from 'react'
import { GPXData } from '../utils/gpxParser'
import { PersonalRecords, calculateBestEfforts, checkForNewPRs } from '../utils/metrics'
import { loadBestEfforts, saveBestEfforts, isLocalStorageAvailable } from '../utils/localStorage'

export interface UseBestEffortsReturn {
  bestEfforts: PersonalRecords
  updateBestEfforts: (runs: GPXData[]) => void
  newPRs: string[]
  clearNewPRs: () => void
  isLoading: boolean
}

export function useBestEfforts(runs: GPXData[]): UseBestEffortsReturn {
  const [bestEfforts, setBestEfforts] = useState<PersonalRecords>({
    fastestMile: null,
    fastest5K: null,
    fastest10K: null,
    longestRunDistance: null,
    longestRunTime: null
  })
  const [newPRs, setNewPRs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    if (isLocalStorageAvailable()) {
      const stored = loadBestEfforts()
      if (stored) {
        setBestEfforts(stored)
      }
    }
    setIsLoading(false)
  }, [])

  // Update best efforts when runs change
  const updateBestEfforts = useCallback((runs: GPXData[]) => {
    if (runs.length === 0) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Calculate new best efforts
    const newBestEfforts = calculateBestEfforts(runs)

    // Check for new PRs
    const prCheck = checkForNewPRs(bestEfforts, runs[runs.length - 1])
    if (prCheck.hasNewPR) {
      setNewPRs(prCheck.prTypes)
    }

    // Update state
    setBestEfforts(newBestEfforts)

    // Save to localStorage
    if (isLocalStorageAvailable()) {
      saveBestEfforts(newBestEfforts)
    }

    setIsLoading(false)
  }, [bestEfforts])

  // Auto-update when runs change
  useEffect(() => {
    if (runs.length > 0) {
      updateBestEfforts(runs)
    }
  }, [runs.length]) // Only re-run when number of runs changes

  const clearNewPRs = useCallback(() => {
    setNewPRs([])
  }, [])

  return {
    bestEfforts,
    updateBestEfforts,
    newPRs,
    clearNewPRs,
    isLoading
  }
}

