// Story Storage Utilities for localStorage persistence

import { RunningStory } from './storyTypes'

const STORAGE_KEY = 'runningStories'

// Serialize story (convert Date objects to ISO strings)
function serializeStory(story: RunningStory): any {
  return {
    ...story,
    createdAt: story.createdAt.toISOString(),
    updatedAt: story.updatedAt.toISOString(),
    photos: story.photos?.map(photo => ({
      ...photo,
      uploadDate: photo.uploadDate.toISOString(),
    })),
  }
}

// Deserialize story (convert ISO strings back to Date objects)
function deserializeStory(data: any): RunningStory {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    photos: data.photos?.map((photo: any) => ({
      ...photo,
      uploadDate: new Date(photo.uploadDate),
    })),
  }
}

// Save stories to localStorage
export function saveStories(stories: RunningStory[]): void {
  try {
    const serialized = stories.map(serializeStory)
    const dataStr = JSON.stringify(serialized)
    const dataSizeMB = (dataStr.length / 1024 / 1024).toFixed(2)
    
    console.log(`Saving ${stories.length} stories to localStorage (${dataSizeMB} MB)`)
    
    // Check localStorage quota before saving
    const quotaEstimate = 5 * 1024 * 1024 // ~5MB typical limit
    if (dataStr.length > quotaEstimate * 0.9) {
      console.warn(`⚠️ Warning: Stories data size (${dataSizeMB} MB) is approaching localStorage limit`)
    }
    
    // Always save, even if empty array (to ensure persistence state is clear)
    // This ensures stories persist across page refreshes
    localStorage.setItem(STORAGE_KEY, dataStr)
  } catch (error) {
    console.error('Failed to save stories to localStorage:', error)
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please delete some stories or runs to free up space.')
    }
    throw error
  }
}

// Load stories from localStorage
export function loadStories(): RunningStory[] {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY)
    if (!storedData) {
      return []
    }
    
    const parsed = JSON.parse(storedData)
    if (!Array.isArray(parsed)) {
      console.warn('Invalid stories data in localStorage, returning empty array')
      return []
    }
    
    return parsed.map(deserializeStory)
  } catch (error) {
    console.error('Failed to load stories from localStorage:', error)
    return []
  }
}

// Create a new story with auto-generated ID and timestamps
export function createStory(
  title: string,
  runIds: string[],
  moodTags: string[] = [],
  description?: string,
  weatherNotes?: string,
  emotionalNotes?: string
): RunningStory {
  const now = new Date()
  const id = `story-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    id,
    title,
    description,
    runIds,
    moodTags,
    weatherNotes,
    emotionalNotes,
    createdAt: now,
    updatedAt: now,
  }
}

// Check if localStorage is available
export function isStoryStorageAvailable(): boolean {
  try {
    const test = '__story_storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Clear all stories
export function clearStories(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('Stories cleared from localStorage')
  } catch (error) {
    console.error('Failed to clear stories from localStorage:', error)
  }
}

