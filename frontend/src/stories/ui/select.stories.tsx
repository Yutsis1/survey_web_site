import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

function OpenSelectPreview() {
  return (
    <div className="grid w-72 gap-2">
      <Label htmlFor="select-mode">Display mode</Label>
      <Select defaultValue="table" open>
        <SelectTrigger aria-label="Display mode" id="select-mode">
          <SelectValue placeholder="Select mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="table">Table</SelectItem>
          <SelectItem value="cards">Cards</SelectItem>
          <SelectItem value="kanban">Kanban</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export const Dark: Story = {
  render: () => <OpenSelectPreview />,
  globals: {
    theme: 'dark',
  },
};

export const Light: Story = {
  render: () => <OpenSelectPreview />,
  globals: {
    theme: 'light',
  },
};

export const Closed: Story = {
  render: () => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="select-team">Team</Label>
      <Select defaultValue="design">
        <SelectTrigger aria-label="Team" id="select-team">
          <SelectValue placeholder="Select team" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="design">Design</SelectItem>
          <SelectItem value="product">Product</SelectItem>
          <SelectItem value="engineering">Engineering</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
