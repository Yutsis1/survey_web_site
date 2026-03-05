import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ButtonGroup } from '@/app/app-modules/sidebar/button-group';

const meta = {
  title: 'App Modules/Sidebar/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  args: {
    buttons: [],
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    buttons: [
      {
        label: 'New Question',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-1',
      },
      {
        label: 'Save Survey',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-save',
      },
      {
        label: 'Load Survey',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-load',
      },
    ],
  },
};

export const WithAllActions: Story = {
  args: {
    buttons: [
      {
        label: 'New Question',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-1',
      },
      {
        label: 'Clear Questions',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-2',
      },
      {
        label: 'Save Survey',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-save',
      },
      {
        label: 'Load Survey',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-load',
      },
      {
        label: 'Logout',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-logout',
      },
    ],
  },
};

export const WithDisabledButtons: Story = {
  args: {
    buttons: [
      {
        label: 'Saving...',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-save',
        disabled: true,
      },
      {
        label: 'Loading...',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-load',
        disabled: true,
      },
      {
        label: 'Logout',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-logout',
      },
    ],
  },
};

export const SingleButton: Story = {
  args: {
    buttons: [
      {
        label: 'Logout',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-logout',
      },
    ],
  },
};

export const SaveStates: Story = {
  args: {
    buttons: [
      {
        label: 'Save Survey',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-save-1',
      },
      {
        label: 'Saving...',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-save-2',
        disabled: true,
      },
    ],
  },
};

export const LoadStates: Story = {
  args: {
    buttons: [
      {
        label: 'Load Survey',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-load-1',
      },
      {
        label: 'Loading...',
        onClick: fn(),
        className: 'button-base',
        test_id: 'button-load-2',
        disabled: true,
      },
    ],
  },
};
