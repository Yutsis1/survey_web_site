import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { DeleteDropzone } from './deleteDropzone';

const meta = {
  title: 'Components/DeleteDropzone',
  component: DeleteDropzone,
  tags: ['autodocs'],
  args: {
    isDragging: true,
    isOverTrash: false,
    onDragOver: fn(),
    onDragEnter: fn(),
    onDragLeave: fn(),
    onDrop: fn(),
  },
} satisfies Meta<typeof DeleteDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visible: Story = {};

export const OverTrash: Story = {
  args: {
    isOverTrash: true,
  },
};

export const Hidden: Story = {
  args: {
    isDragging: false,
  },
};
