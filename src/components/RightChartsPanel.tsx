import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GPXData } from '../utils/gpxParser'
import ElevationChart from './ElevationChart'
import TrendChartPlaceholder from './TrendChartPlaceholder'
import RunComparisonPlaceholder from './RunComparisonPlaceholder'
import GoalTrackerPlaceholder from './GoalTrackerPlaceholder'

interface RightChartsPanelProps {
  run: GPXData
  showElevation?: boolean
}

const RightChartsPanel: React.FC<RightChartsPanelProps> = ({ 
  run, 
  showElevation = true 
}) => {
  const [showElevationChart, setShowElevationChart] = useState(showElevation)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col gap-4"
    >
      {/* Elevation Chart Toggle */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Additional Charts</h3>
          <button
            onClick={() => setShowElevationChart(!showElevationChart)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              showElevationChart
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showElevationChart ? 'Hide' : 'Show'} Elevation
          </button>
        </div>
        
        {showElevationChart && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ElevationChart data={run.splits} />
          </motion.div>
        )}
      </div>

      {/* Placeholder Charts */}
      <TrendChartPlaceholder />
      <RunComparisonPlaceholder />
      <GoalTrackerPlaceholder />
    </motion.div>
  )
}

export default RightChartsPanel
