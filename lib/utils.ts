import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the base URL for API requests
 * Uses environment variables in production and falls back to localhost in development
 */
export function getBaseUrl(): string {
  // Use the NEXT_PUBLIC_API_URL environment variable if set
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Fall back to development URL
  return 'https://dev-api.libri.kr';
}
