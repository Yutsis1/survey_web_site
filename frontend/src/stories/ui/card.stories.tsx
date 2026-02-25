import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Team Plan</CardTitle>
        <CardDescription>Upgrade your workspace limits.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Includes 50 projects, 10 collaborators, and API access.</p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button>Upgrade</Button>
      </CardFooter>
    </Card>
  ),
  globals: {
    theme: 'dark',
  },
};

export const Light: Story = {
  render: Dark.render,
  globals: {
    theme: 'light',
  },
};

export const Compact: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader className="p-4">
        <CardTitle className="text-base">Compact Card</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm text-muted-foreground">Used for dense dashboards.</CardContent>
    </Card>
  ),
};
