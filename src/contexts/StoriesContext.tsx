import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { RunningStory } from '../utils/storyTypes'
import { loadStories, saveStories } from '../utils/storyStorage'
import { useDataContext } from './DataContext'

interface StoriesContextType {
  stories: RunningStory[]
  createStory: (story: Omit<RunningStory, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateStory: (id: string, updates: Partial<RunningStory>) => void
  deleteStory: (id: string) => void
  getStoriesForRun: (runId: string) => RunningStory[]
  getStoryById: (id: string) => RunningStory | undefined
}

const StoriesContext = createContext<StoriesContextType | undefined>(undefined)

export const useStoriesContext = () => {
  const context = useContext(StoriesContext)
  if (context === undefined) {
    throw new Error('useStoriesContext must be used within a StoriesProvider')
  }
  return context
}

interface StoriesProviderProps {
  children: ReactNode
}

export const StoriesProvider: React.FC<StoriesProviderProps> = ({ children }) => {
  const [stories, setStories] = useState<RunningStory[]>([])
  const { parsedData } = useDataContext()

  // Load stories from localStorage on mount
  useEffect(() => {
    const loadedStories = loadStories()
    setStories(loadedStories)
    console.log(`Loaded ${loadedStories.length} stories from localStorage`)
  }, [])

  // Save stories to localStorage whenever they change
  // Always save, even if empty, to ensure persistence
  useEffect(() => {
    try {
      saveStories(stories)
      console.log(`Saved ${stories.length} stories to localStorage`)
    } catch (error) {
      console.error('Failed to save stories:', error)
      // If quota exceeded, warn user but don't break the app
      if (error instanceof Error && error.message.includes('quota')) {
        console.warn('Storage quota exceeded. Some stories may not be saved.')
      }
    }
  }, [stories])

  // Create a new story
  const createStory = (storyData: Omit<RunningStory, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Validate that all runIds exist in parsedData
    const validRunIds = storyData.runIds.filter(runId => {
      const run = parsedData.find(r => {
        const runIdMatch = `${r.fileName}-${r.startTime.getTime()}`
        return runIdMatch === runId
      })
      return run !== undefined
    })

    if (validRunIds.length === 0) {
      throw new Error('At least one valid run must be selected')
    }

    const now = new Date()
    const newStory: RunningStory = {
      ...storyData,
      runIds: validRunIds,
      id: `story-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    }

    setStories(prev => [...prev, newStory])
  }

  // Update an existing story
  const updateStory = (id: string, updates: Partial<RunningStory>) => {
    setStories(prev =>
      prev.map(story => {
        if (story.id === id) {
          // Validate runIds if they're being updated
          let validatedRunIds = story.runIds
          if (updates.runIds) {
            validatedRunIds = updates.runIds.filter(runId => {
              const run = parsedData.find(r => {
                const runIdMatch = `${r.fileName}-${r.startTime.getTime()}`
                return runIdMatch === runId
              })
              return run !== undefined
            })
          }

          return {
            ...story,
            ...updates,
            runIds: validatedRunIds,
            updatedAt: new Date(),
          }
        }
        return story
      })
    )
  }

  // Delete a story
  const deleteStory = (id: string) => {
    setStories(prev => prev.filter(story => story.id !== id))
  }

  // Get all stories that contain a specific run
  const getStoriesForRun = (runId: string): RunningStory[] => {
    return stories.filter(story => story.runIds.includes(runId))
  }

  // Get a story by ID
  const getStoryById = (id: string): RunningStory | undefined => {
    return stories.find(story => story.id === id)
  }

  return (
    <StoriesContext.Provider
      value={{
        stories,
        createStory,
        updateStory,
        deleteStory,
        getStoriesForRun,
        getStoryById,
      }}
    >
      {children}
    </StoriesContext.Provider>
  )
}

