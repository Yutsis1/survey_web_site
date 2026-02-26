import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Progress } from '@/components/ui/progress';

const meta = {
  title: 'UI/Progress',
  component: Progress,
  tags: ['autodocs'],
  args: {
    value: 40,
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {
  globals: {
    theme: 'dark',
  },
};

export const Light: Story = {
  globals: {
    theme: 'light',
  },
};

export const Milestones: Story = {
  render: () => (
    <div className="grid max-w-lg gap-4">
      <Progress value={20} />
      <Progress value={45} />
      <Progress value={80} />
      <Progress value={100} />
    </div>
  ),
};
