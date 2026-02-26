import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Input } from '@/components/ui/input';

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    placeholder: 'Enter value',
    type: 'text',
  },
} satisfies Meta<typeof Input>;

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

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Read only',
  },
};
