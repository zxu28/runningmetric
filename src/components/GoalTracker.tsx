import { useState } from 'react'
import { useGoalsContext } from '../contexts/GoalsContext'
import { RunningGoal } from '../utils/goalTypes'
import GoalCard from './GoalCard'
import GoalModal from './GoalModal'

type GoalFilter = 'active' | 'completed' | 'all'

const GoalTracker: React.FC = () => {
  const { goals, createGoal, updateGoal, deleteGoal, completeGoal } = useGoalsContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<RunningGoal | undefined>()
  const [filter, setFilter] = useState<GoalFilter>('active')

  const handleCreateGoal = () => {
    setEditingGoal(undefined)
    setIsModalOpen(true)
  }

  const handleEditGoal = (goal: RunningGoal) => {
    setEditingGoal(goal)
    setIsModalOpen(true)
  }

  const handleDeleteGoal = (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(id)
    }
  }

  const handleCompleteGoal = (id: string) => {
    completeGoal(id)
  }

  const handleModalSubmit = (goalData: Omit<RunningGoal, 'id' | 'progress' | 'completed' | 'completedAt'>) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, goalData)
    } else {
      createGoal(goalData)
    }
    setIsModalOpen(false)
    setEditingGoal(undefined)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingGoal(undefined)
  }

  const filteredGoals = goals.filter(goal => {
    switch (filter) {
      case 'active':
        return !goal.completed
      case 'completed':
        return goal.completed
      case 'all':
        return true
      default:
        return true
    }
  })

  const activeGoals = goals.filter(g => !g.completed).length
  const completedGoals = goals.filter(g => g.completed).length

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-earth-800 mb-2">Goals</h2>
          <p className="text-earth-600">
            {activeGoals} active • {completedGoals} completed
          </p>
        </div>
        <button
          onClick={handleCreateGoal}
          className="inline-flex items-center px-6 py-3 text-base font-medium rounded-organic-lg text-white bg-sage-600 hover:bg-sage-700 shadow-organic-lg hover:shadow-organic transform hover:scale-105 transition-all duration-300"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Set New Goal
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {(['active', 'completed', 'all'] as GoalFilter[]).map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-organic text-sm font-medium transition-all duration-300 ${
              filter === filterType
                ? 'bg-sage-600 text-white shadow-organic'
                : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => handleEditGoal(goal)}
              onDelete={() => handleDeleteGoal(goal.id)}
              onComplete={() => handleCompleteGoal(goal.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-earth-800 mb-2">
            {filter === 'active' ? 'No Active Goals' : filter === 'completed' ? 'No Completed Goals' : 'No Goals Yet'}
          </h3>
          <p className="text-earth-600 mb-6">
            {filter === 'all' 
              ? 'Set your first goal to start tracking your progress!'
              : filter === 'active'
              ? 'Create a new goal to get started.'
              : 'Complete some goals to see them here.'}
          </p>
          {filter !== 'completed' && (
            <button
              onClick={handleCreateGoal}
              className="inline-flex items-center px-6 py-3 text-base font-medium rounded-organic-lg text-white bg-sage-600 hover:bg-sage-700 shadow-organic-lg transition-all duration-300"
            >
              Create Your First Goal
            </button>
          )}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        existingGoal={editingGoal}
      />
    </div>
  )
}

export default GoalTracker

