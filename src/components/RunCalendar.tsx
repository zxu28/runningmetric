import React from 'react'
import Calendar from 'react-calendar'
import { motion } from 'framer-motion'
import { GPXData } from '../utils/gpxParser'
import { hasRunsOnDate, getRunCountForDate, getRunsForDate } from '../utils/runHelpers'
import 'react-calendar/dist/Calendar.css'

interface RunCalendarProps {
  runs: GPXData[]
  selectedRun: GPXData | null
  onSelectRun: (run: GPXData) => void
}

const RunCalendar: React.FC<RunCalendarProps> = ({ runs, selectedRun, onSelectRun }) => {
  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      const runsOnDate = getRunsForDate(runs, value)
      if (runsOnDate.length > 0) {
        // Select the first run on this date (could be extended to show multiple)
        onSelectRun(runsOnDate[0])
      }
    }
  }

  const getTileClassName = ({ date }: { date: Date }) => {
    const classes = ['hover:bg-gray-50']
    
    if (hasRunsOnDate(runs, date)) {
      classes.push('bg-blue-100')
      
      // Highlight selected run's date
      if (selectedRun && date.toDateString() === selectedRun.startTime.toDateString()) {
        classes.push('bg-blue-500 text-white')
      }
    }
    
    // Highlight today
    if (date.toDateString() === new Date().toDateString()) {
      classes.push('border-2 border-blue-300')
    }
    
    return classes.join(' ')
  }

  const getTileContent = ({ date }: { date: Date }) => {
    const runCount = getRunCountForDate(runs, date)
    
    if (runCount > 0) {
      return (
        <div className="flex justify-center mt-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          {runCount > 1 && (
            <span className="ml-1 text-xs font-bold text-blue-600">
              {runCount}
            </span>
          )}
        </div>
      )
    }
    
    return null
  }

  if (runs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Running Calendar</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p>No runs to display</p>
            <p className="text-sm">Upload GPX files to see your running calendar</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Running Calendar</h3>
      
      <Calendar
        onChange={handleDateChange}
        value={selectedRun ? selectedRun.startTime : new Date()}
        tileClassName={getTileClassName}
        tileContent={getTileContent}
        className="w-full"
        calendarType="gregory"
        showNeighboringMonth={false}
      />
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
          <span className="text-gray-600">Has runs</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
          <span className="text-gray-600">Run indicator</span>
        </div>
      </div>
    </motion.div>
  )
}

export default RunCalendar
