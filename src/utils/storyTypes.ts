// Running Story Types and Utilities

export interface StoryPhoto {
  id: string
  data: string // base64 encoded image
  thumbnail?: string // base64 encoded thumbnail
  fileName: string
  uploadDate: Date
}

export interface RunningStory {
  id: string
  title: string
  description?: string
  runIds: string[] // Array of run identifiers: fileName + startTime.getTime()
  moodTags: string[] // Predefined mood tags
  weatherNotes?: string
  emotionalNotes?: string
  photos?: StoryPhoto[] // Array of photos
  coverPhotoId?: string // ID of the photo to use as cover
  createdAt: Date
  updatedAt: Date
}

// Predefined mood tags with emoji mapping
export const MOOD_TAGS = [
  { id: 'energetic', label: 'Energetic', emoji: '🚀' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'motivated', label: 'Motivated', emoji: '💪' },
  { id: 'struggle', label: 'Struggle', emoji: '😓' },
  { id: 'proud', label: 'Proud', emoji: '🎉' },
  { id: 'fast', label: 'Fast', emoji: '🏃' },
  { id: 'slow', label: 'Slow', emoji: '🐌' },
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'disappointed', label: 'Disappointed', emoji: '😔' },
] as const

export type MoodTagId = typeof MOOD_TAGS[number]['id']

// Helper function to get run ID from GPXData
export function getRunId(run: { fileName: string; startTime: Date }): string {
  return `${run.fileName}-${run.startTime.getTime()}`
}

// Helper function to parse run ID back to components
export function parseRunId(runId: string): { fileName: string; startTime: number } | null {
  const parts = runId.split('-')
  if (parts.length < 2) return null
  
  const timestamp = parseInt(parts[parts.length - 1])
  if (isNaN(timestamp)) return null
  
  const fileName = parts.slice(0, -1).join('-')
  return { fileName, startTime: timestamp }
}

