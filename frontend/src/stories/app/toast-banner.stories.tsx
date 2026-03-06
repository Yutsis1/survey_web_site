import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { ToastProvider, type ToastType, useToast } from '@/components/app/toast'
import { Button } from '@/components/ui/button'

const toastExamples: Record<ToastType, { title: string; description: string }> = {
  error: {
    title: 'Failed to save survey',
    description: 'Please retry in a moment.',
  },
  info: {
    title: 'Survey draft loaded',
    description: 'Continue editing before publishing.',
  },
  warning: {
    title: 'Survey is not published',
    description: 'Publish it before sharing the link.',
  },
  success: {
    title: 'Public link copied',
    description: 'You can now share this survey.',
  },
}

function StoryToastFrame({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-[220px] rounded-md border border-border p-4">{children}</div>
    </ToastProvider>
  )
}

function SingleToastPreview({ type }: { type: ToastType }) {
  const { notify } = useToast()
  const shownRef = React.useRef(false)

  React.useEffect(() => {
    if (shownRef.current) return

    shownRef.current = true
    notify({
      type,
      title: toastExamples[type].title,
      description: toastExamples[type].description,
    })
  }, [notify, type])

  return <p className="text-sm text-muted-foreground">Preview appears in the top-right corner.</p>
}

function TriggerDemo() {
  const { notify } = useToast()

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() =>
          notify({
            type: 'error',
            title: toastExamples.error.title,
            description: toastExamples.error.description,
          })
        }
      >
        Show Error
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          notify({
            type: 'info',
            title: toastExamples.info.title,
            description: toastExamples.info.description,
          })
        }
      >
        Show Info
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          notify({
            type: 'warning',
            title: toastExamples.warning.title,
            description: toastExamples.warning.description,
          })
        }
      >
        Show Warning
      </Button>
      <Button
        onClick={() =>
          notify({
            type: 'success',
            title: toastExamples.success.title,
            description: toastExamples.success.description,
          })
        }
      >
        Show Success
      </Button>
    </div>
  )
}

const meta = {
  title: 'Components/ToastBanner',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Error: Story = {
  render: () => (
    <StoryToastFrame>
      <SingleToastPreview type="error" />
    </StoryToastFrame>
  ),
}

export const Info: Story = {
  render: () => (
    <StoryToastFrame>
      <SingleToastPreview type="info" />
    </StoryToastFrame>
  ),
}

export const Warning: Story = {
  render: () => (
    <StoryToastFrame>
      <SingleToastPreview type="warning" />
    </StoryToastFrame>
  ),
}

export const Success: Story = {
  render: () => (
    <StoryToastFrame>
      <SingleToastPreview type="success" />
    </StoryToastFrame>
  ),
}

export const AllVariantsTriggerDemo: Story = {
  render: () => (
    <StoryToastFrame>
      <TriggerDemo />
    </StoryToastFrame>
  ),
}
