import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userEmail = searchParams.get('email');
    
    if (!id || !userEmail) {
      return NextResponse.json(
        { error: 'ID and email parameters required' },
        { status: 400 }
      );
    }

    // Delete from Supabase (with email check for security)
    const { error } = await supabase
      .from('library_items')
      .delete()
      .eq('id', id)
      .eq('user_email', userEmail);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete from library', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete library error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

