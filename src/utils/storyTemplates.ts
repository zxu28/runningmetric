// Story Templates Configuration
// Pre-configured templates for common story types

import { RunningStory } from './storyTypes'

export interface StoryTemplate {
  id: string
  name: string
  emoji: string
  description: string
  suggestedTitle: string
  suggestedDescription?: string
  suggestedMoodTags: string[]
  suggestedWeatherNotes?: string
  suggestedEmotionalNotes?: string
}

export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'marathon-training-week',
    name: 'Marathon Training Week',
    emoji: '🏃‍♂️',
    description: 'Track your consistency and progress during marathon training',
    suggestedTitle: 'Marathon Training Week',
    suggestedDescription: 'A week of focused marathon training with consistent runs and building endurance.',
    suggestedMoodTags: ['motivated', 'energetic', 'proud'],
    suggestedWeatherNotes: 'Training in various conditions',
    suggestedEmotionalNotes: 'Building towards my marathon goal, staying consistent and motivated.',
  },
  {
    id: 'race-preparation',
    name: 'Race Preparation',
    emoji: '🏁',
    description: 'Performance-focused runs leading up to a race',
    suggestedTitle: 'Race Preparation',
    suggestedDescription: 'Preparing for an upcoming race with speed work and tempo runs.',
    suggestedMoodTags: ['motivated', 'fast', 'energetic'],
    suggestedWeatherNotes: 'Race day conditions',
    suggestedEmotionalNotes: 'Preparing mentally and physically for race day. Focused on performance.',
  },
  {
    id: 'recovery-journey',
    name: 'Recovery Journey',
    emoji: '💪',
    description: 'Track your comeback from injury or setback',
    suggestedTitle: 'Recovery Journey',
    suggestedDescription: 'Getting back into running after a break or injury.',
    suggestedMoodTags: ['struggle', 'proud', 'motivated'],
    suggestedWeatherNotes: '',
    suggestedEmotionalNotes: 'Taking it slow and listening to my body. Celebrating small victories.',
  },
  {
    id: 'trail-adventure',
    name: 'Trail Adventure',
    emoji: '🏔️',
    description: 'Adventure runs exploring trails and nature',
    suggestedTitle: 'Trail Adventure',
    suggestedDescription: 'Exploring new trails and enjoying nature while running.',
    suggestedMoodTags: ['happy', 'energetic', 'proud'],
    suggestedWeatherNotes: 'Trail conditions and weather',
    suggestedEmotionalNotes: 'Connecting with nature and enjoying the freedom of trail running.',
  },
]

// Get template by ID
export function getTemplateById(id: string): StoryTemplate | undefined {
  return STORY_TEMPLATES.find(template => template.id === id)
}

// Apply template to story data (returns partial story data)
export function applyTemplate(
  template: StoryTemplate,
  runIds: string[]
): Omit<RunningStory, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: template.suggestedTitle,
    description: template.suggestedDescription,
    runIds,
    moodTags: template.suggestedMoodTags,
    weatherNotes: template.suggestedWeatherNotes,
    emotionalNotes: template.suggestedEmotionalNotes,
  }
}

