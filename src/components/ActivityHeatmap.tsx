import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GPXData } from '../utils/gpxParser'
import {
  processHeatmapData,
  getHeatmapDateRange,
  fillHeatmapDates,
  getIntensityLevel,
  getIntensityColor,
  HeatmapData
} from '../utils/heatmapData'
import { formatDistance } from '../utils/gpxParser'

interface ActivityHeatmapProps {
  runs: GPXData[]
  onDateClick?: (date: Date) => void
  range?: 'year' | 'all' | 'recent'
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  runs,
  onDateClick,
  range = 'recent' // Default to 'recent' (last 6 months)
}) => {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [hoveredValue, setHoveredValue] = useState<number>(0)
  const [hoveredRuns, setHoveredRuns] = useState<GPXData[]>([])

  const { heatmapData, startDate, endDate, maxValue } = useMemo(() => {
    const processed = processHeatmapData(runs)
    const { startDate, endDate } = getHeatmapDateRange(runs, range)
    const filled = fillHeatmapDates(processed, startDate, endDate)
    
    const maxValue = Math.max(...filled.map(d => d.value), 1)
    
    return {
      heatmapData: filled,
      startDate,
      endDate,
      maxValue
    }
  }, [runs, range])

  // Auto-scroll to show recent months when component mounts or data changes
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const hasAutoScrolledRef = useRef(false)
  
  useEffect(() => {
    if (scrollContainerRef.current && range === 'recent' && !hasAutoScrolledRef.current) {
      // Scroll to the right to show recent months (today is on the right)
      // Only do this once on initial load
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth
          hasAutoScrolledRef.current = true
        }
      }, 100) // Small delay to ensure DOM is ready
    }
  }, [heatmapData.length, range]) // Only trigger when data length changes, not on every render

  // Calculate weeks and days for grid
  const weeks = useMemo(() => {
    const weeks: Date[][] = []
    const currentDate = new Date(startDate)
    currentDate.setHours(0, 0, 0, 0)
    
    // Find the first Sunday (or start of week)
    const dayOfWeek = currentDate.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek
    currentDate.setDate(currentDate.getDate() - daysToSubtract)
    
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    
    while (currentDate <= end) {
      const week: Date[] = []
      for (let i = 0; i < 7; i++) {
        week.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }
      weeks.push(week)
    }
    
    return weeks
  }, [startDate, endDate])

  const handleCellHover = (date: Date, value: number, runs: GPXData[]) => {
    setHoveredDate(date)
    setHoveredValue(value)
    setHoveredRuns(runs)
  }

  const handleCellLeave = () => {
    setHoveredDate(null)
    setHoveredValue(0)
    setHoveredRuns([])
  }

  const handleCellClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date)
    }
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Get month labels - show at the first day of each month, not based on week start
  const monthPositions = useMemo(() => {
    const positions: { week: number; day: number; month: string }[] = []
    const seenMonths = new Set<string>()
    
    weeks.forEach((week, weekIndex) => {
      week.forEach((date, dayIndex) => {
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`
        const dayOfMonth = date.getDate()
        
        // Show month label on the 1st of each month, or if it's the first occurrence in the heatmap
        if (dayOfMonth === 1 || (!seenMonths.has(monthKey) && date >= startDate)) {
          seenMonths.add(monthKey)
          positions.push({ 
            week: weekIndex, 
            day: dayIndex,
            month: monthLabels[date.getMonth()] 
          })
        }
      })
    })
    
    return positions
  }, [weeks, startDate])

  if (heatmapData.length === 0) {
    return (
      <div className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6">
        <h3 className="text-xl font-bold text-earth-800 dark:text-earth-100 mb-4">Activity Heatmap</h3>
        <p className="text-earth-600 dark:text-earth-400 text-center py-8">
          No activity data available
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-earth-800 dark:text-earth-100">Activity Heatmap</h3>
        <div className="flex items-center gap-2 text-sm text-earth-600 dark:text-earth-400">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`w-3 h-3 rounded ${getIntensityColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="relative">
        <div 
          className="overflow-x-auto overflow-y-hidden" 
          ref={scrollContainerRef}
          style={{ 
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '8px' // Space for scrollbar
          }}
        >
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-2 relative" style={{ paddingLeft: '30px', height: '16px' }}>
            {monthPositions.map(({ week, day, month }, idx) => {
              // Calculate pixel position: 
              // - Each week column is w-3 (12px) + gap-1 (4px) = 16px total
              // - Day within week doesn't affect horizontal position (cells are stacked vertically)
              // - So position = week * 16px
              const leftPosition = week * 16
              return (
                <div
                  key={`${week}-${day}-${month}`}
                  className="absolute text-xs text-earth-600 dark:text-earth-400 font-medium whitespace-nowrap"
                  style={{ left: `${leftPosition}px` }}
                >
                  {month}
                </div>
              )
            })}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2">
              {dayLabels.map((day, idx) => (
                <div
                  key={day}
                  className="text-xs text-earth-600 dark:text-earth-400 font-medium h-3 flex items-center"
                  style={{ visibility: idx % 2 === 0 ? 'visible' : 'hidden' }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1 flex-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((date, dayIndex) => {
                    const dateKey = date.toISOString().split('T')[0]
                    const dayData = heatmapData.find(d => 
                      d.date.toISOString().split('T')[0] === dateKey
                    )
                    const value = dayData?.value || 0
                    const level = getIntensityLevel(value, maxValue)
                    const isToday = dateKey === new Date().toISOString().split('T')[0]
                    const isFuture = date > new Date()
                    
                    return (
                      <motion.div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`
                          w-3 h-3 rounded-sm cursor-pointer
                          ${getIntensityColor(level)}
                          ${isToday ? 'ring-2 ring-sage-500 dark:ring-sage-400' : ''}
                          ${isFuture ? 'opacity-30' : ''}
                        `}
                        whileHover={{ scale: 1.3 }}
                        onHoverStart={() => {
                          if (dayData) {
                            handleCellHover(date, value, dayData.runs)
                          }
                        }}
                        onHoverEnd={handleCellLeave}
                        onClick={() => {
                          if (!isFuture && dayData) {
                            handleCellClick(date)
                          }
                        }}
                        title={dayData ? `${date.toLocaleDateString()}: ${formatDistance(value * 1609.34)}` : ''}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Tooltip */}
      {hoveredDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-earth-100 dark:bg-earth-700 rounded-organic border-2 border-earth-200 dark:border-earth-600"
        >
          <div className="text-sm font-semibold text-earth-800 dark:text-earth-100">
            {hoveredDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="text-sm text-earth-600 dark:text-earth-300 mt-1">
            {formatDistance(hoveredValue * 1609.34)} • {hoveredRuns.length} {hoveredRuns.length === 1 ? 'run' : 'runs'}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ActivityHeatmap

