import { useState } from 'react'
import { motion } from 'framer-motion'
import { Achievement, AchievementCategory, getAchievementsByCategory } from '../utils/achievements'
import AchievementBadge from './AchievementBadge'

interface AchievementsPanelProps {
  achievements: Achievement[]
  unlockedIds: string[]
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  achievements,
  unlockedIds
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all')

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

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-earth-800 mb-2">Achievements</h2>
        <p className="text-earth-600">
          {unlockedCount} of {totalCount} unlocked
        </p>
        <div className="mt-3 h-2 bg-earth-200 rounded-full overflow-hidden">
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
                : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
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
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-8 text-earth-500">
          No achievements in this category
        </div>
      )}
    </div>
  )
}

export default AchievementsPanel

