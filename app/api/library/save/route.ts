import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { userEmail, libraryItem } = body;
    
    if (!userEmail || !libraryItem) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('library_items')
      .insert({
        id: libraryItem.id,
        user_email: userEmail,
        timestamp: libraryItem.timestamp,
        subsidiary: libraryItem.subsidiary,
        request_type: libraryItem.requestType,
        title: libraryItem.title,
        alt_text: libraryItem.altText,
        stock_keywords: libraryItem.stockKeywords || null,
        graphic_suggestions: libraryItem.graphicSuggestions,
        notes: libraryItem.notes || null,
        source_preview: libraryItem.sourcePreview,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save to library', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Save library error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

