import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { SwitchComponent } from '@/components/app/checkbox/switch';

const meta = {
  title: 'Components/Switch',
  component: SwitchComponent,
  tags: ['autodocs'],
  args: {
    activeLabel: 'Active',
    inactiveLabel: 'Inactive',
    checked: false,
    onChange: fn(),
  },
} satisfies Meta<typeof SwitchComponent>;

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
