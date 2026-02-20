import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { DropDown } from './dropDown';

const options = [
  { value: 'survey-1', label: 'Survey One (abc12345)' },
  { value: 'survey-2', label: 'Survey Two (def67890)' },
  { value: 'survey-3', label: 'Survey Three (ghi54321)' },
];

const meta = {
  title: 'Components/DropDown',
  component: DropDown,
  tags: ['autodocs'],
  args: {
    options,
    selectedOption: 'survey-1',
    onSelect: fn(),
    label: 'Choose survey',
    id: 'survey-select',
    name: 'survey',
    disabled: false,
  },
  argTypes: {
    selectedOption: {
      control: { type: 'select' },
      options: options.map((option) => option.value),
    },
  },
} satisfies Meta<typeof DropDown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
  },
};
