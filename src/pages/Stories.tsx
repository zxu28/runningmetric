import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDataContext } from '../contexts/DataContext'
import { useStoriesContext } from '../contexts/StoriesContext'
import { RunningStory } from '../utils/storyTypes'
import StoryModal from '../components/StoryModal'
import StoryDetails from '../components/StoryDetails'
import StoryTimeline from '../components/StoryTimeline'
import StoryCalendar from '../components/StoryCalendar'

type ViewMode = 'timeline' | 'calendar'

const Stories = () => {
  const { parsedData } = useDataContext()
  const { stories, createStory, updateStory, deleteStory } = useStoriesContext()
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStory, setEditingStory] = useState<RunningStory | undefined>()
  const [viewingStory, setViewingStory] = useState<RunningStory | undefined>()

  const handleCreateStory = () => {
    setEditingStory(undefined)
    setIsModalOpen(true)
  }

  const handleEditStory = (story: RunningStory) => {
    setEditingStory(story)
    setIsModalOpen(true)
    setViewingStory(undefined)
  }

  const handleViewStory = (story: RunningStory) => {
    setViewingStory(story)
  }

  const handleDeleteStory = (id: string) => {
    deleteStory(id)
    if (viewingStory?.id === id) {
      setViewingStory(undefined)
    }
  }

  const handleModalSubmit = (storyData: Omit<RunningStory, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingStory) {
      updateStory(editingStory.id, storyData)
    } else {
      createStory(storyData)
    }
    setIsModalOpen(false)
    setEditingStory(undefined)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingStory(undefined)
  }

  const handleCloseDetails = () => {
    setViewingStory(undefined)
  }

  return (
    <div className="min-h-screen bg-organic-gradient py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-earth-800 mb-2">
                Running Stories
              </h1>
              <p className="text-earth-600 text-lg">
                Combine your runs into meaningful narratives with emotional context
              </p>
            </div>
            {/* Only show header button when there are existing stories */}
            {stories.length > 0 && (
              <button
                onClick={handleCreateStory}
                className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-organic-lg text-white bg-sage-600 hover:bg-sage-700 shadow-organic-lg hover:shadow-organic transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Story
              </button>
            )}
          </div>

          {/* View Toggle */}
          {stories.length > 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-earth-700">View:</span>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-6 py-2 rounded-organic font-medium transition-all duration-300 ${
                    viewMode === 'timeline'
                      ? 'bg-sage-600 text-white shadow-organic'
                      : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-6 py-2 rounded-organic font-medium transition-all duration-300 ${
                    viewMode === 'calendar'
                      ? 'bg-sage-600 text-white shadow-organic'
                      : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
                  }`}
                >
                  Calendar
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {stories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-12 text-center"
            >
              <div className="text-8xl mb-6 animate-float">📚</div>
              <h2 className="text-3xl font-bold text-earth-800 mb-4">Start Your Running Story</h2>
              <p className="text-earth-700 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                Stories let you combine multiple runs into meaningful narratives. Add emotional context, 
                weather notes, and mood tags to capture the full experience of your running journey.
              </p>
              <div className="bg-earth-50/50 rounded-organic-lg p-6 mb-8 max-w-2xl mx-auto text-left">
                <h3 className="font-semibold text-earth-800 mb-3">Example Story Ideas:</h3>
                <ul className="space-y-2 text-earth-700">
                  <li className="flex items-start gap-2">
                    <span className="text-sage-600 mt-1">•</span>
                    <span>"My First Marathon Training Week" - Combine your training runs with how you felt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage-600 mt-1">•</span>
                    <span>"Summer Trail Running Adventures" - Group trail runs with weather and mood notes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage-600 mt-1">•</span>
                    <span>"Recovery Journey" - Track your comeback runs with emotional context</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={handleCreateStory}
                className="inline-flex items-center px-10 py-4 text-lg font-medium rounded-organic-lg text-white bg-sage-600 hover:bg-sage-700 shadow-organic-lg hover:shadow-organic transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Story
              </button>
            </motion.div>
          ) : (
            <div>
              {viewMode === 'timeline' ? (
                <StoryTimeline
                  stories={stories}
                  runs={parsedData}
                  onViewStory={handleViewStory}
                  onEditStory={handleEditStory}
                  onDeleteStory={handleDeleteStory}
                />
              ) : (
                <StoryCalendar
                  stories={stories}
                  runs={parsedData}
                  onViewStory={handleViewStory}
                  onEditStory={handleEditStory}
                  onDeleteStory={handleDeleteStory}
                />
              )}
            </div>
          )}

          {/* Story Count */}
          {stories.length > 0 && (
            <div className="mt-8 text-center text-earth-600">
              <p>{stories.length} {stories.length === 1 ? 'story' : 'stories'} created</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <StoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        existingStory={editingStory}
      />

      {viewingStory && (
        <StoryDetails
          story={viewingStory}
          runs={parsedData}
          onClose={handleCloseDetails}
          onEdit={() => {
            setViewingStory(undefined)
            handleEditStory(viewingStory)
          }}
          onDelete={() => {
            handleDeleteStory(viewingStory.id)
            handleCloseDetails()
          }}
        />
      )}
    </div>
  )
}

export default Stories

