import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { Button } from './button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    label: 'Click me',
    className: 'button-base',
    onClick: fn(),
    disabled: false,
  },
  argTypes: {
    className: {
      control: { type: 'select' },
      options: ['button-base', 'button-secondary', 'button-cancel'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    className: 'button-base',
  },
};

export const Secondary: Story = {
  args: {
    className: 'button-secondary',
  },
};

export const Cancel: Story = {
  args: {
    className: 'button-cancel',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
