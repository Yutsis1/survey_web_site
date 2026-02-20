import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { TextInput } from './text-field';

const meta = {
  title: 'Components/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  args: {
    label: 'Question',
    placeholder: 'Enter text...',
    onChange: fn(),
    type: 'text',
    className: '',
    showPasswordToggle: false,
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'password', 'email'],
    },
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    value: 'Prefilled value',
  },
};

export const PasswordWithToggle: Story = {
  args: {
    type: 'password',
    showPasswordToggle: true,
    value: 'secret123',
    label: 'Password',
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
  },
};
