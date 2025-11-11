import React from 'react'
import { motion } from 'framer-motion'
import SkeletonLoader from './SkeletonLoader'

interface ChartSkeletonProps {
  height?: number
  showTitle?: boolean
}

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ 
  height = 300,
  showTitle = true 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6"
    >
      {showTitle && (
        <div className="mb-4">
          <SkeletonLoader variant="text" width="40%" height={24} className="mb-2" />
          <SkeletonLoader variant="text" width="60%" height={16} />
        </div>
      )}
      
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Chart area skeleton */}
        <SkeletonLoader 
          variant="rectangular" 
          width="100%" 
          height={height} 
          className="rounded-organic-lg"
        />
        
        {/* Overlay grid lines effect */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-px bg-earth-300 dark:bg-earth-600 opacity-30" />
          ))}
        </div>
      </div>
      
      {/* X-axis labels skeleton */}
      <div className="flex justify-between mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonLoader key={i} variant="text" width={40} height={16} />
        ))}
      </div>
    </motion.div>
  )
}

export default ChartSkeleton

