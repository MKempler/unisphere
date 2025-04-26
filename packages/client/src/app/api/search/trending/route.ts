import { NextRequest, NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit') || '10';

  try {
    // Call the server API with the user's auth token
    const data = await fetchWithAuth(
      request,
      `${process.env.API_URL}/search/trending?limit=${limit}`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error forwarding trending tags request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending hashtags' },
      { status: 500 }
    );
  }
} 