// Strava Stream Converter
// Converts Strava API streams to GPXPoint format for analysis

import { GPXPoint, GPXTrack, calculateMileSplits, GPXData } from './gpxParser'

export interface StravaStreams {
  latlng?: {
    data: number[][] // [[lat, lng], [lat, lng], ...]
  }
  time?: {
    data: number[] // [0, 1, 2, 3, ...] seconds from start
  }
  distance?: {
    data: number[] // [0, 10, 20, 30, ...] meters from start
  }
  altitude?: {
    data: number[] // [100, 101, 102, ...] meters elevation
  }
  heartrate?: {
    data: number[] // [120, 125, 130, ...] bpm
  }
}

export interface StravaActivity {
  id: number
  name: string
  type: string
  distance: number // meters
  moving_time: number // seconds
  elapsed_time: number // seconds
  total_elevation_gain: number // meters
  start_date: string // ISO 8601
  start_date_local: string
  average_speed: number // m/s
  max_speed: number // m/s
  map?: {
    summary_polyline: string
  }
}

/**
 * Convert Strava streams to GPXPoint format
 */
export function convertStravaStreamsToGPXPoints(
  streams: StravaStreams,
  startTime: Date
): GPXPoint[] {
  const points: GPXPoint[] = []
  
  // Check if we have the required data
  if (!streams.latlng?.data || !streams.time?.data) {
    console.warn('Missing required stream data (latlng or time)')
    return points
  }

  const latlngData = streams.latlng.data
  const timeData = streams.time.data
  const altitudeData = streams.altitude?.data || []
  // Note: distanceData available but not used in current implementation

  // Convert each point
  for (let i = 0; i < latlngData.length; i++) {
    const [lat, lng] = latlngData[i]
    const timeSeconds = timeData[i]
    const elevation = altitudeData[i] || 0
    // Note: distance data available but not used in current implementation

    // Calculate actual timestamp
    const timestamp = new Date(startTime.getTime() + timeSeconds * 1000)

    points.push({
      lat,
      lon: lng,
      elevation,
      time: timestamp
    })
  }

  console.log(`Converted ${points.length} Strava stream points to GPX format`)
  return points
}

/**
 * Convert Strava activity with streams to GPXData format
 */
export function convertStravaActivityToGPXData(
  activity: StravaActivity,
  streams: StravaStreams
): GPXData {
  const startTime = new Date(activity.start_date)
  
  // Convert streams to GPX points
  const points = convertStravaStreamsToGPXPoints(streams, startTime)
  
  // Create GPX track
  const track: GPXTrack = {
    name: activity.name,
    points: points
  }

  // Calculate splits from GPS data
  const splits = points.length > 0 ? calculateMileSplits([track]) : []

  // Calculate end time
  const endTime = points.length > 0 ? points[points.length - 1].time : startTime

  return {
    fileName: `${activity.name} (Strava)`,
    tracks: [track],
    totalDistance: activity.distance,
    totalDuration: activity.moving_time,
    avgPace: activity.moving_time / 60 / (activity.distance / 1609.34),
    elevationGain: activity.total_elevation_gain,
    startTime,
    endTime,
    splits,
    source: 'strava',
    stravaId: activity.id
  }
}

/**
 * Check if Strava streams have sufficient data for analysis
 */
export function validateStravaStreams(streams: StravaStreams): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []

  if (!streams.latlng?.data || streams.latlng.data.length === 0) {
    issues.push('Missing GPS coordinates')
  }

  if (!streams.time?.data || streams.time.data.length === 0) {
    issues.push('Missing time data')
  }

  if (streams.latlng?.data && streams.time?.data) {
    if (streams.latlng.data.length !== streams.time.data.length) {
      issues.push('GPS and time data length mismatch')
    }
  }

  if (!streams.distance?.data || streams.distance.data.length === 0) {
    issues.push('Missing distance data')
  }

  return {
    isValid: issues.length === 0,
    issues
  }
}

/**
 * Extract route polyline from Strava streams for map visualization
 */
export function extractRoutePolyline(streams: StravaStreams): [number, number][] {
  if (!streams.latlng?.data) {
    return []
  }

  return streams.latlng.data.map(([lat, lng]) => [lat, lng])
}
