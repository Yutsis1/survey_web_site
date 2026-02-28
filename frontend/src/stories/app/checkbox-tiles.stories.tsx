import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { CheckboxTiles } from '@/components/app/checkbox/checkbox-tiles';

const buttons = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

const meta = {
  title: 'Components/CheckboxTiles',
  component: CheckboxTiles,
  tags: ['autodocs'],
  args: {
    buttons,
    name: 'storybook-checkbox-tiles',
    selectedValues: undefined,
    onChange: fn(),
    test_id: 'checkbox-tiles',
  },
  argTypes: {
    selectedValues: {
      control: { type: 'check' },
      options: buttons.map((button) => button.value),
    },
  },
} satisfies Meta<typeof CheckboxTiles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Uncontrolled: Story = {};

export const FirstSelected: Story = {
  args: {
    selectedValues: ['1'],
  },
};

export const MultipleSelected: Story = {
  args: {
    selectedValues: ['1', '3'],
  },
};
