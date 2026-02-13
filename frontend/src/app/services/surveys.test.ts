import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { apiClient } from './api-client'
import { fetchSurveyOptions } from './surveys'

vi.mock('./api-client', () => ({
    apiClient: {
        fetch: vi.fn(),
    },
}))

describe('surveys service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('calls /surveys/options and returns options payload', async () => {
        const options = [{ id: 'abc123', title: 'Team Pulse' }]
        const fetchMock = apiClient.fetch as unknown as Mock
        fetchMock.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(options),
        })

        const result = await fetchSurveyOptions()

        expect(fetchMock).toHaveBeenCalledWith('/surveys/options')
        expect(result).toEqual(options)
    })

    it('throws when /surveys/options is not ok', async () => {
        const fetchMock = apiClient.fetch as unknown as Mock
        fetchMock.mockResolvedValue({
            ok: false,
        })

        await expect(fetchSurveyOptions()).rejects.toThrow(
            'Failed to load survey options'
        )
    })

    it('falls back to /surveys when /surveys/options fails', async () => {
        const fetchMock = apiClient.fetch as unknown as Mock
        fetchMock
            .mockResolvedValueOnce({
                ok: false,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue({
                    surveys: [{ id: 'def456', title: 'Fallback Survey' }],
                }),
            })

        const result = await fetchSurveyOptions()

        expect(fetchMock).toHaveBeenNthCalledWith(1, '/surveys/options')
        expect(fetchMock).toHaveBeenNthCalledWith(2, '/surveys')
        expect(result).toEqual([{ id: 'def456', title: 'Fallback Survey' }])
    })
})
