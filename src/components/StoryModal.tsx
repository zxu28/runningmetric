import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RunningStory, MOOD_TAGS, MoodTagId, StoryPhoto } from '../utils/storyTypes'
import { useDataContext } from '../contexts/DataContext'
import { StoryTemplate } from '../utils/storyTemplates'
import RunSelector from './RunSelector'
import PhotoUpload from './PhotoUpload'
import TemplateSelector from './TemplateSelector'

interface StoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (story: Omit<RunningStory, 'id' | 'createdAt' | 'updatedAt'>) => void
  existingStory?: RunningStory
}

const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose, onSubmit, existingStory }) => {
  const { parsedData } = useDataContext()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([])
  const [selectedMoodTags, setSelectedMoodTags] = useState<string[]>([])
  const [weatherNotes, setWeatherNotes] = useState('')
  const [emotionalNotes, setEmotionalNotes] = useState('')
  const [photos, setPhotos] = useState<StoryPhoto[]>([])
  const [coverPhotoId, setCoverPhotoId] = useState<string | undefined>(undefined)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined)
  const [errors, setErrors] = useState<{ title?: string; runs?: string }>({})

  // Initialize form when modal opens or existingStory changes
  useEffect(() => {
    if (isOpen) {
      if (existingStory) {
        setTitle(existingStory.title)
        setDescription(existingStory.description || '')
        setSelectedRunIds(existingStory.runIds)
        setSelectedMoodTags(existingStory.moodTags)
        setWeatherNotes(existingStory.weatherNotes || '')
        setEmotionalNotes(existingStory.emotionalNotes || '')
        setPhotos(existingStory.photos || [])
        setCoverPhotoId(existingStory.coverPhotoId)
        setSelectedTemplateId(undefined) // Don't show template for editing
      } else {
        // Reset form for new story
        setTitle('')
        setDescription('')
        setSelectedRunIds([])
        setSelectedMoodTags([])
        setWeatherNotes('')
        setEmotionalNotes('')
        setPhotos([])
        setCoverPhotoId(undefined)
        setSelectedTemplateId(undefined)
      }
      setErrors({})
    }
  }, [isOpen, existingStory])

  const handleMoodTagToggle = (tagId: MoodTagId) => {
    setSelectedMoodTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const newErrors: { title?: string; runs?: string } = {}
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (selectedRunIds.length === 0) {
      newErrors.runs = 'Please select at least one run'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Submit story
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      runIds: selectedRunIds,
      moodTags: selectedMoodTags,
      weatherNotes: weatherNotes.trim() || undefined,
      emotionalNotes: emotionalNotes.trim() || undefined,
      photos: photos.length > 0 ? photos : undefined,
      coverPhotoId: coverPhotoId,
    })

    // Reset form
    setTitle('')
    setDescription('')
    setSelectedRunIds([])
    setSelectedMoodTags([])
    setWeatherNotes('')
    setEmotionalNotes('')
    setPhotos([])
    setCoverPhotoId(undefined)
    setSelectedTemplateId(undefined)
    setErrors({})
    onClose()
  }

  const handleTemplateSelect = (template: StoryTemplate) => {
    setSelectedTemplateId(template.id)
    
    // Always update form fields with template suggestions when switching templates
    // This ensures that switching from one template to another properly updates all fields
    if (template.suggestedTitle) {
      setTitle(template.suggestedTitle)
    }
    if (template.suggestedDescription !== undefined) {
      setDescription(template.suggestedDescription || '')
    }
    if (template.suggestedMoodTags.length > 0) {
      setSelectedMoodTags(template.suggestedMoodTags)
    }
    if (template.suggestedWeatherNotes !== undefined) {
      setWeatherNotes(template.suggestedWeatherNotes || '')
    }
    if (template.suggestedEmotionalNotes !== undefined) {
      setEmotionalNotes(template.suggestedEmotionalNotes || '')
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white/90 backdrop-blur-sm rounded-organic-lg shadow-organic-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-earth-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-earth-800">
                  {existingStory ? 'Edit Story' : 'Create New Story'}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-earth-500 hover:text-earth-700 transition-colors p-2 hover:bg-earth-100 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Template Selector (only for new stories) */}
                {!existingStory && (
                  <TemplateSelector
                    onSelectTemplate={handleTemplateSelect}
                    selectedTemplateId={selectedTemplateId}
                  />
                )}

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-earth-700 mb-2">
                    Story Title <span className="text-terracotta-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., My First Marathon Training Week"
                    className={`w-full px-4 py-3 border-2 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white text-earth-800 placeholder-earth-400 transition-all duration-300 ${
                      errors.title ? 'border-terracotta-400' : 'border-earth-200'
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-terracotta-600">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-earth-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell the story behind these runs..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-earth-200 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white text-earth-800 placeholder-earth-400 transition-all duration-300 resize-none"
                  />
                </div>

                {/* Run Selector */}
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-2">
                    Select Runs <span className="text-terracotta-500">*</span>
                  </label>
                  <RunSelector
                    runs={parsedData}
                    selectedRunIds={selectedRunIds}
                    onSelectionChange={setSelectedRunIds}
                  />
                  {errors.runs && (
                    <p className="mt-2 text-sm text-terracotta-600">{errors.runs}</p>
                  )}
                </div>

                {/* Mood Tags */}
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-3">
                    How did you feel? (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {MOOD_TAGS.map((tag) => {
                      const isSelected = selectedMoodTags.includes(tag.id)
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleMoodTagToggle(tag.id)}
                          className={`flex items-center gap-2 px-4 py-3 rounded-organic border-2 transition-all duration-300 ${
                            isSelected
                              ? 'bg-sage-100 border-sage-400 text-sage-800 shadow-organic'
                              : 'bg-earth-50 border-earth-200 text-earth-700 hover:border-sage-300 hover:bg-earth-100'
                          }`}
                        >
                          <span className="text-xl">{tag.emoji}</span>
                          <span className="font-medium">{tag.label}</span>
                          {isSelected && (
                            <svg className="w-5 h-5 ml-auto text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Weather Notes */}
                <div>
                  <label htmlFor="weather" className="block text-sm font-medium text-earth-700 mb-2">
                    Weather Notes (Optional)
                  </label>
                  <input
                    id="weather"
                    type="text"
                    value={weatherNotes}
                    onChange={(e) => setWeatherNotes(e.target.value)}
                    placeholder="e.g., Sunny and 75°F, perfect running weather"
                    className="w-full px-4 py-3 border-2 border-earth-200 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white text-earth-800 placeholder-earth-400 transition-all duration-300"
                  />
                </div>

                {/* Emotional Notes */}
                <div>
                  <label htmlFor="emotional" className="block text-sm font-medium text-earth-700 mb-2">
                    Emotional Context (Optional)
                  </label>
                  <textarea
                    id="emotional"
                    value={emotionalNotes}
                    onChange={(e) => setEmotionalNotes(e.target.value)}
                    placeholder="How did these runs make you feel? What was happening in your life?"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-earth-200 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white text-earth-800 placeholder-earth-400 transition-all duration-300 resize-none"
                  />
                </div>

                {/* Photo Upload */}
                <PhotoUpload
                  photos={photos}
                  onPhotosChange={setPhotos}
                  maxPhotos={10}
                />

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-earth-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 rounded-organic-lg bg-earth-200 text-earth-800 border-2 border-earth-300 hover:bg-earth-300 hover:border-earth-400 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-organic-lg bg-sage-600 text-white border-2 border-sage-700 hover:bg-sage-700 shadow-organic-lg hover:shadow-organic transform hover:scale-105 transition-all duration-300 font-medium"
                  >
                    {existingStory ? 'Update Story' : 'Create Story'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default StoryModal

