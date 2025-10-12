import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://127.0.0.1:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'DELETE')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PATCH')
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/')
    const url = new URL(`${API_URL}/${path}`)
    
    // Forward query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })

    const headers = new Headers()
    
    // Forward relevant headers
    const headersToForward = [
      'content-type',
      'authorization',
      'cookie',
      'accept',
    ]
    
    headersToForward.forEach((headerName) => {
      const value = request.headers.get(headerName)
      if (value) {
        headers.set(headerName, value)
      }
    })

    // Get request body for methods that support it
    let body: BodyInit | undefined
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = request.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        body = JSON.stringify(await request.json())
      } else {
        body = await request.text()
      }
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body,
      credentials: 'include',
    })

    // Forward response headers
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      // Forward important headers
      if (
        key.toLowerCase() === 'content-type' ||
        key.toLowerCase() === 'set-cookie' ||
        key.toLowerCase() === 'cache-control'
      ) {
        responseHeaders.set(key, value)
      }
    })

    const data = await response.text()

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    )
  }
}