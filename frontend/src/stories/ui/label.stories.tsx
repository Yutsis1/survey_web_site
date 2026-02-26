import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
  args: {
    children: 'Email',
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

function LabelWithInput() {
  return (
    <div className="grid max-w-sm gap-2">
      <Label htmlFor="email-input">Email</Label>
      <Input id="email-input" placeholder="name@example.com" type="email" />
    </div>
  );
}

export const Dark: Story = {
  render: () => <LabelWithInput />,
  globals: {
    theme: 'dark',
  },
};

export const Light: Story = {
  render: () => <LabelWithInput />,
  globals: {
    theme: 'light',
  },
};

export const DisabledPeer: Story = {
  render: () => (
    <div className="grid max-w-sm gap-2">
      <Label htmlFor="disabled-input">Disabled Input</Label>
      <Input className="peer" disabled id="disabled-input" value="Disabled value" />
    </div>
  ),
};
