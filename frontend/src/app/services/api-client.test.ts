import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './api-client'
import { config } from '@/config'

function mockResponse(status: number, body?: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: vi.fn().mockResolvedValue(body ?? {}),
  } as unknown as Response
}

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses bearer token when available', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(200, { ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    apiClient.initialize(() => 'token-123', vi.fn())

    await apiClient.fetch('/surveys/options')

    expect(fetchMock).toHaveBeenCalledWith(
      `${config.apiUrl}/surveys/options`,
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
        }),
      })
    )
  })

  it('refreshes and retries once on 401', async () => {
    const onUnauthorized = vi.fn()
    const onTokenRefreshed = vi.fn()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockResponse(401))
      .mockResolvedValueOnce(mockResponse(200, { access_token: 'new-token' }))
      .mockResolvedValueOnce(mockResponse(200, { surveys: [] }))

    vi.stubGlobal('fetch', fetchMock)

    apiClient.initialize(() => 'expired-token', onUnauthorized, onTokenRefreshed)

    const response = await apiClient.fetch('/surveys/options')

    expect(response.ok).toBe(true)
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${config.apiUrl}/auth/refresh`,
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `${config.apiUrl}/surveys/options`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer new-token',
        }),
      })
    )
    expect(onTokenRefreshed).toHaveBeenCalledWith('new-token')
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('calls onUnauthorized when refresh fails', async () => {
    const onUnauthorized = vi.fn()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockResponse(401))
      .mockResolvedValueOnce(mockResponse(401))

    vi.stubGlobal('fetch', fetchMock)

    apiClient.initialize(() => 'expired-token', onUnauthorized)

    await expect(apiClient.fetch('/surveys/options')).rejects.toThrow('Unauthorized')
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })
})
