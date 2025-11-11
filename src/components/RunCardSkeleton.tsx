import React from 'react'
import { motion } from 'framer-motion'
import SkeletonLoader from './SkeletonLoader'

interface RunCardSkeletonProps {
  count?: number
}

const RunCardSkeleton: React.FC<RunCardSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6 border-2 border-earth-200 dark:border-earth-700"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <SkeletonLoader variant="text" width="60%" height={24} className="mb-3" />
              <SkeletonLoader variant="text" width="40%" height={20} />
            </div>
            <SkeletonLoader variant="circular" width={40} height={40} />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <SkeletonLoader variant="text" width="80%" height={16} className="mb-2" />
              <SkeletonLoader variant="text" width="60%" height={20} />
            </div>
            <div>
              <SkeletonLoader variant="text" width="80%" height={16} className="mb-2" />
              <SkeletonLoader variant="text" width="60%" height={20} />
            </div>
            <div>
              <SkeletonLoader variant="text" width="80%" height={16} className="mb-2" />
              <SkeletonLoader variant="text" width="60%" height={20} />
            </div>
          </div>
          
          <SkeletonLoader variant="rectangular" width="100%" height={200} className="rounded-organic-lg" />
        </motion.div>
      ))}
    </>
  )
}

export default RunCardSkeleton

