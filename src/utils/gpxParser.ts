// GPX Parser utility functions

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

export interface GPXData {
  fileName: string
  tracks: GPXTrack[]
  totalDistance: number
  totalDuration: number
  elevationGain: number
  startTime: Date
  endTime: Date
  avgPace: number
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
    const totalDuration = (endTime.getTime() - startTime.getTime()) / 1000 // in seconds
    
    // Calculate average pace (minutes per kilometer)
    const distanceKm = totalDistance / 1000
    const avgPace = distanceKm > 0 ? (totalDuration / 60) / distanceKm : 0

    return {
      fileName: '', // Will be set by the caller
      tracks,
      totalDistance,
      totalDuration,
      elevationGain: totalElevationGain,
      startTime,
      endTime,
      avgPace
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
  return `${(distanceInMeters / 1000).toFixed(2)} km`
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
