import { Slide } from '@/types/slide'

export interface Slideshow {
  id: string
  title: string
  created_at: string
  updated_at: string
  settings?: {
    tone?: string
    complexity?: string
    maxSlides?: number
    focus?: string
    hook?: boolean
  }
}

export interface SlideRecord {
  id: string
  order_index: number
  slide_data: Slide
  created_at: string
  updated_at: string
}

export interface SlideshowWithSlides extends Slideshow {
  slides: SlideRecord[]
}

/**
 * List all slideshows for the current user
 */
export async function listSlideshows(): Promise<Slideshow[]> {
  const response = await fetch('/api/slideshows', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch slideshows')
  }

  const data = await response.json()
  return data.slideshows
}

/**
 * Create a new slideshow
 */
export async function createSlideshow(
  title?: string,
  settings?: Slideshow['settings']
): Promise<Slideshow> {
  const response = await fetch('/api/slideshows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, settings })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create slideshow')
  }

  const data = await response.json()
  return data.slideshow
}

/**
 * Load a slideshow with all its slides
 */
export async function loadSlideshow(id: string): Promise<SlideshowWithSlides> {
  const response = await fetch(`/api/slideshows/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to load slideshow')
  }

  const data = await response.json()
  return {
    ...data.slideshow,
    slides: data.slides || []
  }
}

/**
 * Update slideshow metadata
 */
export async function updateSlideshow(
  id: string,
  updates: { title?: string; settings?: Slideshow['settings'] }
): Promise<Slideshow> {
  const response = await fetch(`/api/slideshows/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update slideshow')
  }

  const data = await response.json()
  return data.slideshow
}

/**
 * Delete a slideshow
 */
export async function deleteSlideshow(id: string): Promise<void> {
  const response = await fetch(`/api/slideshows/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete slideshow')
  }
}

/**
 * Save all slides for a slideshow (bulk update)
 */
export async function saveSlides(slideshowId: string, slides: Slide[]): Promise<SlideRecord[]> {
  const response = await fetch(`/api/slideshows/${slideshowId}/slides`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slides })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save slides')
  }

  const data = await response.json()
  return data.slides
}

/**
 * Create a new slide
 */
export async function createSlide(
  slideshowId: string,
  slide: Slide,
  orderIndex?: number
): Promise<SlideRecord> {
  const response = await fetch(`/api/slideshows/${slideshowId}/slides`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slide_data: slide,
      order_index: orderIndex
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create slide')
  }

  const data = await response.json()
  return data.slide
}

/**
 * Update a single slide
 */
export async function updateSlide(slideId: string, slide: Slide): Promise<SlideRecord> {
  const response = await fetch(`/api/slides/${slideId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slide_data: slide })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update slide')
  }

  const data = await response.json()
  return data.slide
}

/**
 * Delete a slide
 */
export async function deleteSlide(slideId: string): Promise<void> {
  const response = await fetch(`/api/slides/${slideId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete slide')
  }
}

/**
 * Convert SlideRecord array to Slide array (for UI)
 */
export function slidesFromRecords(records: SlideRecord[]): Slide[] {
  return records
    .sort((a, b) => a.order_index - b.order_index)
    .map(record => record.slide_data)
}

/**
 * Convert Slide array to format for saving
 */
export function slidesToSaveFormat(slides: Slide[]): Slide[] {
  return slides.map(slide => ({ ...slide }))
}
