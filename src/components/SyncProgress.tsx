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

  const getStageEmoji = () => {
    switch (stage) {
      case 'fetching':
        return '📥'
      case 'processing':
        return '⚙️'
      case 'saving':
        return '💾'
      default:
        return '🔄'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 dark:bg-earth-800/90 backdrop-blur-sm rounded-organic-lg shadow-organic-lg border-2 border-sage-400 dark:border-sage-600 p-6 max-w-md w-full mx-4"
        >
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getStageEmoji()}</span>
                <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100">
                  {getStageLabel()}
                </h3>
              </div>
              <span className="text-sm font-medium text-sage-600 dark:text-sage-400">
                {percentage}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-earth-200 dark:bg-earth-700 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-sage-500 via-moss-500 to-sage-600 rounded-full shadow-organic"
              />
            </div>
            
            {/* Progress Text */}
            {total > 0 && (
              <div className="mt-3 text-sm text-earth-700 dark:text-earth-300 font-medium">
                {current} of {total} activities
              </div>
            )}
            
            {/* Current Activity */}
            {currentActivity && (
              <div className="mt-2 text-sm text-earth-600 dark:text-earth-400 font-medium truncate">
                <span className="text-sage-600 dark:text-sage-400">→</span> {currentActivity}
              </div>
            )}
            
            {/* Message */}
            {message && (
              <div className="mt-2 text-xs text-earth-500 dark:text-earth-500 italic">
                {message}
              </div>
            )}
          </div>
          
          {/* Loading animation */}
          <div className="flex items-center justify-center space-x-2 pt-2 border-t border-earth-200 dark:border-earth-700">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-sage-500 border-t-transparent rounded-full"
            />
            <span className="text-sm text-earth-600 dark:text-earth-400">Please wait...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SyncProgress

