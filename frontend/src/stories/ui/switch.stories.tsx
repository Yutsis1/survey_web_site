import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const meta = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: {
    defaultChecked: true,
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

function SwitchPreview(defaultChecked: boolean) {
  return (
    <div className="flex items-center space-x-2">
      <Switch defaultChecked={defaultChecked} id="notifications" />
      <Label htmlFor="notifications">Email notifications</Label>
    </div>
  );
}

export const Dark: Story = {
  render: () => SwitchPreview(true),
  globals: {
    theme: 'dark',
  },
};

export const Light: Story = {
  render: () => SwitchPreview(true),
  globals: {
    theme: 'light',
  },
};

export const Unchecked: Story = {
  render: () => SwitchPreview(false),
};
