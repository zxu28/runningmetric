import { motion } from 'framer-motion'
import { RunningGoal, formatGoalValue, getGoalUnit } from '../utils/goalTypes'

interface GoalCardProps {
  goal: RunningGoal
  onEdit: () => void
  onDelete: () => void
  onComplete?: () => void
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onComplete }) => {
  const progressPercent = Math.min((goal.progress / goal.target) * 100, 100)
  const remaining = Math.max(goal.target - goal.progress, 0)
  const unit = getGoalUnit(goal.type)

  const getGoalTypeColor = (type: string) => {
    switch (type) {
      case 'distance':
        return 'bg-sage-500'
      case 'time':
        return 'bg-moss-500'
      case 'runs':
        return 'bg-terracotta-500'
      case 'streak':
        return 'bg-earth-500'
      case 'elevation':
        return 'bg-sage-600'
      default:
        return 'bg-earth-400'
    }
  }

  const getGoalTypeEmoji = (type: string) => {
    switch (type) {
      case 'distance':
        return '📏'
      case 'time':
        return '⏱️'
      case 'runs':
        return '🏃'
      case 'streak':
        return '🔥'
      case 'elevation':
        return '⛰️'
      default:
        return '🎯'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6 border-2 ${
        goal.completed ? 'border-sage-400 bg-sage-50/50' : 'border-earth-200'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-3xl">{getGoalTypeEmoji(goal.type)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-earth-800 mb-1">
              {goal.title || `${goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal`}
            </h3>
            <p className="text-sm text-earth-600">
              {formatGoalValue(goal.target, goal.type)} • {goal.period}
            </p>
          </div>
        </div>
        {goal.completed && (
          <div className="flex-shrink-0">
            <span className="text-2xl">🎉</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-earth-700">
            {formatGoalValue(goal.progress, goal.type)} / {formatGoalValue(goal.target, goal.type)}
          </span>
          <span className="text-sm font-bold text-earth-800">
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="h-3 bg-earth-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${getGoalTypeColor(goal.type)} rounded-full`}
          />
        </div>
        {!goal.completed && remaining > 0 && (
          <p className="text-xs text-earth-500 mt-1">
            {formatGoalValue(remaining, goal.type)} remaining
          </p>
        )}
      </div>

      {/* Date Range */}
      <div className="text-xs text-earth-500 mb-4">
        {goal.startDate.toLocaleDateString()} - {goal.endDate.toLocaleDateString()}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!goal.completed && onComplete && (
          <button
            onClick={onComplete}
            className="flex-1 px-4 py-2 text-sm rounded-organic bg-sage-600 text-white hover:bg-sage-700 transition-all duration-300 font-medium"
          >
            Mark Complete
          </button>
        )}
        <button
          onClick={onEdit}
          className="px-4 py-2 text-sm rounded-organic bg-earth-200 text-earth-800 hover:bg-earth-300 transition-all duration-300 font-medium"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 text-sm rounded-organic bg-terracotta-100 text-terracotta-800 hover:bg-terracotta-200 transition-all duration-300 font-medium"
        >
          Delete
        </button>
      </div>
    </motion.div>
  )
}

export default GoalCard

