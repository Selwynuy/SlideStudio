import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
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

    // Verify slideshow ownership
    const { data: slideshow } = await supabase
      .from('slideshows')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!slideshow) {
      return NextResponse.json({ error: 'Slideshow not found' }, { status: 404 })
    }

    // Fetch slides ordered by order_index
    const { data: slides, error } = await supabase
      .from('slides')
      .select('id, order_index, slide_data, created_at, updated_at')
      .eq('slideshow_id', id)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching slides:', error)
      return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 })
    }

    return NextResponse.json({ slides: slides || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
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

    // Verify slideshow ownership
    const { data: slideshow } = await supabase
      .from('slideshows')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!slideshow) {
      return NextResponse.json({ error: 'Slideshow not found' }, { status: 404 })
    }

    const body = await request.json()
    const { slide_data, order_index } = body

    if (!slide_data) {
      return NextResponse.json({ error: 'slide_data is required' }, { status: 400 })
    }

    // Get max order_index to append at end if not provided
    let finalOrderIndex = order_index
    if (finalOrderIndex === undefined) {
      const { data: maxSlide } = await supabase
        .from('slides')
        .select('order_index')
        .eq('slideshow_id', id)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()
      
      finalOrderIndex = maxSlide ? maxSlide.order_index + 1 : 0
    }

    // Create new slide
    const { data: slide, error } = await supabase
      .from('slides')
      .insert({
        slideshow_id: id,
        order_index: finalOrderIndex,
        slide_data
      })
      .select('id, order_index, slide_data, created_at, updated_at')
      .single()

    if (error) {
      console.error('Error creating slide:', error)
      return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 })
    }

    return NextResponse.json({ slide }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
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

    // Verify slideshow ownership
    const { data: slideshow } = await supabase
      .from('slideshows')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!slideshow) {
      return NextResponse.json({ error: 'Slideshow not found' }, { status: 404 })
    }

    const body = await request.json()
    const { slides } = body

    if (!Array.isArray(slides)) {
      return NextResponse.json({ error: 'slides must be an array' }, { status: 400 })
    }

    // Delete all existing slides for this slideshow
    const { error: deleteError } = await supabase
      .from('slides')
      .delete()
      .eq('slideshow_id', id)

    if (deleteError) {
      console.error('Error deleting existing slides:', deleteError)
      return NextResponse.json({ error: 'Failed to update slides' }, { status: 500 })
    }

    // Insert new slides
    if (slides.length > 0) {
      const slidesToInsert = slides.map((slide: any, index: number) => ({
        slideshow_id: id,
        order_index: index,
        slide_data: slide
      }))

      const { data: insertedSlides, error: insertError } = await supabase
        .from('slides')
        .insert(slidesToInsert)
        .select('id, order_index, slide_data, created_at, updated_at')

      if (insertError) {
        console.error('Error inserting slides:', insertError)
        return NextResponse.json({ error: 'Failed to update slides' }, { status: 500 })
      }

      return NextResponse.json({ slides: insertedSlides })
    }

    return NextResponse.json({ slides: [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
