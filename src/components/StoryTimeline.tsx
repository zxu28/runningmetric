import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { RunningStory } from '../utils/storyTypes'
import { GPXData } from '../utils/gpxParser'
import { getRunId } from '../utils/storyTypes'
import StoryCard from './StoryCard'

interface StoryTimelineProps {
  stories: RunningStory[]
  runs: GPXData[]
  onViewStory: (story: RunningStory) => void
  onEditStory: (story: RunningStory) => void
  onDeleteStory: (id: string) => void
}

const StoryTimeline: React.FC<StoryTimelineProps> = ({
  stories,
  runs,
  onViewStory,
  onEditStory,
  onDeleteStory,
}) => {
  // Sort stories chronologically by earliest run date
  const sortedStories = useMemo(() => {
    return [...stories].sort((a, b) => {
      const getEarliestDate = (story: RunningStory) => {
        const storyRuns = runs.filter(run => story.runIds.includes(getRunId(run)))
        if (storyRuns.length === 0) return story.createdAt.getTime()
        const dates = storyRuns.map(run => run.startTime.getTime())
        return Math.min(...dates)
      }
      
      return getEarliestDate(a) - getEarliestDate(b)
    })
  }, [stories, runs])

  if (sortedStories.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📖</div>
        <p className="text-earth-700 text-lg mb-2">No stories yet</p>
        <p className="text-earth-600">Create your first story to see it on the timeline!</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-sage-300 via-sage-400 to-sage-300 rounded-full" />

      {/* Stories */}
      <div className="space-y-8">
        {sortedStories.map((story, index) => {
          // Get earliest and latest dates for this story
          const storyRuns = runs.filter(run => story.runIds.includes(getRunId(run)))
          const dates = storyRuns.length > 0
            ? storyRuns.map(run => run.startTime.getTime()).sort((a, b) => a - b)
            : [story.createdAt.getTime()]
          
          const earliestDate = new Date(Math.min(...dates))
          const latestDate = new Date(Math.max(...dates))

          return (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start gap-6"
            >
              {/* Timeline Dot */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-sage-500 border-4 border-white shadow-organic-lg flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
                {/* Date Label */}
                <div className="absolute left-20 top-1/2 -translate-y-1/2 whitespace-nowrap">
                  <div className="bg-earth-100 px-3 py-1 rounded-full text-xs font-medium text-earth-700 border-2 border-earth-200">
                    {earliestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {earliestDate.getTime() !== latestDate.getTime() && (
                      <span className="text-earth-500"> - {latestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Story Card */}
              <div className="flex-1 pt-2">
                <StoryCard
                  story={story}
                  runs={runs}
                  onView={() => onViewStory(story)}
                  onEdit={() => onEditStory(story)}
                  onDelete={() => onDeleteStory(story.id)}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Timeline End */}
      <div className="relative mt-8">
        <div className="absolute left-8 top-0 w-16 h-16 rounded-full bg-sage-200 border-4 border-white shadow-organic flex items-center justify-center">
          <span className="text-xl">✨</span>
        </div>
        <div className="ml-24 pt-2">
          <p className="text-earth-600 text-sm italic">Your running journey continues...</p>
        </div>
      </div>
    </div>
  )
}

export default StoryTimeline

