import React from 'react'

interface SkeletonLoaderProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animate?: boolean
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animate = true
}) => {
  const baseClasses = 'bg-earth-200 dark:bg-earth-700 rounded-organic'
  
  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: ''
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  const skeletonClasses = `${baseClasses} ${variantClasses[variant]} ${className} ${animate ? 'animate-shimmer' : ''}`

  return <div className={skeletonClasses} style={style} />
}

export default SkeletonLoader

