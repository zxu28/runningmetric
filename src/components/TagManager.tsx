import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GPXData } from '../utils/gpxParser'

interface TagManagerProps {
  run: GPXData
  onUpdate: (updatedRun: GPXData) => void
}

const PREDEFINED_TAGS = [
  'Race',
  'Trail',
  'Tempo',
  'Long Run',
  'Recovery',
  'Interval',
  'Easy',
  'Hill Workout',
  'Track',
  'Morning Run',
  'Evening Run',
  'PR',
  'Best Effort'
]

const TagManager: React.FC<TagManagerProps> = ({ run, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [showPredefined, setShowPredefined] = useState(false)
  const [notes, setNotes] = useState(run.notes || '')
  const [showNotesEditor, setShowNotesEditor] = useState(false)

  const currentTags = run.tags || []

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !currentTags.includes(tag.trim())) {
      const updatedRun: GPXData = {
        ...run,
        tags: [...currentTags, tag.trim()]
      }
      onUpdate(updatedRun)
      setNewTag('')
      setShowPredefined(false)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedRun: GPXData = {
      ...run,
      tags: currentTags.filter(tag => tag !== tagToRemove)
    }
    onUpdate(updatedRun)
  }

  const handleAddCustomTag = () => {
    if (newTag.trim()) {
      handleAddTag(newTag.trim())
    }
  }

  const handleSaveNotes = () => {
    const updatedRun: GPXData = {
      ...run,
      notes: notes.trim() || undefined
    }
    onUpdate(updatedRun)
    setShowNotesEditor(false)
  }

  const getTagColor = (tag: string) => {
    const colorMap: Record<string, string> = {
      'Race': 'bg-red-100 text-red-800 border-red-300',
      'Trail': 'bg-green-100 text-green-800 border-green-300',
      'Tempo': 'bg-orange-100 text-orange-800 border-orange-300',
      'Long Run': 'bg-blue-100 text-blue-800 border-blue-300',
      'Recovery': 'bg-purple-100 text-purple-800 border-purple-300',
      'PR': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Best Effort': 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
    return colorMap[tag] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  return (
    <div className="space-y-4">
      {/* Tags Display */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">Tags</h4>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
        </div>
        
        {currentTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {currentTags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTagColor(tag)}`}
              >
                {tag}
                {isEditing && (
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </motion.span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">No tags added</p>
        )}
      </div>

      {/* Add Tags Editor */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {/* Predefined Tags */}
            <div>
              <button
                onClick={() => setShowPredefined(!showPredefined)}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium mb-2"
              >
                {showPredefined ? 'Hide' : 'Show'} Predefined Tags
              </button>
              {showPredefined && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {PREDEFINED_TAGS.filter(tag => !currentTags.includes(tag)).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      className="px-2 py-1 text-xs rounded-full border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                placeholder="Add custom tag..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddCustomTag}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">Notes</h4>
          <button
            onClick={() => setShowNotesEditor(!showNotesEditor)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {showNotesEditor ? 'Cancel' : (notes ? 'Edit' : 'Add')}
          </button>
        </div>
        
        {showNotesEditor ? (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this run..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveNotes}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Notes
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-600 italic">
            {notes || 'No notes added'}
          </p>
        )}
      </div>
    </div>
  )
}

export default TagManager

