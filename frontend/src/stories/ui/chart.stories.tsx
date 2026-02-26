import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartData = [
  { month: 'Jan', responses: 32 },
  { month: 'Feb', responses: 45 },
  { month: 'Mar', responses: 38 },
  { month: 'Apr', responses: 52 },
  { month: 'May', responses: 49 },
];

const chartConfig = {
  responses: {
    label: 'Responses',
    color: 'hsl(var(--primary))',
  },
};

const meta = {
  title: 'UI/Chart',
  component: ChartContainer,
  tags: ['autodocs'],
  args: {
    config: chartConfig,
    children: null,
  },
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

function BarChartPreview() {
  return (
    <ChartContainer className="max-w-2xl" config={chartConfig}>
      <BarChart data={chartData} height={240} width={700}>
        <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
        <XAxis axisLine={false} dataKey="month" tickLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="responses" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

export const Dark: Story = {
  render: () => <BarChartPreview />,
  globals: {
    theme: 'dark',
  },
};

export const Light: Story = {
  render: () => <BarChartPreview />,
  globals: {
    theme: 'light',
  },
};

export const TooltipContentPreview: Story = {
  render: () => (
    <ChartContainer className="max-w-sm" config={chartConfig}>
      <ChartTooltipContent
        active
        label="May"
        payload={[{ color: 'hsl(var(--primary))', name: 'responses', value: 49 }]}
      />
    </ChartContainer>
  ),
};
