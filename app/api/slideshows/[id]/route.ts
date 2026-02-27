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

    // Fetch slideshow with slides
    const { data: slideshow, error: slideshowError } = await supabase
      .from('slideshows')
      .select('id, title, created_at, updated_at, settings')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (slideshowError || !slideshow) {
      return NextResponse.json({ error: 'Slideshow not found' }, { status: 404 })
    }

    // Fetch slides ordered by order_index
    const { data: slides, error: slidesError } = await supabase
      .from('slides')
      .select('id, order_index, slide_data, created_at, updated_at')
      .eq('slideshow_id', id)
      .order('order_index', { ascending: true })

    if (slidesError) {
      console.error('Error fetching slides:', slidesError)
      return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 })
    }

    return NextResponse.json({
      slideshow,
      slides: slides || []
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const updates: { title?: string; settings?: any } = {}
    
    if (body.title !== undefined) updates.title = body.title
    if (body.settings !== undefined) updates.settings = body.settings

    // Update slideshow
    const { data: slideshow, error } = await supabase
      .from('slideshows')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, title, created_at, updated_at, settings')
      .single()

    if (error || !slideshow) {
      return NextResponse.json({ error: 'Failed to update slideshow' }, { status: 500 })
    }

    return NextResponse.json({ slideshow })
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

    // Delete slideshow (cascade will delete slides)
    const { error } = await supabase
      .from('slideshows')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting slideshow:', error)
      return NextResponse.json({ error: 'Failed to delete slideshow' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
