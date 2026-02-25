import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

function OpenTooltipPreview() {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover target</Button>
        </TooltipTrigger>
        <TooltipContent forceMount>Helpful context for this control.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const Dark: Story = {
  render: () => <OpenTooltipPreview />,
  globals: {
    theme: 'dark',
  },
};

export const Light: Story = {
  render: () => <OpenTooltipPreview />,
  globals: {
    theme: 'light',
  },
};

export const DefaultState: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover target</Button>
        </TooltipTrigger>
        <TooltipContent>Appears on hover.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
