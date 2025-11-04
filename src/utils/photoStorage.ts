// Photo Storage Utility
// Handles photo storage, compression, and thumbnail generation

import { StoryPhoto } from './storyTypes'

const MAX_PHOTO_SIZE = 2 * 1024 * 1024 // 2MB
const MAX_PHOTOS_PER_STORY = 10
const THUMBNAIL_SIZE = 300 // pixels

// Compress image and create thumbnail
export async function processPhoto(file: File): Promise<{ data: string; thumbnail: string }> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_PHOTO_SIZE) {
      reject(new Error(`Photo size exceeds ${MAX_PHOTO_SIZE / 1024 / 1024}MB limit`))
      return
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'))
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Create canvas for full image (compressed)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to create canvas context'))
          return
        }

        // Calculate compression ratio (max width 1920px)
        const maxWidth = 1920
        const maxHeight = 1920
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress full image
        ctx.drawImage(img, 0, 0, width, height)
        const compressedData = canvas.toDataURL('image/jpeg', 0.85)

        // Create thumbnail canvas
        const thumbCanvas = document.createElement('canvas')
        const thumbCtx = thumbCanvas.getContext('2d')
        if (!thumbCtx) {
          reject(new Error('Failed to create thumbnail canvas context'))
          return
        }

        // Calculate thumbnail dimensions
        const thumbRatio = Math.min(THUMBNAIL_SIZE / img.width, THUMBNAIL_SIZE / img.height)
        thumbCanvas.width = img.width * thumbRatio
        thumbCanvas.height = img.height * thumbRatio

        thumbCtx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height)
        const thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.8)

        resolve({
          data: compressedData,
          thumbnail,
        })
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      if (e.target?.result) {
        img.src = e.target.result as string
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

// Create a StoryPhoto object
export function createStoryPhoto(file: File, data: string, thumbnail: string): StoryPhoto {
  return {
    id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    data,
    thumbnail,
    fileName: file.name,
    uploadDate: new Date(),
  }
}

// Validate photo file
export function validatePhoto(file: File): { valid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' }
  }

  if (file.size > MAX_PHOTO_SIZE) {
    return {
      valid: false,
      error: `Photo size must be less than ${MAX_PHOTO_SIZE / 1024 / 1024}MB`,
    }
  }

  return { valid: true }
}

// Check if story can add more photos
export function canAddPhoto(storyPhotos: StoryPhoto[] = []): { canAdd: boolean; error?: string } {
  if (storyPhotos.length >= MAX_PHOTOS_PER_STORY) {
    return {
      canAdd: false,
      error: `Maximum ${MAX_PHOTOS_PER_STORY} photos per story`,
    }
  }

  return { canAdd: true }
}

// Calculate total photo size
export function calculatePhotoSize(photos: StoryPhoto[]): number {
  return photos.reduce((total, photo) => {
    const base64Size = (photo.data.length * 3) / 4 // Approximate base64 size
    return total + base64Size
  }, 0)
}

// Format photo size for display
export function formatPhotoSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Estimate storage usage
export function estimateStorageUsage(photos: StoryPhoto[]): { size: number; formatted: string } {
  const size = calculatePhotoSize(photos)
  return {
    size,
    formatted: formatPhotoSize(size),
  }
}

