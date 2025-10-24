// GPX Parser utility functions

// Pause detection threshold - time gaps larger than this are considered pauses
const PAUSE_THRESHOLD_SECONDS = 20

// Maximum reasonable speed (m/s) - speeds above this indicate GPS errors
const MAX_SPEED_MPS = 10 // ~36 km/h or ~22 mph

export interface GPXPoint {
  lat: number
  lon: number
  elevation: number
  time: Date
}

export interface GPXTrack {
  name: string
  points: GPXPoint[]
}

export interface MileSplit {
  mile: number;              // Mile number (1, 2, 3...)
  pace: number;              // Minutes per mile
  duration: number;          // Duration for this split in seconds
  elevationGain: number;     // Elevation gain in meters
  elevationLoss: number;     // Elevation loss in meters
  startDistance: number;     // Starting distance in meters
  endDistance: number;       // Ending distance in meters
  startTime: Date;           // Split start time
  endTime: Date;             // Split end time
}

export interface GPXData {
  fileName: string
  tracks: GPXTrack[]
  totalDistance: number
  totalDuration: number
  elevationGain: number
  startTime: Date
  endTime: Date
  avgPace: number
  splits: MileSplit[];       // NEW: Per-mile split data
  source?: 'gpx' | 'strava'  // NEW: Track data source
  stravaId?: number          // NEW: Strava activity ID
}

// Haversine formula to calculate distance between two points
function haversineDistance(point1: GPXPoint, point2: GPXPoint): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = (point2.lat - point1.lat) * Math.PI / 180
  const dLon = (point2.lon - point1.lon) * Math.PI / 180
  const lat1 = point1.lat * Math.PI / 180
  const lat2 = point2.lat * Math.PI / 180

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// Calculate per-mile splits from track points
export function calculateMileSplits(tracks: GPXTrack[]): MileSplit[] {
  const splits: MileSplit[] = []
  const MILE_IN_METERS = 1609.34
  
  // Combine all track points and sort by time
  let allPoints: GPXPoint[] = []
  tracks.forEach(track => {
    allPoints = allPoints.concat(track.points)
  })
  allPoints.sort((a, b) => a.time.getTime() - b.time.getTime())
  
  if (allPoints.length < 2) return splits
  
  let currentMile = 1
  let accumulatedDistance = 0
  let accumulatedMovingTime = 0  // NEW: Track only moving time
  let splitStartIndex = 0
  let splitElevationGain = 0
  let splitElevationLoss = 0
  
  for (let i = 1; i < allPoints.length; i++) {
    const timeDelta = (allPoints[i].time.getTime() - allPoints[i - 1].time.getTime()) / 1000
    
    // Skip this segment if it's a pause (time gap too large)
    if (timeDelta > PAUSE_THRESHOLD_SECONDS) {
      // This is a pause - don't count distance or time
      // But update the split start index so next segment starts fresh
      if (accumulatedDistance === 0) {
        splitStartIndex = i
      }
      continue
    }
    
    const distance = haversineDistance(allPoints[i - 1], allPoints[i])
    
    // Skip if speed is unrealistic (GPS error)
    const speed = timeDelta > 0 ? distance / timeDelta : 0
    if (speed > MAX_SPEED_MPS) {
      continue
    }
    
    // Accumulate distance and moving time
    accumulatedDistance += distance
    accumulatedMovingTime += timeDelta  // NEW: Only count moving time
    
    // Calculate elevation change
    const elevationDiff = allPoints[i].elevation - allPoints[i - 1].elevation
    if (elevationDiff > 0) {
      splitElevationGain += elevationDiff
    } else {
      splitElevationLoss += Math.abs(elevationDiff)
    }
    
    // Check if we've completed a mile
    if (accumulatedDistance >= MILE_IN_METERS) {
      const splitDistanceMiles = accumulatedDistance / MILE_IN_METERS
      const pace = splitDistanceMiles > 0 ? (accumulatedMovingTime / 60) / splitDistanceMiles : 0
      
      splits.push({
        mile: currentMile,
        pace: pace,
        duration: accumulatedMovingTime,  // Use moving time, not elapsed
        elevationGain: splitElevationGain,
        elevationLoss: splitElevationLoss,
        startDistance: (currentMile - 1) * MILE_IN_METERS,
        endDistance: currentMile * MILE_IN_METERS,
        startTime: allPoints[splitStartIndex].time,
        endTime: allPoints[i].time
      })
      
      // Reset for next mile
      currentMile++
      accumulatedDistance = 0
      accumulatedMovingTime = 0  // NEW: Reset moving time
      splitStartIndex = i
      splitElevationGain = 0
      splitElevationLoss = 0
    }
  }
  
  // Handle partial final mile if exists
  if (accumulatedDistance > 0 && splits.length > 0) {
    const splitDistanceMiles = accumulatedDistance / MILE_IN_METERS
    const pace = splitDistanceMiles > 0 ? (accumulatedMovingTime / 60) / splitDistanceMiles : 0
    
    splits.push({
      mile: currentMile,
      pace: pace,
      duration: accumulatedMovingTime,
      elevationGain: splitElevationGain,
      elevationLoss: splitElevationLoss,
      startDistance: (currentMile - 1) * MILE_IN_METERS,
      endDistance: (currentMile - 1) * MILE_IN_METERS + accumulatedDistance,
      startTime: allPoints[splitStartIndex].time,
      endTime: allPoints[allPoints.length - 1].time
    })
  }
  
  return splits
}

// Parse GPX XML text and extract track points
export const parseGPX = (gpxText: string): GPXData | null => {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(gpxText, 'text/xml')
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror')
    if (parserError) {
      console.error('GPX parsing error:', parserError.textContent)
      return null
    }

    const tracks: GPXTrack[] = []
    const trackElements = xmlDoc.querySelectorAll('trk')
    
    trackElements.forEach((trackElement) => {
      const nameElement = trackElement.querySelector('name')
      const trackName = nameElement?.textContent || 'Unnamed Track'
      
      const points: GPXPoint[] = []
      const trackPoints = trackElement.querySelectorAll('trkpt')
      
      trackPoints.forEach((pointElement) => {
        const lat = parseFloat(pointElement.getAttribute('lat') || '0')
        const lon = parseFloat(pointElement.getAttribute('lon') || '0')
        
        const elevationElement = pointElement.querySelector('ele')
        const elevation = elevationElement ? parseFloat(elevationElement.textContent || '0') : 0
        
        const timeElement = pointElement.querySelector('time')
        const time = timeElement ? new Date(timeElement.textContent || '') : new Date()
        
        if (!isNaN(lat) && !isNaN(lon)) {
          points.push({ lat, lon, elevation, time })
        }
      })
      
      if (points.length > 0) {
        tracks.push({ name: trackName, points })
      }
    })

    if (tracks.length === 0) {
      console.warn('No valid tracks found in GPX file')
      return null
    }

    // Calculate summary data from all tracks
    let totalDistance = 0
    let totalElevationGain = 0
    let allPoints: GPXPoint[] = []
    
    tracks.forEach(track => {
      allPoints = allPoints.concat(track.points)
      
      // Calculate distance for this track
      for (let i = 1; i < track.points.length; i++) {
        const distance = haversineDistance(track.points[i - 1], track.points[i])
        totalDistance += distance
        
        // Calculate elevation gain
        const elevationDiff = track.points[i].elevation - track.points[i - 1].elevation
        if (elevationDiff > 0) {
          totalElevationGain += elevationDiff
        }
      }
    })

    // Sort all points by time to get accurate start/end times
    allPoints.sort((a, b) => a.time.getTime() - b.time.getTime())
    
    const startTime = allPoints[0]?.time || new Date()
    const endTime = allPoints[allPoints.length - 1]?.time || new Date()
    
    // Calculate total moving time (excluding pauses)
    let totalMovingTime = 0
    for (let i = 1; i < allPoints.length; i++) {
      const timeDelta = (allPoints[i].time.getTime() - allPoints[i - 1].time.getTime()) / 1000
      
      // Skip pauses
      if (timeDelta > PAUSE_THRESHOLD_SECONDS) {
        continue
      }
      
      const distance = haversineDistance(allPoints[i - 1], allPoints[i])
      const speed = timeDelta > 0 ? distance / timeDelta : 0
      
      // Skip unrealistic speeds
      if (speed > MAX_SPEED_MPS) {
        continue
      }
      
      totalMovingTime += timeDelta
    }
    
    const totalDuration = totalMovingTime // Use moving time instead of elapsed time
    
    // Calculate average pace (minutes per mile)
    const distanceMiles = totalDistance / 1609.34 // Convert meters to miles
    const avgPace = distanceMiles > 0 ? (totalDuration / 60) / distanceMiles : 0

    // Calculate per-mile splits
    const splits = calculateMileSplits(tracks)

    return {
      fileName: '', // Will be set by the caller
      tracks,
      totalDistance,
      totalDuration,
      elevationGain: totalElevationGain,
      startTime,
      endTime,
      avgPace,
      splits
    }
  } catch (error) {
    console.error('Error parsing GPX:', error)
    return null
  }
}

// Parse a single GPX file
export const parseGPXFile = async (file: File): Promise<GPXData | null> => {
  try {
    const text = await file.text()
    const gpxData = parseGPX(text)
    
    if (gpxData) {
      gpxData.fileName = file.name
    }
    
    return gpxData
  } catch (error) {
    console.error('Error reading GPX file:', error)
    return null
  }
}

// Parse multiple GPX files
export const parseMultipleGPXFiles = async (files: File[]): Promise<GPXData[]> => {
  const results = await Promise.all(
    files.map(file => parseGPXFile(file))
  )
  
  return results.filter((result): result is GPXData => result !== null)
}

// Utility functions for formatting
export const formatPace = (paceInMinutes: number): string => {
  const minutes = Math.floor(paceInMinutes)
  const seconds = Math.round((paceInMinutes - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export const formatDistance = (distanceInMeters: number): string => {
  return `${(distanceInMeters / 1609.34).toFixed(2)} mi`
}

export const formatDuration = (durationInSeconds: number): string => {
  const hours = Math.floor(durationInSeconds / 3600)
  const minutes = Math.floor((durationInSeconds % 3600) / 60)
  const seconds = durationInSeconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
