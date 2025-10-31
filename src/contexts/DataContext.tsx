import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { GPXData } from '../utils/gpxParser'

interface DataContextType {
  parsedData: GPXData[]
  setParsedData: (data: GPXData[]) => void
  addParsedData: (data: GPXData[]) => void
  updateRun: (updatedRun: GPXData) => void
  clearData: () => void
  clearAllData: () => void
  removeDuplicates: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const useDataContext = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider')
  }
  return context
}

interface DataProviderProps {
  children: ReactNode
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [parsedData, setParsedData] = useState<GPXData[]>([])

  // Load data from localStorage on initialization
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('runningData')
      if (storedData) {
        const parsed = JSON.parse(storedData)
        // Convert date strings back to Date objects and ensure proper structure
        const dataWithDates = parsed.map((item: any) => {
          // Ensure tracks array exists and has proper structure
          const tracks = Array.isArray(item.tracks) ? item.tracks.map((track: any) => ({
            ...track,
            points: Array.isArray(track.points) ? track.points.map((point: any) => ({
              ...point,
              time: new Date(point.time)
            })) : []
          })) : []
          
          // Ensure splits array exists and has proper structure
          const splits = Array.isArray(item.splits) ? item.splits.map((split: any) => ({
            ...split,
            startTime: split.startTime ? new Date(split.startTime) : new Date(),
            endTime: split.endTime ? new Date(split.endTime) : new Date()
          })) : []
          
          return {
            ...item,
            startTime: new Date(item.startTime),
            endTime: new Date(item.endTime),
            tracks,
            splits
          }
        })
        setParsedData(dataWithDates)
        console.log(`Loaded ${dataWithDates.length} runs from localStorage:`, dataWithDates)
        
        // Debug: Check what was actually loaded
        if (dataWithDates.length > 0) {
          const sampleRun = dataWithDates[0]
          console.log('Sample loaded run:', {
            fileName: sampleRun.fileName,
            source: sampleRun.source,
            tracksCount: sampleRun.tracks.length,
            totalPoints: sampleRun.tracks.reduce((sum: number, track: any) => sum + track.points.length, 0),
            splitsCount: sampleRun.splits.length,
            firstPoint: sampleRun.tracks[0]?.points[0],
            firstSplit: sampleRun.splits[0]
          })
        }
        
        // Debug: Check for duplicates and data issues
        const stravaRuns = dataWithDates.filter((run: any) => run.source === 'strava')
        const gpxRuns = dataWithDates.filter((run: any) => run.source !== 'strava')
        
        console.log(`Debug - Strava runs: ${stravaRuns.length}, GPX runs: ${gpxRuns.length}`)
        
        // Check for duplicate Strava IDs
        const stravaIds = stravaRuns.map((run: any) => run.stravaId)
        const uniqueStravaIds = [...new Set(stravaIds)]
        if (stravaIds.length !== uniqueStravaIds.length) {
          console.warn(`Found ${stravaIds.length - uniqueStravaIds.length} duplicate Strava activities!`)
        }
        
        // Check for unrealistic distances
        const unrealisticRuns = dataWithDates.filter((run: any) => run.totalDistance > 50000) // > 50km
        if (unrealisticRuns.length > 0) {
          console.warn(`Found ${unrealisticRuns.length} runs with unrealistic distances:`, unrealisticRuns)
        }
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error instanceof Error ? error.message : 'Unknown error')
    }
  }, [])

  const addParsedData = (newData: GPXData[]) => {
    setParsedData(prevData => {
      // Filter out duplicates before adding
      // For Strava activities: check by stravaId
      // For GPX files: check by fileName + startTime (since same file could be uploaded multiple times)
      const existingStravaIds = new Set(
        prevData
          .filter(item => item.source === 'strava' && item.stravaId !== undefined)
          .map(item => item.stravaId as number)
      )
      
      const existingGpxFiles = new Set(
        prevData
          .filter(item => item.source !== 'strava')
          .map(item => `${item.fileName}_${item.startTime.getTime()}`)
      )
      
      // Filter new data to remove duplicates
      const uniqueNewData = newData.filter(item => {
        if (item.source === 'strava' && item.stravaId) {
          if (existingStravaIds.has(item.stravaId)) {
            console.log(`Skipping duplicate Strava activity: ${item.fileName} (ID: ${item.stravaId})`)
            return false
          }
          return true
        } else {
          // For GPX files, check by fileName + startTime
          const key = `${item.fileName}_${item.startTime.getTime()}`
          if (existingGpxFiles.has(key)) {
            console.log(`Skipping duplicate GPX file: ${item.fileName}`)
            return false
          }
          return true
        }
      })
      
      if (uniqueNewData.length < newData.length) {
        const skippedCount = newData.length - uniqueNewData.length
        console.log(`⚠️ Filtered out ${skippedCount} duplicate(s) before adding`)
      }
      
      const updatedData = [...prevData, ...uniqueNewData]
      
      // Debug: Check what we're about to save
      console.log('Saving to localStorage:', {
        totalRuns: updatedData.length,
        newRuns: uniqueNewData.length,
        duplicatesSkipped: newData.length - uniqueNewData.length,
        sampleRun: {
          fileName: updatedData[updatedData.length - 1]?.fileName,
          source: updatedData[updatedData.length - 1]?.source,
          tracksCount: updatedData[updatedData.length - 1]?.tracks.length,
          totalPoints: updatedData[updatedData.length - 1]?.tracks.reduce((sum, track) => sum + track.points.length, 0),
          splitsCount: updatedData[updatedData.length - 1]?.splits.length
        }
      })
      
      // Save to localStorage with proper serialization
      try {
        const dataStr = JSON.stringify(updatedData)
        console.log(`Attempting to save ${dataStr.length} bytes to localStorage`)
        localStorage.setItem('runningData', dataStr)
        console.log('Successfully saved to localStorage')
      } catch (error) {
        console.error('Failed to save to localStorage:', error instanceof Error ? error.message : 'Unknown error')
        // If localStorage is full, try to clear some old data
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.warn('⚠️ localStorage QUOTA EXCEEDED!')
          console.warn('  This means you have too much data stored')
          console.warn('  Solution: Clear old data or reduce number of activities synced')
          console.log('localStorage full, attempting to clear and save...')
          try {
            localStorage.removeItem('runningData')
            localStorage.setItem('runningData', JSON.stringify(updatedData))
            console.log('Successfully recovered from quota error')
          } catch (retryError) {
            console.error('❌ Cannot save even after clearing:', retryError)
            alert('Cannot save data: localStorage is full. Please clear some browser data.')
          }
        }
      }
      return updatedData
    })
  }

  // Update a single run (for tags, notes, etc.)
  const updateRun = (updatedRun: GPXData) => {
    setParsedData(prevData => {
      // Find the run to update - match by stravaId if available, otherwise by fileName + startTime
      const updatedData = prevData.map(run => {
        if (updatedRun.source === 'strava' && updatedRun.stravaId) {
          if (run.source === 'strava' && run.stravaId === updatedRun.stravaId) {
            return updatedRun
          }
        } else {
          // Match by fileName + startTime for GPX files
          if (run.fileName === updatedRun.fileName && 
              run.startTime.getTime() === updatedRun.startTime.getTime()) {
            return updatedRun
          }
        }
        return run
      })
      
      // Save to localStorage
      try {
        localStorage.setItem('runningData', JSON.stringify(updatedData))
        console.log('Updated run:', updatedRun.fileName)
      } catch (error) {
        console.error('Failed to save updated run:', error)
      }
      
      return updatedData
    })
  }

  const clearData = () => {
    setParsedData([])
    localStorage.removeItem('runningData')
  }

  // Clear all data and start fresh
  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL running data? This cannot be undone.')) {
      setParsedData([])
      localStorage.removeItem('runningData')
      localStorage.removeItem('strava_tokens') // Also clear Strava tokens
      console.log('All data cleared. Please refresh the page.')
    }
  }

  // Remove duplicates from localStorage
  const removeDuplicates = () => {
    try {
      const storedData = localStorage.getItem('runningData')
      if (storedData) {
        const parsed = JSON.parse(storedData)
        
        // Remove duplicates based on stravaId for Strava activities
        const uniqueData = parsed.filter((item: any, index: number, arr: any[]) => {
          if (item.source === 'strava') {
            return arr.findIndex((other: any) => 
              other.source === 'strava' && other.stravaId === item.stravaId
            ) === index
          }
          return true // Keep all non-Strava activities
        })
        
        localStorage.setItem('runningData', JSON.stringify(uniqueData))
        
        // Reload data in context
        const dataWithDates = uniqueData.map((item: any) => ({
          ...item,
          startTime: new Date(item.startTime),
          endTime: new Date(item.endTime),
          tracks: item.tracks.map((track: any) => ({
            ...track,
            points: track.points.map((point: any) => ({
              ...point,
              time: new Date(point.time)
            }))
          })),
          splits: item.splits.map((split: any) => ({
            ...split,
            startTime: new Date(split.startTime),
            endTime: new Date(split.endTime)
          }))
        }))
        setParsedData(dataWithDates)
        
        console.log(`Removed duplicates. Now have ${uniqueData.length} unique activities.`)
      }
    } catch (error) {
      console.error('Error removing duplicates:', error)
    }
  }

  const value: DataContextType = {
    parsedData,
    setParsedData,
    addParsedData,
    updateRun,
    clearData,
    clearAllData,
    removeDuplicates
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
