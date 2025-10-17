import { GPXData } from './gpxParser'

// Group runs by date
export const groupRunsByDate = (runs: GPXData[]): Map<string, GPXData[]> => {
  const runsByDate = new Map<string, GPXData[]>()
  
  runs.forEach(run => {
    const dateKey = formatDateKey(run.startTime)
    if (!runsByDate.has(dateKey)) {
      runsByDate.set(dateKey, [])
    }
    runsByDate.get(dateKey)!.push(run)
  })
  
  return runsByDate
}

// Format date for calendar key (YYYY-MM-DD)
export const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

// Get most recent run
export const getMostRecentRun = (runs: GPXData[]): GPXData | null => {
  if (runs.length === 0) return null
  
  return runs.reduce((mostRecent, current) => {
    return current.startTime > mostRecent.startTime ? current : mostRecent
  })
}

// Extract coordinates from GPX data
export const extractCoordinates = (run: GPXData): [number, number][] => {
  const coordinates: [number, number][] = []
  
  run.tracks.forEach(track => {
    track.points.forEach(point => {
      coordinates.push([point.lat, point.lon])
    })
  })
  
  return coordinates
}

// Calculate map bounds from coordinates
export const calculateBounds = (coordinates: [number, number][]): [[number, number], [number, number]] => {
  if (coordinates.length === 0) {
    // Default bounds (San Francisco area)
    return [[37.7749, -122.4194], [37.7849, -122.4094]]
  }
  
  let minLat = coordinates[0][0]
  let maxLat = coordinates[0][0]
  let minLon = coordinates[0][1]
  let maxLon = coordinates[0][1]
  
  coordinates.forEach(([lat, lon]) => {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLon = Math.min(minLon, lon)
    maxLon = Math.max(maxLon, lon)
  })
  
  // Add padding to bounds
  const latPadding = (maxLat - minLat) * 0.1
  const lonPadding = (maxLon - minLon) * 0.1
  
  return [
    [minLat - latPadding, minLon - lonPadding],
    [maxLat + latPadding, maxLon + lonPadding]
  ]
}

// Get run count for a specific date
export const getRunCountForDate = (runs: GPXData[], date: Date): number => {
  const dateKey = formatDateKey(date)
  const runsByDate = groupRunsByDate(runs)
  return runsByDate.get(dateKey)?.length || 0
}

// Get runs for a specific date
export const getRunsForDate = (runs: GPXData[], date: Date): GPXData[] => {
  const dateKey = formatDateKey(date)
  const runsByDate = groupRunsByDate(runs)
  return runsByDate.get(dateKey) || []
}

// Check if a date has runs
export const hasRunsOnDate = (runs: GPXData[], date: Date): boolean => {
  return getRunCountForDate(runs, date) > 0
}
