import { NextRequest } from 'next/server';
import { headers as nextHeaders } from 'next/headers';

/**
 * Fetch data from the server API with the user's auth token
 */
export async function fetchWithAuth(request: NextRequest, url: string, options: RequestInit = {}) {
  // Extract the Authorization header from the incoming request
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    throw new Error('Unauthorized');
  }

  // Make request to the server API with the auth header
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get auth token from headers for server components
 */
export function getAuthToken(): string | null {
  const headers = nextHeaders();
  const authHeader = headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
} 