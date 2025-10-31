import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SyncProgressProps {
  isVisible: boolean
  stage: 'fetching' | 'processing' | 'saving'
  current: number
  total: number
  currentActivity?: string
  message?: string
}

const SyncProgress: React.FC<SyncProgressProps> = ({
  isVisible,
  stage,
  current,
  total,
  currentActivity,
  message
}) => {
  if (!isVisible) return null

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  const getStageLabel = () => {
    switch (stage) {
      case 'fetching':
        return 'Fetching activities from Strava...'
      case 'processing':
        return 'Processing activities...'
      case 'saving':
        return 'Saving to browser storage...'
      default:
        return 'Syncing...'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-2xl border-2 border-blue-500 p-6 max-w-md w-full mx-4"
        >
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{getStageLabel()}</h3>
              <span className="text-sm font-medium text-gray-600">{percentage}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              />
            </div>
            
            {/* Progress Text */}
            {total > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {current} of {total} activities
              </div>
            )}
            
            {/* Current Activity */}
            {currentActivity && (
              <div className="mt-2 text-sm text-gray-700 font-medium truncate">
                {currentActivity}
              </div>
            )}
            
            {/* Message */}
            {message && (
              <div className="mt-2 text-xs text-gray-500">
                {message}
              </div>
            )}
          </div>
          
          {/* Loading animation */}
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">Please wait...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SyncProgress

