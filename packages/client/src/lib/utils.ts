import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    const info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    (error as any).info = info;
    throw error;
  }
  
  return res.json();
} 