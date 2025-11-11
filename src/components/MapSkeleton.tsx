import React from 'react'
import { motion } from 'framer-motion'
import SkeletonLoader from './SkeletonLoader'

interface MapSkeletonProps {
  height?: number
  showTitle?: boolean
}

const MapSkeleton: React.FC<MapSkeletonProps> = ({ 
  height = 400,
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
          <SkeletonLoader variant="text" width="30%" height={24} />
        </div>
      )}
      
      <div className="relative rounded-organic-lg overflow-hidden" style={{ height: `${height}px` }}>
        {/* Map area skeleton */}
        <SkeletonLoader 
          variant="rectangular" 
          width="100%" 
          height={height} 
          className="rounded-organic-lg"
        />
        
        {/* Map controls skeleton */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <SkeletonLoader variant="rectangular" width={32} height={32} className="rounded-organic" />
          <SkeletonLoader variant="rectangular" width={32} height={32} className="rounded-organic" />
        </div>
        
        {/* Route line effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg width="100%" height="100%" className="opacity-20">
            <path
              d="M 50 200 Q 150 100, 250 150 T 450 180 T 650 160"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-sage-500"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}

export default MapSkeleton

