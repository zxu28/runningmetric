import React from 'react'
import { motion } from 'framer-motion'
import { STORY_TEMPLATES, StoryTemplate } from '../utils/storyTemplates'

interface TemplateSelectorProps {
  onSelectTemplate: (template: StoryTemplate) => void
  selectedTemplateId?: string
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  selectedTemplateId,
}) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-earth-700 mb-3">
        Start with a Template (Optional)
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STORY_TEMPLATES.map((template) => {
          const isSelected = selectedTemplateId === template.id
          return (
            <motion.button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate(template)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                text-left p-4 rounded-organic-lg border-2 transition-all duration-300
                ${isSelected
                  ? 'bg-sage-100 border-sage-400 shadow-organic'
                  : 'bg-earth-50 border-earth-200 hover:border-sage-300 hover:bg-earth-100'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">{template.emoji}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-earth-800 mb-1">{template.name}</h4>
                  <p className="text-xs text-earth-600">{template.description}</p>
                  {isSelected && (
                    <div className="mt-2 text-xs text-sage-700 font-medium">
                      ✓ Selected
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default TemplateSelector

