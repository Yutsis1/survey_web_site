import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const meta = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

function OpenMenuPreview() {
  return (
    <DropdownMenu modal={false} open>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" forceMount>
        <DropdownMenuLabel>Manage Survey</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Duplicate
          <DropdownMenuShortcut>Ctrl+D</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Rename
          <DropdownMenuShortcut>F2</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const Dark: Story = {
  render: () => <OpenMenuPreview />,
  globals: {
    theme: 'dark',
  },
};

export const Light: Story = {
  render: () => <OpenMenuPreview />,
  globals: {
    theme: 'light',
  },
};

export const Closed: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Archive</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
