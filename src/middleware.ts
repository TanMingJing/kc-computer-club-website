/* eslint-disable prettier/prettier */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Minimal middleware - just pass through
  // Client-side AuthContext handles all authentication logic
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run middleware on specific routes
    // Exclude API routes entirely
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
