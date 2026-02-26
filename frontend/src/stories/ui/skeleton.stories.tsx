import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Skeleton } from '@/components/ui/skeleton';

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {
  render: () => (
    <div className="space-y-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-56" />
    </div>
  ),
  globals: {
    theme: 'dark',
  },
};

export const Light: Story = {
  render: Dark.render,
  globals: {
    theme: 'light',
  },
};

export const CardPlaceholder: Story = {
  render: () => (
    <div className="w-80 rounded-xl border border-border p-4">
      <Skeleton className="mb-4 h-40 w-full rounded-lg" />
      <Skeleton className="mb-2 h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};
