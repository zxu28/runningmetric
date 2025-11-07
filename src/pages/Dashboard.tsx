import { motion } from 'framer-motion'
import { useBestEfforts } from '../hooks/useBestEfforts'
import { useAchievements } from '../hooks/useAchievements'
import { useDataContext } from '../contexts/DataContext'
import AchievementsPanel from '../components/AchievementsPanel'
import GoalTracker from '../components/GoalTracker'
import ActivityHeatmap from '../components/ActivityHeatmap'

const Dashboard = () => {
  const { parsedData } = useDataContext()
  const { bestEfforts } = useBestEfforts(parsedData)
  const { achievements, unlockedIds } = useAchievements(bestEfforts)

  return (
    <div className="min-h-screen bg-organic-gradient dark:bg-gradient-to-br dark:from-earth-900 dark:via-earth-800 dark:to-earth-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-earth-800 dark:text-earth-100 mb-6 sm:mb-10">
            Dashboard
          </h1>
          
          <div className="space-y-6">
            {/* Activity Heatmap */}
            <ActivityHeatmap runs={parsedData} range="all" />
            
            {/* Achievements */}
            <AchievementsPanel achievements={achievements} unlockedIds={unlockedIds} runs={parsedData} />
            
            {/* Goals */}
            <GoalTracker />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard

