import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_TOAST_DURATION_MS, ToastProvider, useToast } from './toast-provider'

function ToastTestHarness() {
  const { notify } = useToast()

  return (
    <div>
      <button onClick={() => notify({ type: 'error', title: 'Error toast' })}>Notify error</button>
      <button onClick={() => notify({ type: 'info', title: 'Info toast' })}>Notify info</button>
      <button onClick={() => notify({ type: 'warning', title: 'Warning toast' })}>Notify warning</button>
      <button onClick={() => notify({ type: 'success', title: 'Success toast' })}>Notify success</button>
    </div>
  )
}

function renderToastHarness() {
  render(
    <ToastProvider>
      <ToastTestHarness />
    </ToastProvider>
  )
}

describe('ToastProvider', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('renders all toast variants correctly', async () => {
    renderToastHarness()

    fireEvent.click(screen.getByRole('button', { name: 'Notify error' }))
    fireEvent.click(screen.getByRole('button', { name: 'Notify info' }))
    fireEvent.click(screen.getByRole('button', { name: 'Notify warning' }))
    fireEvent.click(screen.getByRole('button', { name: 'Notify success' }))

    expect(await screen.findByTestId('toast-banner-error')).toHaveClass('toast-error')
    expect(await screen.findByTestId('toast-banner-info')).toHaveClass('toast-info')
    expect(await screen.findByTestId('toast-banner-warning')).toHaveClass('toast-warning')
    expect(await screen.findByTestId('toast-banner-success')).toHaveClass('toast-success')

    expect(screen.getByTestId('toast-icon-error')).toBeInTheDocument()
    expect(screen.getByTestId('toast-icon-info')).toBeInTheDocument()
    expect(screen.getByTestId('toast-icon-warning')).toBeInTheDocument()
    expect(screen.getByTestId('toast-icon-success')).toBeInTheDocument()
  })

  it('uses semantic status role and a close button', async () => {
    renderToastHarness()

    fireEvent.click(screen.getByRole('button', { name: 'Notify info' }))

    const toast = await screen.findByTestId('toast-banner-info')
    expect(toast).toHaveAttribute('role', 'status')
    expect(within(toast).getByRole('button', { name: 'Close notification' })).toBeInTheDocument()
  })

  it('closes a toast when close button is clicked', async () => {
    renderToastHarness()

    fireEvent.click(screen.getByRole('button', { name: 'Notify success' }))

    const toast = await screen.findByTestId('toast-banner-success')
    fireEvent.click(within(toast).getByRole('button', { name: 'Close notification' }))

    await waitFor(() => {
      expect(screen.queryByTestId('toast-banner-success')).not.toBeInTheDocument()
    })
  })

  it('auto dismisses a toast after the default duration', async () => {
    renderToastHarness()

    fireEvent.click(screen.getByRole('button', { name: 'Notify warning' }))
    expect(await screen.findByTestId('toast-banner-warning')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('toast-banner-warning')).not.toBeInTheDocument()
    }, { timeout: DEFAULT_TOAST_DURATION_MS + 3000 })
  }, 10000)
})
