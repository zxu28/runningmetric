import React, { useState } from 'react'
import Calendar from 'react-calendar'
import { motion, AnimatePresence } from 'framer-motion'
import { RunningStory } from '../utils/storyTypes'
import { GPXData } from '../utils/gpxParser'
import { getRunId } from '../utils/storyTypes'
import StoryCard from './StoryCard'
import 'react-calendar/dist/Calendar.css'

interface StoryCalendarProps {
  stories: RunningStory[]
  runs: GPXData[]
  onViewStory: (story: RunningStory) => void
  onEditStory: (story: RunningStory) => void
  onDeleteStory: (id: string) => void
}

const StoryCalendar: React.FC<StoryCalendarProps> = ({
  stories,
  runs,
  onViewStory,
  onEditStory,
  onDeleteStory,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Get stories for a specific date
  const getStoriesForDate = (date: Date): RunningStory[] => {
    return stories.filter(story => {
      const storyRuns = runs.filter(run => story.runIds.includes(getRunId(run)))
      return storyRuns.some(run => {
        const runDate = run.startTime
        return (
          runDate.getFullYear() === date.getFullYear() &&
          runDate.getMonth() === date.getMonth() &&
          runDate.getDate() === date.getDate()
        )
      })
    })
  }

  // Check if date has stories
  const hasStoriesOnDate = (date: Date): boolean => {
    return getStoriesForDate(date).length > 0
  }

  // Get story count for date
  const getStoryCountForDate = (date: Date): number => {
    return getStoriesForDate(date).length
  }

  const tileClassName = ({ date }: { date: Date }) => {
    const classes: string[] = ['hover:bg-earth-50']
    
    if (hasStoriesOnDate(date)) {
      classes.push('bg-sage-100')
      
      if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
        classes.push('bg-sage-500 text-white')
      }
    }
    
    // Highlight today
    if (date.toDateString() === new Date().toDateString()) {
      classes.push('border-2 border-sage-400')
    }
    
    return classes.join(' ')
  }

  const tileContent = ({ date }: { date: Date }) => {
    const count = getStoryCountForDate(date)
    
    if (count > 0) {
      return (
        <div className="flex justify-center mt-1">
          <div className="w-2 h-2 rounded-full bg-sage-600"></div>
        </div>
      )
    }
    
    return null
  }

  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      const storiesOnDate = getStoriesForDate(value)
      if (storiesOnDate.length > 0) {
        setSelectedDate(value)
      } else {
        setSelectedDate(null)
      }
    }
  }

  const selectedDateStories = selectedDate ? getStoriesForDate(selectedDate) : []

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={tileClassName}
          tileContent={tileContent}
          className="w-full border-0"
        />
      </div>

      {/* Stories for Selected Date */}
      <AnimatePresence>
        {selectedDate && selectedDateStories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-earth-800">
                Stories on {selectedDate.toLocaleDateString()}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm text-earth-600 hover:text-earth-800 px-3 py-1 rounded-full hover:bg-earth-100 transition-all duration-300"
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDateStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  runs={runs}
                  onView={() => onViewStory(story)}
                  onEdit={() => onEditStory(story)}
                  onDelete={() => onDeleteStory(story.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Date Selected Message */}
      {!selectedDate && (
        <div className="text-center py-8 bg-earth-50/50 rounded-organic-lg">
          <p className="text-earth-600">Click on a date with stories to view them</p>
        </div>
      )}
    </div>
  )
}

export default StoryCalendar

