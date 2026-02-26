import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const rows = [
  { name: 'Customer Satisfaction', responses: 184, status: 'Published' },
  { name: 'Feature Priorities', responses: 96, status: 'Draft' },
  { name: 'Onboarding Feedback', responses: 212, status: 'Published' },
];

const meta = {
  title: 'UI/Table',
  component: Table,
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

function TablePreview() {
  return (
    <Table>
      <TableCaption>Survey status overview.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Survey</TableHead>
          <TableHead className="text-right">Responses</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.name}>
            <TableCell>{row.name}</TableCell>
            <TableCell className="text-right">{row.responses}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const Dark: Story = {
  render: () => <TablePreview />,
  globals: {
    theme: 'dark',
  },
};

export const Light: Story = {
  render: () => <TablePreview />,
  globals: {
    theme: 'light',
  },
};

export const Empty: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Survey</TableHead>
          <TableHead className="text-right">Responses</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="text-muted-foreground" colSpan={3}>
            No rows available.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
