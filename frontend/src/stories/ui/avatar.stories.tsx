import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: {
    className: 'h-12 w-12',
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  globals: {
    theme: 'dark',
  },
};

export const Light: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  globals: {
    theme: 'light',
  },
};

export const WithImage: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage alt="Avatar" src="https://placehold.co/120x120/png" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};
