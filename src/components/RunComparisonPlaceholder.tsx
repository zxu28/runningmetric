import React from 'react'
import { motion } from 'framer-motion'

const RunComparisonPlaceholder: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
    >
      <div className="text-center">
        <div className="text-4xl mb-3">⚖️</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Run Comparison</h3>
        <p className="text-gray-500 text-sm mb-3">
          Compare pace and performance between runs
        </p>
        <div className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-1 inline-block">
          Coming Soon
        </div>
      </div>
    </motion.div>
  )
}

export default RunComparisonPlaceholder
