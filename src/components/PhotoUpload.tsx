import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { StoryPhoto } from '../utils/storyTypes'
import { processPhoto, createStoryPhoto, validatePhoto, canAddPhoto, formatPhotoSize } from '../utils/photoStorage'

interface PhotoUploadProps {
  photos: StoryPhoto[]
  onPhotosChange: (photos: StoryPhoto[]) => void
  maxPhotos?: number
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ photos, onPhotosChange, maxPhotos = 10 }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setError(null)
    setUploading(true)

    try {
      const fileArray = Array.from(files)
      const newPhotos: StoryPhoto[] = []

      for (const file of fileArray) {
        // Check if we can add more photos
        const canAdd = canAddPhoto(photos)
        if (!canAdd.canAdd) {
          setError(canAdd.error || 'Cannot add more photos')
          break
        }

        // Validate photo
        const validation = validatePhoto(file)
        if (!validation.valid) {
          setError(validation.error || 'Invalid photo')
          continue
        }

        // Process photo (compress and create thumbnail)
        try {
          const { data, thumbnail } = await processPhoto(file)
          const photo = createStoryPhoto(file, data, thumbnail)
          newPhotos.push(photo)
        } catch (err) {
          setError(`Failed to process ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }

      if (newPhotos.length > 0) {
        onPhotosChange([...photos, ...newPhotos])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photos')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleRemovePhoto = (photoId: string) => {
    onPhotosChange(photos.filter(p => p.id !== photoId))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-earth-700 mb-2">
        Photos (Optional)
      </label>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={`
          border-2 border-dashed rounded-organic-lg p-6 text-center cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-sage-400 bg-sage-50' 
            : 'border-earth-200 hover:border-sage-300 hover:bg-earth-50'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="text-earth-600">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-sage-600 border-t-transparent rounded-full mb-2"></div>
            <p className="text-sm">Processing photos...</p>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm font-medium text-earth-700 mb-1">
              Drop photos here or click to upload
            </p>
            <p className="text-xs text-earth-500">
              Max {maxPhotos} photos, {formatPhotoSize(2 * 1024 * 1024)} each
            </p>
            <p className="text-xs text-earth-500 mt-1">
              {photos.length} of {maxPhotos} photos uploaded
            </p>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-terracotta-50 border-2 border-terracotta-200 rounded-organic p-3">
          <p className="text-sm text-terracotta-700">{error}</p>
        </div>
      )}

      {/* Photo Thumbnails */}
      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <img
                src={photo.thumbnail || photo.data}
                alt={photo.fileName}
                className="w-full h-24 object-cover rounded-organic border-2 border-earth-200"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemovePhoto(photo.id)
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-terracotta-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                title="Remove photo"
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PhotoUpload

