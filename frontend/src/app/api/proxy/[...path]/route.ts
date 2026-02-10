import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://127.0.0.1:8000'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
type HandlerParams = { params: Promise<{ path: string[] }> }
type RouteHandler = (request: NextRequest, args: HandlerParams) => Promise<NextResponse>

function createMethodHandler(method: HttpMethod): RouteHandler {
  return async (request, { params }) => {
    const { path } = await params
    return proxyRequest(request, path, method)
  }
}

export const GET = createMethodHandler('GET')
export const POST = createMethodHandler('POST')
export const PUT = createMethodHandler('PUT')
export const DELETE = createMethodHandler('DELETE')
export const PATCH = createMethodHandler('PATCH')

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
    
    // Categorize the error for better client handling
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      // Network error - service is down or unreachable
      return NextResponse.json(
        { 
          error: 'Service Unavailable',
          message: `Unable to connect to the backend service. Please check if the service is running. Target URL: ${API_URL}
          Target path: ${pathSegments.join('/')}`,
          code: 'SERVICE_UNAVAILABLE',
          timestamp: new Date().toISOString()
        },
        { 
          status: 503,
          statusText: 'Service Unavailable'
        }
      )
    }
    
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      // Timeout error
      return NextResponse.json(
        { 
          error: 'Gateway Timeout',
          message: 'The backend service took too long to respond.',
          code: 'GATEWAY_TIMEOUT',
          timestamp: new Date().toISOString()
        },
        { 
          status: 504,
          statusText: 'Gateway Timeout'
        }
      )
    }
    
    // Generic error
    return NextResponse.json(
      { 
        error: 'Proxy Error',
        message: 'An unexpected error occurred while processing your request.',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}