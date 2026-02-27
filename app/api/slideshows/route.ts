import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all slideshows for the user
    const { data: slideshows, error } = await supabase
      .from('slideshows')
      .select('id, title, created_at, updated_at, settings')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching slideshows:', error)
      return NextResponse.json({ error: 'Failed to fetch slideshows' }, { status: 500 })
    }

    return NextResponse.json({ slideshows })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, settings } = body

    // Create new slideshow
    const { data: slideshow, error } = await supabase
      .from('slideshows')
      .insert({
        user_id: user.id,
        title: title || 'Untitled Slideshow',
        settings: settings || {}
      })
      .select('id, title, created_at, updated_at, settings')
      .single()

    if (error) {
      console.error('Error creating slideshow:', error)
      return NextResponse.json({ error: 'Failed to create slideshow' }, { status: 500 })
    }

    return NextResponse.json({ slideshow }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
