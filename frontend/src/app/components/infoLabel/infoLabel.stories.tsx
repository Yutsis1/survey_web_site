import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { InfoLabel } from './infoLabel';

const meta = {
  title: 'Components/InfoLabel',
  component: InfoLabel,
  tags: ['autodocs'],
  args: {
    text: 'Informational message',
    type: 'info',
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['info', 'warning', 'error'],
    },
  },
} satisfies Meta<typeof InfoLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};

export const Warning: Story = {
  args: {
    type: 'warning',
    text: 'Warning message',
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    text: 'Error message',
  },
};
