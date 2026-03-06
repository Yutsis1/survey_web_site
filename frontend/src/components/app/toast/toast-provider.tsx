'use client'

import * as React from 'react'
import * as Toast from '@radix-ui/react-toast'
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'

import { cn } from '@/lib/utils'

export type ToastType = 'error' | 'info' | 'warning' | 'success'

export interface NotifyOptions {
  type: ToastType
  title: string
  description?: string
  durationMs?: number
}

interface ToastItem extends NotifyOptions {
  id: number
}

interface ToastContextValue {
  notify: (options: NotifyOptions) => void
}

const DEFAULT_TOAST_DURATION_MS = 4000

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

const toastTypeConfig: Record<
  ToastType,
  {
    className: string
    icon: React.ReactNode
  }
> = {
  error: {
    className: 'toast-error border-destructive/40 bg-destructive/10 text-destructive',
    icon: <AlertCircle className="h-4 w-4" />,
  },
  info: {
    className: 'toast-info border-border bg-secondary/80 text-foreground',
    icon: <Info className="h-4 w-4" />,
  },
  warning: {
    className: 'toast-warning border-warning/40 bg-warning/10 text-warning',
    icon: <TriangleAlert className="h-4 w-4" />,
  },
  success: {
    className: 'toast-success border-success/40 bg-success/10 text-success',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
}

interface ToastBannerProps extends NotifyOptions {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ToastBanner({ type, title, description, durationMs, open, onOpenChange }: ToastBannerProps) {
  const config = toastTypeConfig[type]

  return (
    <Toast.Root
      open={open}
      onOpenChange={onOpenChange}
      duration={durationMs}
      role="status"
      aria-live="polite"
      data-testid={`toast-banner-${type}`}
      data-toast-type={type}
      className={cn(
        'group pointer-events-auto relative flex w-[min(420px,calc(100vw-2rem))] items-start gap-3 rounded-md border px-4 py-3 shadow-lg backdrop-blur',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
        'data-[state=closed]:fade-out-80 data-[state=open]:fade-in-80',
        config.className
      )}
    >
      <div className="mt-0.5 shrink-0" data-testid={`toast-icon-${type}`} aria-hidden>
        {config.icon}
      </div>
      <div className="min-w-0 flex-1">
        <Toast.Title className="text-sm font-semibold leading-5">{title}</Toast.Title>
        {description ? <Toast.Description className="mt-1 text-xs text-current/90">{description}</Toast.Description> : null}
      </div>
      <Toast.Close asChild>
        <button
          type="button"
          aria-label="Close notification"
          className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-current/80 transition hover:bg-black/10 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </Toast.Close>
    </Toast.Root>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const idRef = React.useRef(0)

  const removeToast = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const notify = React.useCallback((options: NotifyOptions) => {
    idRef.current += 1
    setToasts((prev) => [
      ...prev,
      {
        id: idRef.current,
        ...options,
        durationMs: options.durationMs ?? DEFAULT_TOAST_DURATION_MS,
      },
    ])
  }, [])

  return (
    <ToastContext.Provider value={{ notify }}>
      <Toast.Provider duration={DEFAULT_TOAST_DURATION_MS} swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <ToastBanner
            key={toast.id}
            type={toast.type}
            title={toast.title}
            description={toast.description}
            durationMs={toast.durationMs}
            open
            onOpenChange={(open) => {
              if (!open) {
                removeToast(toast.id)
              }
            }}
          />
        ))}
        <Toast.Viewport
          className="pointer-events-none fixed right-4 top-4 z-[100] flex max-h-screen w-full max-w-[440px] flex-col gap-2 outline-none"
          data-testid="toast-viewport"
        />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}

export { DEFAULT_TOAST_DURATION_MS }
