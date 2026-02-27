import { createClient } from '@/lib/supabase/server'

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * Verify user owns a slideshow
 */
export async function verifySlideshowOwnership(slideshowId: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  const supabase = await createClient()
  const { data } = await supabase
    .from('slideshows')
    .select('id')
    .eq('id', slideshowId)
    .eq('user_id', user.id)
    .single()

  return !!data
}

/**
 * Verify user owns a slide (through slideshow)
 */
export async function verifySlideOwnership(slideId: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  const supabase = await createClient()
  const { data } = await supabase
    .from('slides')
    .select('slideshow_id, slideshows!inner(user_id)')
    .eq('id', slideId)
    .single()

  if (!data) return false
  return (data.slideshows as any).user_id === user.id
}
