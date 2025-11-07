import { Achievement } from '../utils/achievements'

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked: boolean
  onClick?: () => void
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  unlocked,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-organic-lg border-2 transition-all duration-300
        ${unlocked 
          ? 'bg-white/70 backdrop-blur-sm border-sage-300 shadow-organic cursor-pointer hover:shadow-organic-lg hover:scale-105 active:scale-95' 
          : 'bg-earth-100/50 border-earth-200 opacity-60 cursor-pointer hover:opacity-80'
        }
      `}
      title={unlocked ? `Click to view details: ${achievement.description}` : 'Locked - Click to view details'}
    >
      <div className="text-center">
        <div className={`text-4xl mb-2 ${unlocked ? '' : 'grayscale'}`}>
          {achievement.emoji}
        </div>
        <div className={`text-sm font-semibold mb-1 ${unlocked ? 'text-earth-800' : 'text-earth-500'}`}>
          {achievement.title}
        </div>
        {!unlocked && (
          <div className="absolute top-2 right-2">
            <svg className="w-5 h-5 text-earth-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

export default AchievementBadge

