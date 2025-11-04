// Story Export Utility
// Exports stories as PDF, image, or HTML

import { RunningStory } from './storyTypes'
import { GPXData } from './gpxParser'
import { formatDistance, formatPace, formatDuration } from './gpxParser'
import { getRunId } from './storyTypes'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export interface ExportOptions {
  format: 'pdf' | 'image' | 'html'
  quality?: number // 0-1 for image quality
  includePhotos?: boolean
  includeMap?: boolean
}

// Generate HTML content for story export
function generateStoryHTML(
  story: RunningStory,
  runs: GPXData[],
  options: ExportOptions
): string {
  const storyRuns = runs.filter(run => story.runIds.includes(getRunId(run)))
  
  const totalDistance = storyRuns.reduce((sum, run) => sum + run.totalDistance, 0)
  const totalDuration = storyRuns.reduce((sum, run) => sum + run.totalDuration, 0)
  const avgPace = totalDistance > 0 
    ? (totalDuration / 60) / (totalDistance / 1609.34) 
    : 0

  const dates = storyRuns.map(run => run.startTime.getTime()).sort((a, b) => a - b)
  const startDate = dates.length > 0 ? new Date(dates[0]) : story.createdAt
  const endDate = dates.length > 0 ? new Date(dates[dates.length - 1]) : story.createdAt
  
  const dateRange = startDate.getTime() === endDate.getTime()
    ? startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`

  const photosHTML = options.includePhotos && story.photos && story.photos.length > 0
    ? `
      <div class="photos-section" style="margin-top: 2rem;">
        <h2 style="color: #3a5f3a; margin-bottom: 1rem;">Photos</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
          ${story.photos.map(photo => `
            <img src="${photo.data}" alt="${photo.fileName}" style="width: 100%; border-radius: 1rem; border: 2px solid #e5e7eb;" />
          `).join('')}
        </div>
      </div>
    `
    : ''

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${story.title} - Running Story</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #faf7f3 0%, #f5ede0 50%, #f4f7f4 100%);
      padding: 2rem;
      color: #3a3a3a;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 3rem;
      border-radius: 2rem;
      box-shadow: 0 8px 32px rgba(93, 133, 93, 0.15);
    }
    h1 {
      color: #3a5f3a;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .date-range {
      color: #6b7280;
      font-size: 1rem;
      margin-bottom: 2rem;
    }
    .description {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      color: #4b5563;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin: 2rem 0;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f0f9f0 0%, #f5f5f0 100%);
      border-radius: 1rem;
      border: 2px solid #cbd5e1;
    }
    .stat-item {
      text-align: center;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #3a5f3a;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }
    .mood-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1.5rem 0;
    }
    .mood-tag {
      background: #f0f9f0;
      padding: 0.5rem 1rem;
      border-radius: 1rem;
      border: 2px solid #cbd5e1;
      font-size: 0.875rem;
    }
    .notes-section {
      margin: 2rem 0;
      padding: 1.5rem;
      background: #faf7f3;
      border-radius: 1rem;
      border: 2px solid #e5e7eb;
    }
    .notes-section h3 {
      color: #3a5f3a;
      margin-bottom: 0.5rem;
    }
    .runs-list {
      margin-top: 2rem;
    }
    .run-item {
      padding: 1rem;
      margin-bottom: 0.5rem;
      background: #faf7f3;
      border-radius: 0.5rem;
      border-left: 4px solid #84cc16;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${story.title}</h1>
    <div class="date-range">${dateRange}</div>
    
    ${story.description ? `<div class="description">${story.description}</div>` : ''}
    
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-value">${storyRuns.length}</div>
        <div class="stat-label">Runs</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${formatDistance(totalDistance)}</div>
        <div class="stat-label">Distance</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${formatDuration(totalDuration)}</div>
        <div class="stat-label">Time</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${formatPace(avgPace)}</div>
        <div class="stat-label">Avg Pace</div>
      </div>
    </div>

    ${story.weatherNotes || story.emotionalNotes ? `
      <div class="notes-section">
        ${story.weatherNotes ? `
          <h3>Weather</h3>
          <p>${story.weatherNotes}</p>
        ` : ''}
        ${story.emotionalNotes ? `
          <h3 style="margin-top: 1rem;">Emotional Context</h3>
          <p>${story.emotionalNotes}</p>
        ` : ''}
      </div>
    ` : ''}

    ${photosHTML}

    <div class="runs-list">
      <h2 style="color: #3a5f3a; margin-bottom: 1rem;">Runs in This Story</h2>
      ${storyRuns.map(run => `
        <div class="run-item">
          <strong>${run.fileName}</strong><br>
          ${run.startTime.toLocaleDateString()} • ${formatDistance(run.totalDistance)} • ${formatPace(run.avgPace)}
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
  `
}

// Export story as HTML file
export async function exportStoryAsHTML(
  story: RunningStory,
  runs: GPXData[],
  options: ExportOptions
): Promise<void> {
  const htmlContent = generateStoryHTML(story, runs, options)
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${story.title.replace(/[^a-z0-9]/gi, '_')}_story.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export story as image
export async function exportStoryAsImage(
  story: RunningStory,
  runs: GPXData[],
  options: ExportOptions
): Promise<void> {
  // Create a temporary container with the story content
  const container = document.createElement('div')
  container.innerHTML = generateStoryHTML(story, runs, options)
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.width = '800px'
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${story.title.replace(/[^a-z0-9]/gi, '_')}_story.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    }, 'image/png', options.quality || 0.95)
  } finally {
    document.body.removeChild(container)
  }
}

// Export story as PDF
export async function exportStoryAsPDF(
  story: RunningStory,
  runs: GPXData[],
  options: ExportOptions
): Promise<void> {
  // Create a temporary container with the story content
  const container = document.createElement('div')
  container.innerHTML = generateStoryHTML(story, runs, options)
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.width = '800px'
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 0

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
    pdf.save(`${story.title.replace(/[^a-z0-9]/gi, '_')}_story.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}

// Main export function
export async function exportStory(
  story: RunningStory,
  runs: GPXData[],
  options: ExportOptions
): Promise<void> {
  switch (options.format) {
    case 'html':
      await exportStoryAsHTML(story, runs, options)
      break
    case 'image':
      await exportStoryAsImage(story, runs, options)
      break
    case 'pdf':
      await exportStoryAsPDF(story, runs, options)
      break
    default:
      throw new Error(`Unsupported export format: ${options.format}`)
  }
}

