import { NextRequest, NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const cursor = searchParams.get('cursor');
  const limit = searchParams.get('limit') || '20';
  
  if (!query) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  try {
    // Build the search URL with query parameters
    let searchUrl = `${process.env.API_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    if (cursor) {
      searchUrl += `&cursor=${cursor}`;
    }

    // Call the server API with the user's auth token
    const data = await fetchWithAuth(request, searchUrl);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error forwarding search request:', error);
    return NextResponse.json(
      { error: 'Failed to search posts' },
      { status: 500 }
    );
  }
} 