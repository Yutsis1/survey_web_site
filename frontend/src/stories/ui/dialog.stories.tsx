import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function OpenDialogPreview() {
  return (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish Survey</DialogTitle>
          <DialogDescription>This will make the survey available to respondents immediately.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary">Cancel</Button>
          <Button>Publish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const Dark: Story = {
  render: () => <OpenDialogPreview />,
  globals: {
    theme: 'dark',
  },
};

export const Light: Story = {
  render: () => <OpenDialogPreview />,
  globals: {
    theme: 'light',
  },
};

export const WithoutCloseButton: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Modal Without Corner Close</DialogTitle>
          <DialogDescription>Useful for guided flows that force a clear action path.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};
