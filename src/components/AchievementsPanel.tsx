import { useState } from 'react'
import { motion } from 'framer-motion'
import { Achievement, AchievementCategory, getAchievementsByCategory } from '../utils/achievements'
import { GPXData } from '../utils/gpxParser'
import AchievementBadge from './AchievementBadge'
import AchievementDetailModal from './AchievementDetailModal'

interface AchievementsPanelProps {
  achievements: Achievement[]
  unlockedIds: string[]
  runs?: GPXData[]
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  achievements,
  unlockedIds,
  runs = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all')
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const categories: (AchievementCategory | 'all')[] = ['all', 'runs', 'stories', 'streaks', 'milestones']
  const categoryLabels: Record<AchievementCategory | 'all', string> = {
    all: 'All',
    runs: 'Runs',
    stories: 'Stories',
    streaks: 'Streaks',
    milestones: 'Milestones'
  }

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : getAchievementsByCategory(selectedCategory)

  const unlockedCount = unlockedIds.length
  const totalCount = achievements.length

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAchievement(null)
  }

  return (
    <>
      <div className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-earth-800 dark:text-earth-100 mb-2">Achievements</h2>
          <p className="text-earth-600 dark:text-earth-400">
            {unlockedCount} of {totalCount} unlocked
          </p>
          <div className="mt-3 h-2 bg-earth-200 dark:bg-earth-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-sage-500 to-moss-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-organic text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-sage-600 text-white shadow-organic'
                  : 'bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-600'
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              unlocked={unlockedIds.includes(achievement.id)}
              onClick={() => handleAchievementClick(achievement)}
            />
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-8 text-earth-500 dark:text-earth-400">
            No achievements in this category
          </div>
        )}
      </div>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        unlocked={selectedAchievement ? unlockedIds.includes(selectedAchievement.id) : false}
        runs={runs}
      />
    </>
  )
}

export default AchievementsPanel

