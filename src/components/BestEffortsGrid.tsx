import React from 'react'
import { motion } from 'framer-motion'
import { PersonalRecords } from '../utils/metrics'
import { formatDistance, formatPace, formatDuration } from '../utils/gpxParser'

interface BestEffortsGridProps {
  bestEfforts: PersonalRecords
  onRunClick?: (fileName: string) => void
}

const BestEffortsGrid: React.FC<BestEffortsGridProps> = ({ bestEfforts, onRunClick }) => {
  const efforts = [
    {
      id: 'fastest-mile',
      title: 'Fastest Mile',
      icon: '🏁',
      effort: bestEfforts.fastestMile,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'fastest-5k',
      title: 'Fastest 5K',
      icon: '🏃',
      effort: bestEfforts.fastest5K,
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'fastest-10k',
      title: 'Fastest 10K',
      icon: '⛰️',
      effort: bestEfforts.fastest10K,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'longest-run',
      title: 'Longest Run',
      icon: '🕒',
      effort: bestEfforts.longestRunDistance,
      gradient: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {efforts.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative"
        >
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            {/* Icon and Title */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{item.icon}</span>
              <h3 className="text-sm font-medium text-gray-600">{item.title}</h3>
            </div>

            {/* Effort Data */}
            {item.effort ? (
              <div className="space-y-2">
                {/* Main Metric */}
                <div>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                    {item.id === 'longest-run' 
                      ? formatDistance(item.effort.distance)
                      : formatPace(item.effort.pace)
                    }
                  </div>
                  {item.id !== 'longest-run' && (
                    <div className="text-sm text-gray-500">
                      {formatDuration(item.effort.time)}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="text-xs text-gray-500">
                  {item.effort.date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>

                {/* Run Name (clickable) */}
                {onRunClick && (
                  <button
                    onClick={() => onRunClick(item.effort!.fileName)}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate max-w-full text-left"
                  >
                    {item.effort.fileName}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-gray-400 text-sm">No data yet</div>
                <div className="text-gray-300 text-xs mt-1">Upload runs to track this</div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default BestEffortsGrid

