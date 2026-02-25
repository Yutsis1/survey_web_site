'use client'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  // AuthGuard now only wraps children without redirect logic
  // Auth redirects are handled by individual pages using AuthContext
  return <>{children}</>
}
