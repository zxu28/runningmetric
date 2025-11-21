import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { GPXData } from '../utils/gpxParser'
import { useError } from './ErrorContext'

interface DataContextType {
  parsedData: GPXData[]
  setParsedData: (data: GPXData[]) => void
  addParsedData: (data: GPXData[]) => void
  updateRun: (updatedRun: GPXData) => void
  deleteRun: (runToDelete: GPXData) => void
  clearData: () => void
  clearAllData: () => void
  removeDuplicates: () => void
  removeStravaData: () => void
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
  const { showInfo, showError } = useError()
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
      
      // Optimize data before saving to reduce localStorage usage
      const optimizedData = updatedData.map(run => {
        // For runs with many GPS points, keep only essential data
        // Reduce point density for old runs (>30 days old)
        const isOld = (Date.now() - run.startTime.getTime()) > 30 * 24 * 60 * 60 * 1000
        if (isOld && run.tracks.length > 0) {
          const optimizedTracks = run.tracks.map(track => {
            // Keep every 10th point for old runs to reduce storage
            if (track.points.length > 100) {
              const optimizedPoints = track.points.filter((_, index) => index % 10 === 0 || index === track.points.length - 1)
              return { ...track, points: optimizedPoints }
            }
            return track
          })
          return { ...run, tracks: optimizedTracks }
        }
        return run
      })
      
      // Save to localStorage with proper serialization
      try {
        const dataStr = JSON.stringify(optimizedData)
        const dataSizeMB = (dataStr.length / 1024 / 1024).toFixed(2)
        console.log(`Attempting to save ${dataStr.length} bytes (${dataSizeMB} MB) to localStorage`)
        
        // Check localStorage quota before saving
        const quotaEstimate = 5 * 1024 * 1024 // ~5MB typical limit
        if (dataStr.length > quotaEstimate * 0.9) {
          console.warn(`⚠️ Warning: Data size (${dataSizeMB} MB) is approaching localStorage limit`)
        }
        
        localStorage.setItem('runningData', dataStr)
        console.log('Successfully saved to localStorage')
      } catch (error) {
        console.error('Failed to save to localStorage:', error instanceof Error ? error.message : 'Unknown error')
        // If localStorage is full, try to optimize and save
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.warn('⚠️ localStorage QUOTA EXCEEDED!')
          console.warn(`  Data size: ${(JSON.stringify(updatedData).length / 1024 / 1024).toFixed(2)} MB`)
          console.warn('  Attempting to optimize data by reducing GPS point density...')
          
          try {
            // Further optimize: reduce point density even more
            const heavilyOptimized = updatedData.map(run => {
              const optimizedTracks = run.tracks.map(track => {
                if (track.points.length > 50) {
                  // Keep every 20th point for heavily optimized runs
                  const optimizedPoints = track.points.filter((_, index) => index % 20 === 0 || index === track.points.length - 1)
                  return { ...track, points: optimizedPoints }
                }
                return track
              })
              return { ...run, tracks: optimizedTracks }
            })
            
            const optimizedStr = JSON.stringify(heavilyOptimized)
            const optimizedSizeMB = (optimizedStr.length / 1024 / 1024).toFixed(2)
            console.log(`Optimized data size: ${optimizedSizeMB} MB`)
            
            localStorage.removeItem('runningData')
            localStorage.setItem('runningData', optimizedStr)
            console.log('✅ Successfully saved optimized data')
            
            // Show user-friendly message
            showInfo(`Storage space was getting full, so some GPS point detail was reduced to save space. Your data is now ${optimizedSizeMB} MB.`, 6000)
          } catch (retryError) {
            console.error('❌ Cannot save even after optimization:', retryError)
            showError(`Browser storage is full (${updatedData.length} runs). Please clear old runs using the "Clear All Data" button or sync fewer activities at once. Your data is safe but not saved yet.`, 10000)
            throw retryError
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

  // Delete a single run
  const deleteRun = (runToDelete: GPXData) => {
    setParsedData(prevData => {
      // Find and remove the run - match by stravaId if available, otherwise by fileName + startTime
      const updatedData = prevData.filter(run => {
        if (runToDelete.source === 'strava' && runToDelete.stravaId) {
          // For Strava runs, match by stravaId
          return !(run.source === 'strava' && run.stravaId === runToDelete.stravaId)
        } else {
          // For GPX files, match by fileName + startTime
          return !(run.fileName === runToDelete.fileName && 
                   run.startTime.getTime() === runToDelete.startTime.getTime())
        }
      })
      
      // Save to localStorage
      try {
        localStorage.setItem('runningData', JSON.stringify(updatedData))
        console.log('Deleted run:', runToDelete.fileName)
      } catch (error) {
        console.error('Failed to save after deletion:', error)
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

  // Remove all Strava-synced data
  const removeStravaData = () => {
    setParsedData(prevData => {
      const stravaCount = prevData.filter(run => run.source === 'strava').length
      const filteredData = prevData.filter(run => run.source !== 'strava')
      
      // Save to localStorage
      try {
        localStorage.setItem('runningData', JSON.stringify(filteredData))
        console.log(`Removed ${stravaCount} Strava activities. ${filteredData.length} runs remaining.`)
        if (stravaCount > 0) {
          showInfo(`Removed ${stravaCount} Strava activity/activities. Your GPX files are still available.`, 5000)
        }
      } catch (error) {
        console.error('Failed to save after removing Strava data:', error)
        showError('Failed to remove Strava data. Please try again.')
      }
      
      return filteredData
    })
  }

  const value: DataContextType = {
    parsedData,
    setParsedData,
    addParsedData,
    updateRun,
    deleteRun,
    clearData,
    clearAllData,
    removeDuplicates,
    removeStravaData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
