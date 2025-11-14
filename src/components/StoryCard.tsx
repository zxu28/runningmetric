import React, { useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { RunningStory, MOOD_TAGS } from '../utils/storyTypes'
import { GPXData } from '../utils/gpxParser'
import { formatDistance, formatPace } from '../utils/gpxParser'
import { getRunId } from '../utils/storyTypes'
import { useStoriesContext } from '../contexts/StoriesContext'
import { getTopInsight, generateStoryInsights } from '../utils/storyInsights'
import StoryMap from './StoryMap'

interface StoryCardProps {
  story: RunningStory
  runs: GPXData[]
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

const StoryCard: React.FC<StoryCardProps> = ({ story, runs, onView, onEdit, onDelete }) => {
  const { stories } = useStoriesContext()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  
  // Get runs for this story
  const storyRuns = runs.filter(run => story.runIds.includes(getRunId(run)))
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open story if clicking on the map area
    if (mapContainerRef.current && mapContainerRef.current.contains(e.target as Node)) {
      return
    }
    onView()
  }

  // Get top insight
  const topInsight = useMemo(() => {
    const insights = generateStoryInsights(story, stories, runs)
    return getTopInsight(insights)
  }, [story, stories, runs])

  // Calculate story summary stats
  const totalDistance = storyRuns.reduce((sum, run) => sum + run.totalDistance, 0)
  const totalDuration = storyRuns.reduce((sum, run) => sum + run.totalDuration, 0)
  const avgPace = totalDistance > 0 
    ? (totalDuration / 60) / (totalDistance / 1609.34) 
    : 0

  // Get date range
  const dates = storyRuns.map(run => run.startTime.getTime()).sort((a, b) => a - b)
  const startDate = dates.length > 0 ? new Date(dates[0]) : story.createdAt
  const endDate = dates.length > 0 ? new Date(dates[dates.length - 1]) : story.createdAt
  
  const dateRange = startDate.getTime() === endDate.getTime()
    ? startDate.toLocaleDateString()
    : `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`

  // Get mood tag details
  const moodTagDetails = story.moodTags
    .map(tagId => MOOD_TAGS.find(tag => tag.id === tagId))
    .filter(Boolean) as typeof MOOD_TAGS[number][]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic hover:shadow-organic-lg border-2 border-earth-200 overflow-hidden transition-shadow duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h3 className="text-xl font-bold text-earth-800 mb-1 truncate flex-1">
                {story.title}
              </h3>
              {topInsight && (
                <div className="flex-shrink-0" title={topInsight.description}>
                  <span className="text-2xl">{topInsight.emoji}</span>
                </div>
              )}
            </div>
            {story.description && (
              <p className="text-earth-600 text-sm line-clamp-2 mb-2">
                {story.description}
              </p>
            )}
            <p className="text-xs text-earth-500">
              {dateRange}
            </p>
          </div>
        </div>

        {/* Mood Tags */}
        {moodTagDetails.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {moodTagDetails.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-sage-100 text-sage-800 border border-sage-200"
              >
                <span>{tag.emoji}</span>
                <span>{tag.label}</span>
              </span>
            ))}
          </div>
        )}

        {/* Story Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-earth-50/50 rounded-organic p-3 text-center">
            <div className="text-lg font-bold text-earth-700">{storyRuns.length}</div>
            <div className="text-xs text-earth-600">Runs</div>
          </div>
          <div className="bg-sage-50/50 rounded-organic p-3 text-center">
            <div className="text-lg font-bold text-sage-700">{formatDistance(totalDistance)}</div>
            <div className="text-xs text-sage-600">Distance</div>
          </div>
          <div className="bg-moss-50/50 rounded-organic p-3 text-center">
            <div className="text-lg font-bold text-moss-700">{formatPace(avgPace)}</div>
            <div className="text-xs text-moss-600">Avg Pace</div>
          </div>
        </div>

        {/* Map Preview */}
        {storyRuns.length > 0 && (
          <div 
            ref={mapContainerRef}
            className="mb-4 overflow-hidden rounded-organic"
            onClick={(e) => e.stopPropagation()}
          >
            <StoryMap 
              runs={storyRuns} 
              colorMode="date" 
              showMarkers={false} 
              height="200px"
              compact={true}
            />
          </div>
        )}

        {/* Notes Preview */}
        {(story.weatherNotes || story.emotionalNotes) && (
          <div className="space-y-2 mb-4">
            {story.weatherNotes && (
              <div className="text-xs text-earth-600 bg-earth-50/50 rounded-organic p-2">
                <span className="font-medium">Weather:</span> {story.weatherNotes}
              </div>
            )}
            {story.emotionalNotes && (
              <div className="text-xs text-earth-600 bg-earth-50/50 rounded-organic p-2 line-clamp-2">
                <span className="font-medium">Feeling:</span> {story.emotionalNotes}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-earth-200" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView()
            }}
            className="flex-1 px-4 py-2 text-sm rounded-organic bg-sage-600 text-white hover:bg-sage-700 transition-all duration-300 font-medium"
          >
            View Details
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="px-4 py-2 text-sm rounded-organic bg-earth-200 text-earth-800 hover:bg-earth-300 transition-all duration-300 font-medium"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('Are you sure you want to delete this story?')) {
                onDelete()
              }
            }}
            className="px-4 py-2 text-sm rounded-organic bg-terracotta-100 text-terracotta-800 hover:bg-terracotta-200 transition-all duration-300 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default StoryCard

