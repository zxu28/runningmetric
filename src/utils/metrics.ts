// Best Efforts and Personal Records Calculation Utilities

import { GPXData } from './gpxParser'

export interface BestEffort {
  runId: string
  fileName: string
  time: number // in seconds
  pace: number // min/mile
  distance: number // in meters
  date: Date
  startTime: Date
}

export interface PersonalRecords {
  fastestMile: BestEffort | null
  fastest5K: BestEffort | null
  fastest10K: BestEffort | null
  longestRunDistance: BestEffort | null
  longestRunTime: BestEffort | null
}

const MILE_IN_METERS = 1609.34
const KM_5_IN_METERS = 5000
const KM_10_IN_METERS = 10000

// Calculate fastest 1 mile from mile splits
function findFastestMile(runs: GPXData[]): BestEffort | null {
  let fastest: BestEffort | null = null

  runs.forEach(run => {
    run.splits.forEach(split => {
      // Only consider full miles (not partial)
      const splitDistance = split.endDistance - split.startDistance
      if (splitDistance >= MILE_IN_METERS * 0.99) { // Allow 1% tolerance
        if (!fastest || split.pace < fastest.pace) {
          fastest = {
            runId: run.fileName,
            fileName: run.fileName,
            time: split.duration,
            pace: split.pace,
            distance: splitDistance,
            date: run.startTime,
            startTime: split.startTime
          }
        }
      }
    })
  })

  return fastest
}

// Find fastest continuous segment of given distance
function findFastestSegment(
  runs: GPXData[],
  targetDistance: number
): BestEffort | null {
  let fastest: BestEffort | null = null

  runs.forEach(run => {
    // Only consider runs that meet the minimum distance
    if (run.totalDistance < targetDistance * 0.95) return

    const splits = run.splits
    
    // Try all possible continuous segments
    for (let startIdx = 0; startIdx < splits.length; startIdx++) {
      let cumulativeDistance = 0
      let cumulativeTime = 0

      for (let endIdx = startIdx; endIdx < splits.length; endIdx++) {
        const split = splits[endIdx]
        const splitDistance = split.endDistance - split.startDistance
        cumulativeDistance += splitDistance
        cumulativeTime += split.duration

        // Check if we've reached the target distance
        if (cumulativeDistance >= targetDistance * 0.95 && 
            cumulativeDistance <= targetDistance * 1.05) { // Allow 5% tolerance
          
          const avgPace = cumulativeDistance > 0 
            ? (cumulativeTime / 60) / (cumulativeDistance / MILE_IN_METERS) 
            : 0

          if (!fastest || avgPace < fastest.pace) {
            fastest = {
              runId: run.fileName,
              fileName: run.fileName,
              time: cumulativeTime,
              pace: avgPace,
              distance: cumulativeDistance,
              date: run.startTime,
              startTime: splits[startIdx].startTime
            }
          }
          break
        }

        // Stop if we've gone too far past the target
        if (cumulativeDistance > targetDistance * 1.1) break
      }
    }
  })

  return fastest
}

// Calculate all best efforts
export function calculateBestEfforts(runs: GPXData[]): PersonalRecords {
  if (runs.length === 0) {
    return {
      fastestMile: null,
      fastest5K: null,
      fastest10K: null,
      longestRunDistance: null,
      longestRunTime: null
    }
  }

  // Find fastest mile
  const fastestMile = findFastestMile(runs)

  // Find fastest 5K
  const fastest5K = findFastestSegment(runs, KM_5_IN_METERS)

  // Find fastest 10K
  const fastest10K = findFastestSegment(runs, KM_10_IN_METERS)

  // Find longest run by distance
  let longestDistance: BestEffort | null = null
  runs.forEach(run => {
    if (!longestDistance || run.totalDistance > longestDistance.distance) {
      longestDistance = {
        runId: run.fileName,
        fileName: run.fileName,
        time: run.totalDuration,
        pace: run.avgPace,
        distance: run.totalDistance,
        date: run.startTime,
        startTime: run.startTime
      }
    }
  })

  // Find longest run by time
  let longestTime: BestEffort | null = null
  runs.forEach(run => {
    if (!longestTime || run.totalDuration > longestTime.time) {
      longestTime = {
        runId: run.fileName,
        fileName: run.fileName,
        time: run.totalDuration,
        pace: run.avgPace,
        distance: run.totalDistance,
        date: run.startTime,
        startTime: run.startTime
      }
    }
  })

  return {
    fastestMile,
    fastest5K,
    fastest10K,
    longestRunDistance: longestDistance,
    longestRunTime: longestTime
  }
}

// Check if a new run contains any personal records
export function checkForNewPRs(
  currentPRs: PersonalRecords,
  newRun: GPXData
): {
  hasNewPR: boolean
  prTypes: string[]
} {
  const allRuns = [newRun] // Will be compared against existing PRs
  const prTypes: string[] = []

  // Check fastest mile
  const fastestMile = findFastestMile(allRuns)
  if (fastestMile && (!currentPRs.fastestMile || fastestMile.pace < currentPRs.fastestMile.pace)) {
    prTypes.push('Fastest Mile')
  }

  // Check fastest 5K
  if (newRun.totalDistance >= KM_5_IN_METERS * 0.95) {
    const fastest5K = findFastestSegment(allRuns, KM_5_IN_METERS)
    if (fastest5K && (!currentPRs.fastest5K || fastest5K.pace < currentPRs.fastest5K.pace)) {
      prTypes.push('Fastest 5K')
    }
  }

  // Check fastest 10K
  if (newRun.totalDistance >= KM_10_IN_METERS * 0.95) {
    const fastest10K = findFastestSegment(allRuns, KM_10_IN_METERS)
    if (fastest10K && (!currentPRs.fastest10K || fastest10K.pace < currentPRs.fastest10K.pace)) {
      prTypes.push('Fastest 10K')
    }
  }

  // Check longest distance
  if (!currentPRs.longestRunDistance || newRun.totalDistance > currentPRs.longestRunDistance.distance) {
    prTypes.push('Longest Run (Distance)')
  }

  // Check longest time
  if (!currentPRs.longestRunTime || newRun.totalDuration > currentPRs.longestRunTime.time) {
    prTypes.push('Longest Run (Time)')
  }

  return {
    hasNewPR: prTypes.length > 0,
    prTypes
  }
}

