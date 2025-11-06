import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { Achievement } from '../utils/achievements'

interface AchievementPopupProps {
  achievement: Achievement
  onDismiss: () => void
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({
  achievement,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0, y: -50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: -50 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <div className="bg-white/95 dark:bg-earth-800/95 backdrop-blur-sm rounded-organic-lg shadow-organic-lg border-2 border-sage-300 dark:border-sage-600 p-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl flex-shrink-0 animate-float">
              {achievement.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-earth-800 dark:text-earth-100 mb-1">
                Achievement Unlocked!
              </h3>
              <div className="text-lg font-semibold text-sage-700 dark:text-sage-400 mb-2">
                {achievement.title}
              </div>
              <p className="text-sm text-earth-600 dark:text-earth-300">
                {achievement.description}
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 text-earth-400 dark:text-earth-500 hover:text-earth-600 dark:hover:text-earth-300 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AchievementPopup

