import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Separator } from '@/components/ui/separator';

const meta = {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {
  render: () => (
    <div className="max-w-md space-y-3">
      <p className="text-sm text-muted-foreground">Section one</p>
      <Separator />
      <p className="text-sm text-muted-foreground">Section two</p>
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

export const Vertical: Story = {
  render: () => (
    <div className="flex h-20 items-center gap-4">
      <span className="text-sm">Left</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Right</span>
    </div>
  ),
};
