import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updates: { slide_data?: any; order_index?: number } = {}
    
    if (body.slide_data !== undefined) updates.slide_data = body.slide_data
    if (body.order_index !== undefined) updates.order_index = body.order_index

    // Verify slide ownership through slideshow
    const { data: slide } = await supabase
      .from('slides')
      .select('slideshow_id, slideshows!inner(user_id)')
      .eq('id', id)
      .single()

    if (!slide || (slide.slideshows as any).user_id !== user.id) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 })
    }

    // Update slide
    const { data: updatedSlide, error } = await supabase
      .from('slides')
      .update(updates)
      .eq('id', id)
      .select('id, order_index, slide_data, created_at, updated_at')
      .single()

    if (error || !updatedSlide) {
      console.error('Error updating slide:', error)
      return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 })
    }

    return NextResponse.json({ slide: updatedSlide })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify slide ownership through slideshow
    const { data: slide } = await supabase
      .from('slides')
      .select('slideshow_id, order_index, slideshows!inner(user_id)')
      .eq('id', id)
      .single()

    if (!slide || (slide.slideshows as any).user_id !== user.id) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 })
    }

    // Delete slide
    const { error } = await supabase
      .from('slides')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting slide:', error)
      return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 })
    }

    // Reorder remaining slides (decrement order_index for slides after deleted one)
    const { data: remainingSlides } = await supabase
      .from('slides')
      .select('id, order_index')
      .eq('slideshow_id', slide.slideshow_id)
      .gt('order_index', slide.order_index)
      .order('order_index', { ascending: true })

    if (remainingSlides && remainingSlides.length > 0) {
      // Update all slides to have decremented order_index
      for (const s of remainingSlides) {
        await supabase
          .from('slides')
          .update({ order_index: s.order_index - 1 })
          .eq('id', s.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
