import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GPXData } from '../utils/gpxParser'
import { TimePeriod, getWeeklyTrends, getMonthlyTrends } from '../utils/trendAnalysis'
import WeeklyDistanceChart from './WeeklyDistanceChart'
import PaceTrendChart from './PaceTrendChart'
import ElevationTrendChart from './ElevationTrendChart'

interface StatsOverviewProps {
  runs: GPXData[]
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ runs }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('last4weeks')
  const [isExpanded, setIsExpanded] = useState(true)

  const periods: { value: TimePeriod; label: string }[] = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'last4weeks', label: 'Last 4 Weeks' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'allTime', label: 'All Time' }
  ]

  // Calculate trends based on selected period
  const trendData = useMemo(() => {
    if (['last7days', 'last30days', 'last90days', 'last4weeks'].includes(selectedPeriod)) {
      return getWeeklyTrends(runs, selectedPeriod)
    } else {
      return getMonthlyTrends(runs, selectedPeriod)
    }
  }, [runs, selectedPeriod])

  if (runs.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-lg shadow-md mb-8 overflow-hidden"
    >
      {/* Header with Period Selector */}
      <div 
        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 cursor-pointer hover:from-blue-100 hover:to-purple-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
            <h2 className="text-xl font-semibold text-gray-900">Trends & Progress</h2>
            <span className="text-sm text-gray-600">({trendData.length} periods)</span>
          </div>

          {/* Period Selector - only show when expanded */}
          {isExpanded && (
            <div 
              className="flex flex-wrap gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {periods.map(period => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          {trendData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <WeeklyDistanceChart data={trendData} />
              <PaceTrendChart data={trendData} />
              <ElevationTrendChart data={trendData} />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>No runs found for the selected period</p>
              <p className="text-sm mt-1">Try selecting a different time range</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export default StatsOverview

