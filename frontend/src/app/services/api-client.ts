import { config } from '@/config'

class ApiClient {
    private getAccessToken: (() => string | null) | null = null
    private onUnauthorized: (() => void) | null = null
    private onTokenRefreshed: ((token: string) => void) | null = null
    private refreshPromise: Promise<string | null> | null = null

    initialize(
        getToken: () => string | null,
        onUnauth: () => void,
        onTokenRefreshed?: (token: string) => void
    ) {
        this.getAccessToken = getToken
        this.onUnauthorized = onUnauth
        this.onTokenRefreshed = onTokenRefreshed ?? null
    }

    private async requestWithToken(endpoint: string, options: RequestInit = {}, token?: string | null) {
        return fetch(`${config.apiUrl}${endpoint}`, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        })
    }

    private async refreshAccessToken(): Promise<string | null> {
        if (this.refreshPromise) {
            return this.refreshPromise
        }

        this.refreshPromise = (async () => {
            const refreshResponse = await fetch(`${config.apiUrl}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                cache: 'no-store',
            })

            if (!refreshResponse.ok) {
                return null
            }

            const data = (await refreshResponse.json()) as { access_token?: string }
            if (!data.access_token) {
                return null
            }

            this.onTokenRefreshed?.(data.access_token)
            return data.access_token
        })().finally(() => {
            this.refreshPromise = null
        })

        return this.refreshPromise
    }

    async fetch(endpoint: string, options: RequestInit = {}) {
        const token = this.getAccessToken?.()
        const response = await this.requestWithToken(endpoint, options, token)

        if (response.status === 401) {
            const refreshedToken = await this.refreshAccessToken()
            if (refreshedToken) {
                const retryResponse = await this.requestWithToken(endpoint, options, refreshedToken)
                if (retryResponse.status !== 401) {
                    return retryResponse
                }
            }

            this.onUnauthorized?.()
            throw new Error('Unauthorized')
        }

        return response
    }
}

export const apiClient = new ApiClient()