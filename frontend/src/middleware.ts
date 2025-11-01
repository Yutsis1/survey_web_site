import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const hasRefreshToken = request.cookies.has('refresh_token')
    const { pathname } = request.nextUrl

    if (!hasRefreshToken && pathname !== '/auth') {
        return NextResponse.redirect(new URL('/auth', request.url))
    }

    if (hasRefreshToken && pathname === '/auth') {
        return NextResponse.redirect(new URL('/survey-builder', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}