import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function TabsPreview() {
  return (
    <Tabs className="w-[420px]" defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="responses">Responses</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>High-level engagement summary.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Response rate: 73%</CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="responses">
        <Card>
          <CardHeader>
            <CardTitle>Responses</CardTitle>
            <CardDescription>Recent submission activity.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">48 submissions this week.</CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export const Dark: Story = {
  render: () => <TabsPreview />,
  globals: {
    theme: 'dark',
  },
};

export const Light: Story = {
  render: () => <TabsPreview />,
  globals: {
    theme: 'light',
  },
};

export const ResponsesActive: Story = {
  render: () => (
    <Tabs className="w-[420px]" defaultValue="responses">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="responses">Responses</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview tab content</TabsContent>
      <TabsContent value="responses">Responses tab content</TabsContent>
    </Tabs>
  ),
};
