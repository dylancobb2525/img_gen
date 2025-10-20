import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabase) {
      console.log('Supabase not configured, returning error to trigger cookie fallback');
      return NextResponse.json(
        { error: 'Database not configured, use local storage' },
        { status: 503 }
      );
    }

    // Fetch from Supabase
    const { data, error } = await supabase
      .from('library_items')
      .select('*')
      .eq('user_email', userEmail)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch library', details: error.message },
        { status: 500 }
      );
    }

    // Transform to frontend format
    const libraryItems = data.map(item => ({
      id: item.id,
      timestamp: item.timestamp,
      subsidiary: item.subsidiary,
      requestType: item.request_type,
      title: item.title,
      altText: item.alt_text,
      stockKeywords: item.stock_keywords,
      graphicSuggestions: item.graphic_suggestions,
      notes: item.notes,
      sourcePreview: item.source_preview,
    }));

    return NextResponse.json({ success: true, data: libraryItems });
  } catch (error) {
    console.error('Get library error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

