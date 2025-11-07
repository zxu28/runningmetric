import { motion, AnimatePresence } from 'framer-motion'
import { Achievement } from '../utils/achievements'
import { GPXData, formatDistance, formatPace } from '../utils/gpxParser'

interface AchievementDetailModalProps {
  achievement: Achievement | null
  isOpen: boolean
  onClose: () => void
  unlocked: boolean
  runs?: GPXData[]
}

const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
  achievement,
  isOpen,
  onClose,
  unlocked,
  runs = []
}) => {
  if (!achievement) return null

  // Find contributing runs based on achievement type
  const getContributingRuns = (): GPXData[] => {
    if (!unlocked || !runs || runs.length === 0) return []

    switch (achievement.id) {
      case 'first-steps':
        return runs.length > 0 ? [runs.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0]] : []
      
      case 'fastest-mile':
      case 'speed-demon':
        // Find runs with fastest mile pace
        const fastestMileRun = runs.reduce((fastest, run) => {
          if (!fastest) return run
          return run.avgPace < fastest.avgPace ? run : fastest
        }, null as GPXData | null)
        return fastestMileRun ? [fastestMileRun] : []
      
      case 'longest-run':
      case 'marathon-distance':
        // Find longest run
        const longestRun = runs.reduce((longest, run) => {
          if (!longest) return run
          return run.totalDistance > longest.totalDistance ? run : longest
        }, null as GPXData | null)
        return longestRun ? [longestRun] : []
      
      case 'elevation-master':
      case 'mountain-goat':
        // Find runs with highest elevation
        const highestElevationRun = runs.reduce((highest, run) => {
          if (!highest) return run
          return run.elevationGain > highest.elevationGain ? run : highest
        }, null as GPXData | null)
        return highestElevationRun ? [highestElevationRun] : []
      
      case '5-runs-club':
      case '10-runs-club':
      case '25-runs-club':
      case '50-runs-club':
      case '100-runs-club':
      case '250-runs-club':
      case '500-runs-club':
        // Show first N runs
        const sortedRuns = [...runs].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
        const count = achievement.id === '5-runs-club' ? 5 :
                      achievement.id === '10-runs-club' ? 10 :
                      achievement.id === '25-runs-club' ? 25 :
                      achievement.id === '50-runs-club' ? 50 :
                      achievement.id === '100-runs-club' ? 100 :
                      achievement.id === '250-runs-club' ? 250 :
                      achievement.id === '500-runs-club' ? 500 : 0
        return sortedRuns.slice(0, Math.min(count, sortedRuns.length))
      
      default:
        // For other achievements, show recent runs that contributed
        return runs.slice(0, 5)
    }
  }

  const contributingRuns = getContributingRuns()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-earth-800 rounded-organic-lg shadow-organic-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-earth-200 dark:border-earth-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-earth-800 dark:text-earth-100">
                  Achievement Details
                </h2>
                <button
                  onClick={onClose}
                  className="text-earth-400 dark:text-earth-500 hover:text-earth-600 dark:hover:text-earth-300 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="text-center mb-6">
                  <div className={`text-8xl mb-4 ${unlocked ? 'animate-float' : 'grayscale opacity-50'}`}>
                    {achievement.emoji}
                  </div>
                  <h3 className={`text-3xl font-bold mb-2 ${unlocked ? 'text-earth-800 dark:text-earth-100' : 'text-earth-500 dark:text-earth-400'}`}>
                    {achievement.title}
                  </h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    unlocked 
                      ? 'bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-200' 
                      : 'bg-earth-100 dark:bg-earth-700 text-earth-600 dark:text-earth-400'
                  }`}>
                    {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-earth-600 dark:text-earth-400 mb-2 uppercase tracking-wide">
                      Description
                    </h4>
                    <p className={`text-lg leading-relaxed ${
                      unlocked 
                        ? 'text-earth-700 dark:text-earth-200' 
                        : 'text-earth-500 dark:text-earth-500'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>

                  {!unlocked && (
                    <div className="mt-6 p-4 bg-earth-100 dark:bg-earth-700 rounded-organic border-2 border-earth-200 dark:border-earth-600">
                      <div className="flex items-center gap-2 text-earth-600 dark:text-earth-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Locked</span>
                      </div>
                      <p className="text-sm text-earth-600 dark:text-earth-400 mt-2">
                        Keep running to unlock this achievement!
                      </p>
                    </div>
                  )}

                  {unlocked && (
                    <div className="mt-6 p-4 bg-sage-50 dark:bg-sage-900/30 rounded-organic border-2 border-sage-200 dark:border-sage-700">
                      <div className="flex items-center gap-2 text-sage-700 dark:text-sage-300">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Unlocked!</span>
                      </div>
                      <p className="text-sm text-sage-600 dark:text-sage-400 mt-2">
                        Congratulations! You've earned this achievement.
                      </p>
                    </div>
                  )}

                  {/* Contributing Runs */}
                  {unlocked && contributingRuns.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-earth-600 dark:text-earth-400 mb-3 uppercase tracking-wide">
                        Contributing Runs
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {contributingRuns.map((run, index) => (
                          <div
                            key={`${run.fileName}-${run.startTime.getTime()}`}
                            className="p-3 bg-earth-50 dark:bg-earth-700/50 rounded-organic border border-earth-200 dark:border-earth-600"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-earth-800 dark:text-earth-100 truncate">
                                  {run.fileName}
                                </div>
                                <div className="text-xs text-earth-600 dark:text-earth-400 mt-1">
                                  {run.startTime.toLocaleDateString()} • {formatDistance(run.totalDistance)} • {formatPace(run.avgPace)}
                                </div>
                              </div>
                              {index === 0 && contributingRuns.length === 1 && (
                                <span className="ml-2 text-xs font-medium text-sage-600 dark:text-sage-400">
                                  Key Run
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {contributingRuns.length < runs.length && (
                        <p className="text-xs text-earth-500 dark:text-earth-400 mt-2 italic">
                          Showing {contributingRuns.length} of {runs.length} runs
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-earth-200 dark:border-earth-700">
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 rounded-organic bg-sage-600 text-white hover:bg-sage-700 shadow-organic-lg transition-all duration-300 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AchievementDetailModal

