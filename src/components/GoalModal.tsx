import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RunningGoal, GoalType, GoalPeriod, calculatePeriodDates } from '../utils/goalTypes'

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (goal: Omit<RunningGoal, 'id' | 'progress' | 'completed' | 'completedAt'>) => void
  existingGoal?: RunningGoal
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSubmit, existingGoal }) => {
  const [type, setType] = useState<GoalType>('distance')
  const [targetInput, setTargetInput] = useState<string>('10') // String state for input field
  const [period, setPeriod] = useState<GoalPeriod>('weekly')
  const [title, setTitle] = useState('')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [errors, setErrors] = useState<{ target?: string; dates?: string }>({})

  useEffect(() => {
    if (isOpen) {
      if (existingGoal) {
        setType(existingGoal.type)
        setTargetInput(existingGoal.target.toString())
        setPeriod(existingGoal.period)
        setTitle(existingGoal.title || '')
        setCustomStartDate(existingGoal.startDate.toISOString().split('T')[0])
        setCustomEndDate(existingGoal.endDate.toISOString().split('T')[0])
      } else {
        setType('distance')
        setTargetInput('10')
        setPeriod('weekly')
        setTitle('')
        const { startDate, endDate } = calculatePeriodDates('weekly')
        setCustomStartDate(startDate.toISOString().split('T')[0])
        setCustomEndDate(endDate.toISOString().split('T')[0])
      }
      setErrors({})
    }
  }, [isOpen, existingGoal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Parse target from input string
    const parsedTarget = parseFloat(targetInput) || 0

    const newErrors: { target?: string; dates?: string } = {}
    if (parsedTarget <= 0) {
      newErrors.target = 'Target must be greater than 0'
    }
    if (period === 'custom') {
      if (!customStartDate || !customEndDate) {
        newErrors.dates = 'Start and end dates are required for custom period'
      } else if (new Date(customEndDate) <= new Date(customStartDate)) {
        newErrors.dates = 'End date must be after start date'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const { startDate, endDate } = period === 'custom'
      ? calculatePeriodDates('custom', new Date(customStartDate), new Date(customEndDate))
      : calculatePeriodDates(period)

    onSubmit({
      type,
      target: parsedTarget,
      period,
      startDate,
      endDate,
      title: title.trim() || undefined
    })

    onClose()
  }

  const getDefaultTarget = (goalType: GoalType): number => {
    switch (goalType) {
      case 'distance':
        return 10
      case 'time':
        return 5
      case 'runs':
        return 3
      case 'streak':
        return 7
      case 'elevation':
        return 1000
      default:
        return 10
    }
  }

  const handleTypeChange = (newType: GoalType) => {
    setType(newType)
    const defaultTarget = getDefaultTarget(newType)
    setTargetInput(defaultTarget.toString())
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-organic-lg shadow-organic-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col z-10"
        >
          <div className="px-6 py-4 border-b border-earth-200">
            <h2 className="text-2xl font-bold text-earth-800">
              {existingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Goal Type */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Goal Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {(['distance', 'time', 'runs', 'streak', 'elevation'] as GoalType[]).map(goalType => (
                  <button
                    key={goalType}
                    type="button"
                    onClick={() => handleTypeChange(goalType)}
                    className={`px-4 py-3 rounded-organic border-2 transition-all duration-300 ${
                      type === goalType
                        ? 'bg-sage-600 text-white border-sage-600 shadow-organic'
                        : 'bg-earth-100 text-earth-700 border-earth-200 hover:bg-earth-200'
                    }`}
                  >
                    <div className="text-xl mb-1">
                      {goalType === 'distance' && '📏'}
                      {goalType === 'time' && '⏱️'}
                      {goalType === 'runs' && '🏃'}
                      {goalType === 'streak' && '🔥'}
                      {goalType === 'elevation' && '⛰️'}
                    </div>
                    <div className="text-xs font-medium capitalize">{goalType}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Target ({type === 'distance' ? 'miles' : type === 'time' ? 'hours' : type === 'runs' ? 'runs' : type === 'streak' ? 'days' : 'feet'})
              </label>
              <input
                type="text"
                value={targetInput}
                onChange={(e) => {
                  const value = e.target.value
                  // Allow empty string and any numeric input
                  setTargetInput(value)
                }}
                onBlur={() => {
                  // Validate and set default if empty or invalid
                  const numValue = parseFloat(targetInput)
                  if (isNaN(numValue) || numValue <= 0) {
                    const defaultTarget = getDefaultTarget(type)
                    setTargetInput(defaultTarget.toString())
                  } else {
                    setTargetInput(numValue.toString())
                  }
                }}
                placeholder={`Enter ${type === 'distance' ? 'distance in miles' : type === 'time' ? 'time in hours' : type === 'runs' ? 'number of runs' : type === 'streak' ? 'days' : 'elevation in feet'}`}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white text-earth-800 text-lg placeholder-earth-400"
                required
              />
              {errors.target && (
                <p className="mt-1 text-sm text-terracotta-600">{errors.target}</p>
              )}
            </div>

            {/* Period */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Period
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as GoalPeriod[]).map(goalPeriod => (
                  <button
                    key={goalPeriod}
                    type="button"
                    onClick={() => setPeriod(goalPeriod)}
                    className={`px-4 py-2 rounded-organic border-2 transition-all duration-300 ${
                      period === goalPeriod
                        ? 'bg-moss-600 text-white border-moss-600 shadow-organic'
                        : 'bg-earth-100 text-earth-700 border-earth-200 hover:bg-earth-200'
                    }`}
                  >
                    <span className="text-sm font-medium capitalize">{goalPeriod}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            {period === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-earth-200 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white text-earth-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-earth-200 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white text-earth-800"
                    required
                  />
                </div>
              </div>
            )}
            {errors.dates && (
              <p className="text-sm text-terracotta-600">{errors.dates}</p>
            )}

            {/* Title (Optional) */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Marathon Training Week 1"
                className="w-full px-4 py-2 border-2 border-earth-200 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white text-earth-800 placeholder-earth-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-earth-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-organic bg-earth-200 text-earth-800 hover:bg-earth-300 transition-all duration-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-organic bg-sage-600 text-white hover:bg-sage-700 shadow-organic-lg transition-all duration-300 font-medium"
              >
                {existingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default GoalModal

