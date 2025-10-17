import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PRBadgeProps {
  prTypes: string[]
  onDismiss: () => void
  autoDismiss?: boolean
  dismissDelay?: number
}

const PRBadge: React.FC<PRBadgeProps> = ({ 
  prTypes, 
  onDismiss, 
  autoDismiss = true, 
  dismissDelay = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoDismiss && prTypes.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300) // Allow exit animation to complete
      }, dismissDelay)

      return () => clearTimeout(timer)
    }
  }, [prTypes, autoDismiss, dismissDelay, onDismiss])

  if (prTypes.length === 0) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ 
            type: 'spring', 
            stiffness: 500, 
            damping: 30 
          }}
          className="fixed top-20 right-4 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-2xl p-4 border-2 border-yellow-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <motion.span 
                  className="text-4xl"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  🏆
                </motion.span>
                <div>
                  <h3 className="text-white font-bold text-lg">New Personal Record!</h3>
                  <div className="mt-1 space-y-1">
                    {prTypes.map((pr, index) => (
                      <motion.div
                        key={pr}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-white text-sm"
                      >
                        ✨ {pr}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(onDismiss, 300)
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PRBadge

