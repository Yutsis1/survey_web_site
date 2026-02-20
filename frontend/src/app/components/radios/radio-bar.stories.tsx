import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { RadioBar } from './radio-bar';

const buttons = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

const meta = {
  title: 'Components/RadioBar',
  component: RadioBar,
  tags: ['autodocs'],
  args: {
    buttons,
    name: 'storybook-radio-group',
    selectedValue: '1',
    onChange: fn(),
  },
  argTypes: {
    selectedValue: {
      control: { type: 'select' },
      options: buttons.map((button) => button.value),
    },
  },
} satisfies Meta<typeof RadioBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstSelected: Story = {};

export const SecondSelected: Story = {
  args: {
    selectedValue: '2',
  },
};

export const Uncontrolled: Story = {
  args: {
    selectedValue: undefined,
  },
};
