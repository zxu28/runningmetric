// LocalStorage Utilities for Best Efforts Persistence

import { PersonalRecords, BestEffort } from './metrics'

const STORAGE_KEY = 'running-metrics-best-efforts'

// Serialize BestEffort (convert Date objects to strings)
function serializeBestEffort(effort: BestEffort | null): any {
  if (!effort) return null
  
  return {
    ...effort,
    date: effort.date.toISOString(),
    startTime: effort.startTime.toISOString()
  }
}

// Deserialize BestEffort (convert strings back to Date objects)
function deserializeBestEffort(data: any): BestEffort | null {
  if (!data) return null
  
  return {
    ...data,
    date: new Date(data.date),
    startTime: new Date(data.startTime)
  }
}

// Save best efforts to localStorage
export function saveBestEfforts(prs: PersonalRecords): void {
  try {
    const serialized = {
      fastestMile: serializeBestEffort(prs.fastestMile),
      fastest5K: serializeBestEffort(prs.fastest5K),
      fastest10K: serializeBestEffort(prs.fastest10K),
      longestRunDistance: serializeBestEffort(prs.longestRunDistance),
      longestRunTime: serializeBestEffort(prs.longestRunTime),
      lastUpdated: new Date().toISOString()
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized))
  } catch (error) {
    console.error('Failed to save best efforts to localStorage:', error)
  }
}

// Load best efforts from localStorage
export function loadBestEfforts(): PersonalRecords | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    
    if (!stored) return null
    
    const parsed = JSON.parse(stored)
    
    return {
      fastestMile: deserializeBestEffort(parsed.fastestMile),
      fastest5K: deserializeBestEffort(parsed.fastest5K),
      fastest10K: deserializeBestEffort(parsed.fastest10K),
      longestRunDistance: deserializeBestEffort(parsed.longestRunDistance),
      longestRunTime: deserializeBestEffort(parsed.longestRunTime)
    }
  } catch (error) {
    console.error('Failed to load best efforts from localStorage:', error)
    return null
  }
}

// Clear best efforts from localStorage
export function clearBestEfforts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear best efforts from localStorage:', error)
  }
}

// Check if localStorage is available
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

