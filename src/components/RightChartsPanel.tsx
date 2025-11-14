import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GPXData } from '../utils/gpxParser'
import ElevationChart from './ElevationChart'

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
      <div className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100">Additional Charts</h3>
          <button
            onClick={() => setShowElevationChart(!showElevationChart)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
              showElevationChart
                ? 'bg-sage-200 dark:bg-sage-700 text-sage-800 dark:text-sage-100 shadow-organic'
                : 'bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-600'
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

    </motion.div>
  )
}

export default RightChartsPanel
