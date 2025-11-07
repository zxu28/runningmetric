// Data Export Utilities
// Export running data as JSON or CSV for backup

import { GPXData } from './gpxParser'
import { RunningStory } from './storyTypes'
import { RunningGoal } from './goalTypes'

export interface ExportData {
  runs: GPXData[]
  stories: RunningStory[]
  goals: RunningGoal[]
  achievements: string[]
  customTags: string[]
  exportDate: string
  version: string
}

/**
 * Export all data as JSON
 */
export function exportDataAsJSON(
  runs: GPXData[],
  stories: RunningStory[],
  goals: RunningGoal[],
  achievements: string[],
  customTags: string[]
): void {
  const exportData: ExportData = {
    runs,
    stories,
    goals,
    achievements,
    customTags,
    exportDate: new Date().toISOString(),
    version: '1.0'
  }

  const jsonStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `running-metrics-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export runs as CSV
 */
export function exportRunsAsCSV(runs: GPXData[]): void {
  if (runs.length === 0) {
    alert('No runs to export')
    return
  }

  // CSV headers
  const headers = [
    'Date',
    'File Name',
    'Source',
    'Distance (miles)',
    'Distance (meters)',
    'Duration (minutes)',
    'Avg Pace (min/mile)',
    'Elevation Gain (meters)',
    'Tags',
    'Notes'
  ]

  // Convert runs to CSV rows
  const rows = runs.map(run => {
    const distanceMiles = (run.totalDistance / 1609.34).toFixed(2)
    const durationMinutes = (run.totalDuration / 60).toFixed(2)
    const avgPace = run.avgPace.toFixed(2)
    const tags = (run.tags || []).join('; ')
    const notes = (run.notes || '').replace(/"/g, '""') // Escape quotes for CSV
    const source = run.source || 'gpx'
    
    return [
      run.startTime.toISOString().split('T')[0],
      run.fileName.replace(/"/g, '""'),
      source,
      distanceMiles,
      run.totalDistance.toFixed(2),
      durationMinutes,
      avgPace,
      run.elevationGain.toFixed(2),
      tags,
      notes
    ]
  })

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `running-metrics-runs-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Import data from JSON backup
 */
export function importDataFromJSON(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content) as ExportData
        
        // Validate data structure
        if (!data.runs || !Array.isArray(data.runs)) {
          throw new Error('Invalid backup file: missing runs data')
        }
        
        // Convert date strings back to Date objects
        const processedData: ExportData = {
          ...data,
          runs: data.runs.map(run => ({
            ...run,
            startTime: new Date(run.startTime),
            endTime: new Date(run.endTime),
            tracks: run.tracks.map(track => ({
              ...track,
              points: track.points.map(point => ({
                ...point,
                time: new Date(point.time)
              }))
            })),
            splits: run.splits.map(split => ({
              ...split,
              startTime: new Date(split.startTime),
              endTime: new Date(split.endTime)
            }))
          })),
          stories: data.stories?.map(story => ({
            ...story,
            createdAt: new Date(story.createdAt),
            updatedAt: new Date(story.updatedAt),
            photos: story.photos?.map(photo => ({
              ...photo,
              uploadDate: new Date(photo.uploadDate)
            }))
          })) || [],
          goals: data.goals?.map(goal => ({
            ...goal,
            startDate: new Date(goal.startDate),
            endDate: new Date(goal.endDate),
            completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined
          })) || []
        }
        
        resolve(processedData)
      } catch (error) {
        reject(new Error(`Failed to parse backup file: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

