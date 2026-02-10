export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift()
  }
  
  return undefined
}

export function setCookie(name: string, value: string, days?: number): void {
  if (typeof document === 'undefined') return
  
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = `; expires=${date.toUTCString()}`
  }
  
  document.cookie = `${name}=${value}${expires}; path=/`
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return
  
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}
