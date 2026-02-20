import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { Checkbox } from './checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: {
    activeLabel: 'Active',
    inactiveLabel: 'Inactive',
    checked: false,
    onChange: fn(),
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inactive: Story = {};

export const Active: Story = {
  args: {
    checked: true,
  },
};

export const CustomLabels: Story = {
  args: {
    activeLabel: 'On',
    inactiveLabel: 'Off',
    checked: true,
  },
};
