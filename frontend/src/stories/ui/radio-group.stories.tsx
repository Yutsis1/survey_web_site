import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

function RadioPreview() {
  return (
    <RadioGroup className="gap-3" defaultValue="compact">
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="compact" value="compact" />
        <Label htmlFor="compact">Compact layout</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="comfortable" value="comfortable" />
        <Label htmlFor="comfortable">Comfortable layout</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="spacious" value="spacious" />
        <Label htmlFor="spacious">Spacious layout</Label>
      </div>
    </RadioGroup>
  );
}

export const Dark: Story = {
  render: () => <RadioPreview />,
  globals: {
    theme: 'dark',
  },
};

export const Light: Story = {
  render: () => <RadioPreview />,
  globals: {
    theme: 'light',
  },
};

export const DisabledOption: Story = {
  render: () => (
    <RadioGroup className="gap-3" defaultValue="enabled">
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="enabled" value="enabled" />
        <Label htmlFor="enabled">Enabled</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem disabled id="disabled" value="disabled" />
        <Label htmlFor="disabled">Disabled</Label>
      </div>
    </RadioGroup>
  ),
};
