import { config } from '@/config'

class ApiClient {
    private getAccessToken: (() => string | null) | null = null
    private onUnauthorized: (() => void) | null = null

    initialize(getToken: () => string | null, onUnauth: () => void) {
        this.getAccessToken = getToken
        this.onUnauthorized = onUnauth
    }

    async fetch(endpoint: string, options: RequestInit = {}) {
        const token = this.getAccessToken?.()
        
        const response = await fetch(`${config.apiUrl}${endpoint}`, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        })

        if (response.status === 401) {
            this.onUnauthorized?.()
            throw new Error('Unauthorized')
        }

        return response
    }
}

export const apiClient = new ApiClient()