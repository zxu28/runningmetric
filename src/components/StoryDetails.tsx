import React, { useMemo, useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { RunningStory, MOOD_TAGS } from '../utils/storyTypes'
import { GPXData } from '../utils/gpxParser'
import { formatDistance, formatPace, formatDuration } from '../utils/gpxParser'
import { getRunId } from '../utils/storyTypes'
import { useStoriesContext } from '../contexts/StoriesContext'
import { generateStoryInsights } from '../utils/storyInsights'
import { exportStory, ExportOptions } from '../utils/storyExport'
import StoryMap from './StoryMap'
import PhotoGallery from './PhotoGallery'

interface StoryDetailsProps {
  story: RunningStory
  runs: GPXData[]
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

const StoryDetails: React.FC<StoryDetailsProps> = ({
  story,
  runs,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { stories } = useStoriesContext()
  
  // Get runs for this story
  const storyRuns = runs.filter(run => story.runIds.includes(getRunId(run)))

  // Generate insights
  const insights = useMemo(() => {
    return generateStoryInsights(story, stories, runs)
  }, [story, stories, runs])

  const [exporting, setExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  const handleExport = async (format: 'pdf' | 'image' | 'html') => {
    setExporting(true)
    setShowExportMenu(false)
    try {
      const options: ExportOptions = {
        format,
        includePhotos: true,
        includeMap: true,
        quality: 0.95,
      }
      await exportStory(story, runs, options)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export story. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  // Calculate story summary stats
  const totalDistance = storyRuns.reduce((sum, run) => sum + run.totalDistance, 0)
  const totalDuration = storyRuns.reduce((sum, run) => sum + run.totalDuration, 0)
  const totalElevation = storyRuns.reduce((sum, run) => sum + run.elevationGain, 0)
  const avgPace = totalDistance > 0 
    ? (totalDuration / 60) / (totalDistance / 1609.34) 
    : 0

  // Get date range
  const dates = storyRuns.map(run => run.startTime.getTime()).sort((a, b) => a - b)
  const startDate = dates.length > 0 ? new Date(dates[0]) : story.createdAt
  const endDate = dates.length > 0 ? new Date(dates[dates.length - 1]) : story.createdAt
  
  const dateRange = startDate.getTime() === endDate.getTime()
    ? startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`

  // Get mood tag details
  const moodTagDetails = story.moodTags
    .map(tagId => MOOD_TAGS.find(tag => tag.id === tagId))
    .filter(Boolean) as typeof MOOD_TAGS[number][]

  // Sort runs chronologically
  const sortedRuns = [...storyRuns].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white/90 backdrop-blur-sm rounded-organic-lg shadow-organic-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-earth-200 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-earth-800 mb-1">{story.title}</h2>
            <p className="text-sm text-earth-600">{dateRange}</p>
          </div>
          <button
            onClick={onClose}
            className="text-earth-500 hover:text-earth-700 transition-colors p-2 hover:bg-earth-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Story Map */}
          {storyRuns.length > 0 && (
            <div>
              <StoryMap 
                runs={storyRuns} 
                colorMode="date" 
                showMarkers={true}
                height="400px"
              />
            </div>
          )}

          {/* Description */}
          {story.description && (
            <div>
              <h3 className="text-sm font-medium text-earth-700 mb-2">Description</h3>
              <p className="text-earth-800 leading-relaxed">{story.description}</p>
            </div>
          )}

          {/* Mood Tags */}
          {moodTagDetails.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-earth-700 mb-3">How You Felt</h3>
              <div className="flex flex-wrap gap-2">
                {moodTagDetails.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-sage-100 text-sage-800 border-2 border-sage-200"
                  >
                    <span className="text-lg">{tag.emoji}</span>
                    <span>{tag.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Weather & Emotional Notes */}
          {(story.weatherNotes || story.emotionalNotes) && (
            <div className="space-y-4">
              {story.weatherNotes && (
                <div>
                  <h3 className="text-sm font-medium text-earth-700 mb-2">Weather</h3>
                  <div className="bg-earth-50 rounded-organic-lg p-4 border-2 border-earth-200">
                    <p className="text-earth-800">{story.weatherNotes}</p>
                  </div>
                </div>
              )}
              {story.emotionalNotes && (
                <div>
                  <h3 className="text-sm font-medium text-earth-700 mb-2">Emotional Context</h3>
                  <div className="bg-earth-50 rounded-organic-lg p-4 border-2 border-earth-200">
                    <p className="text-earth-800 whitespace-pre-wrap leading-relaxed">{story.emotionalNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Story Insights */}
          {insights.length > 0 && (
            <div className="bg-gradient-to-br from-terracotta-50 to-sage-50 rounded-organic-lg p-6 border-2 border-terracotta-200">
              <h3 className="text-lg font-semibold text-earth-800 mb-4">Story Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-organic-lg p-4 border-2 border-earth-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{insight.emoji}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-earth-800 mb-1">{insight.title}</h4>
                        <p className="text-sm text-earth-600 mb-2">{insight.description}</p>
                        {insight.value && (
                          <div className="text-xs font-medium text-sage-700 bg-sage-100 rounded-full px-3 py-1 inline-block">
                            {insight.value}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Story Summary Stats */}
          <div className="bg-gradient-to-br from-sage-50 to-moss-50 rounded-organic-lg p-6 border-2 border-sage-200">
            <h3 className="text-lg font-semibold text-earth-800 mb-4">Story Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-sage-700">{storyRuns.length}</div>
                <div className="text-xs text-sage-600 mt-1">Runs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-moss-700">{formatDistance(totalDistance)}</div>
                <div className="text-xs text-moss-600 mt-1">Total Distance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-terracotta-700">{formatDuration(totalDuration)}</div>
                <div className="text-xs text-terracotta-600 mt-1">Total Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-earth-700">{formatPace(avgPace)}</div>
                <div className="text-xs text-earth-600 mt-1">Avg Pace</div>
              </div>
            </div>
            {totalElevation > 0 && (
              <div className="mt-4 pt-4 border-t border-sage-200 text-center">
                <div className="text-xl font-bold text-earth-700">{totalElevation.toFixed(0)}m</div>
                <div className="text-xs text-earth-600 mt-1">Total Elevation Gain</div>
              </div>
            )}
          </div>

          {/* Photo Gallery */}
          {story.photos && story.photos.length > 0 && (
            <PhotoGallery
              photos={story.photos}
              coverPhotoId={story.coverPhotoId}
            />
          )}

          {/* Runs in Story */}
          <div>
            <h3 className="text-lg font-semibold text-earth-800 mb-4">
              Runs in This Story ({sortedRuns.length})
            </h3>
            <div className="space-y-3">
              {sortedRuns.map((run, index) => (
                <motion.div
                  key={getRunId(run)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/70 backdrop-blur-sm rounded-organic-lg p-4 border-2 border-earth-200 hover:border-sage-300 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-earth-800">{run.fileName}</p>
                      <p className="text-sm text-earth-600">
                        {run.startTime.toLocaleDateString()} • {formatDistance(run.totalDistance)} • {formatPace(run.avgPace)}
                      </p>
                      {run.tags && run.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {run.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-moss-100 text-moss-800 border border-moss-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-earth-700">{formatDuration(run.totalDuration)}</div>
                      {run.elevationGain > 0 && (
                        <div className="text-earth-600">{run.elevationGain.toFixed(0)}m</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {sortedRuns.length === 0 && (
              <div className="bg-earth-50/50 rounded-organic-lg p-8 text-center">
                <p className="text-earth-600">Some runs in this story may have been deleted.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-earth-200 flex gap-3">
          <button
            onClick={onDelete}
            className="px-6 py-3 rounded-organic-lg bg-terracotta-100 text-terracotta-800 border-2 border-terracotta-200 hover:bg-terracotta-200 transition-all duration-300 font-medium"
          >
            Delete Story
          </button>
          
          {/* Export Button */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting}
              className="px-6 py-3 rounded-organic-lg bg-moss-100 text-moss-800 border-2 border-moss-200 hover:bg-moss-200 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-moss-600 border-t-transparent rounded-full"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </>
              )}
            </button>
            
            {showExportMenu && !exporting && (
              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-organic-lg shadow-organic-lg border-2 border-earth-200 overflow-hidden z-10 min-w-[160px]">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left text-sm text-earth-700 hover:bg-earth-50 transition-colors flex items-center gap-2"
                >
                  <span>📄</span> Export as PDF
                </button>
                <button
                  onClick={() => handleExport('image')}
                  className="w-full px-4 py-2 text-left text-sm text-earth-700 hover:bg-earth-50 transition-colors flex items-center gap-2"
                >
                  <span>🖼️</span> Export as Image
                </button>
                <button
                  onClick={() => handleExport('html')}
                  className="w-full px-4 py-2 text-left text-sm text-earth-700 hover:bg-earth-50 transition-colors flex items-center gap-2"
                >
                  <span>🌐</span> Export as HTML
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onEdit}
            className="flex-1 px-6 py-3 rounded-organic-lg bg-sage-600 text-white border-2 border-sage-700 hover:bg-sage-700 shadow-organic-lg hover:shadow-organic transform hover:scale-105 transition-all duration-300 font-medium"
          >
            Edit Story
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default StoryDetails

