import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoryPhoto } from '../utils/storyTypes'

interface PhotoGalleryProps {
  photos: StoryPhoto[]
  coverPhotoId?: string
  onSetCoverPhoto?: (photoId: string) => void
  onRemovePhoto?: (photoId: string) => void
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  coverPhotoId,
  onSetCoverPhoto,
  onRemovePhoto,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<StoryPhoto | null>(null)

  if (photos.length === 0) {
    return null
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-earth-700">Photos</h3>
          <span className="text-xs text-earth-500">{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.thumbnail || photo.data}
                alt={photo.fileName}
                className="w-full h-32 object-cover rounded-organic border-2 transition-all duration-300"
                style={{
                  borderColor: photo.id === coverPhotoId ? '#84cc16' : '#e5e7eb',
                }}
              />
              
              {/* Cover Badge */}
              {photo.id === coverPhotoId && (
                <div className="absolute top-1 left-1 bg-sage-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Cover
                </div>
              )}

              {/* Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-organic flex items-center justify-center gap-2">
                {onSetCoverPhoto && photo.id !== coverPhotoId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSetCoverPhoto(photo.id)
                    }}
                    className="bg-sage-600 text-white text-xs px-2 py-1 rounded-full hover:bg-sage-700 transition-colors"
                    title="Set as cover"
                  >
                    Set Cover
                  </button>
                )}
                {onRemovePhoto && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Remove this photo?')) {
                        onRemovePhoto(photo.id)
                      }
                    }}
                    className="bg-terracotta-500 text-white text-xs px-2 py-1 rounded-full hover:bg-terracotta-600 transition-colors"
                    title="Remove photo"
                  >
                    Remove
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-4xl max-h-[90vh] relative"
              >
                <img
                  src={selectedPhoto.data}
                  alt={selectedPhoto.fileName}
                  className="max-w-full max-h-[90vh] rounded-organic-lg"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 text-earth-800 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default PhotoGallery

