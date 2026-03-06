import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Sparkles, LayoutGrid, Settings, Info } from 'lucide-react';

import { Section } from '@/app/app-modules/sidebar/section';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/app/text-field/text-field';

const meta = {
  title: 'App Modules/Sidebar/Section',
  component: Section,
  tags: ['autodocs'],
  args: {
    title: 'Section Title',
    description: undefined,
    icon: undefined,
    className: '',
    contentClassName: '',
  },
  argTypes: {
    icon: {
      control: { type: 'select' },
      options: ['None', 'Sparkles', 'LayoutGrid', 'Settings', 'Info'],
      mapping: {
        None: undefined,
        Sparkles: Sparkles,
        LayoutGrid: LayoutGrid,
        Settings: Settings,
        Info: Info,
      },
    },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <p className="text-sm">This is the section content.</p>,
  },
};

export const WithTitleAndDescription: Story = {
  args: {
    title: 'Settings',
    description: 'Configure your application preferences',
    children: <p className="text-sm">Form fields would go here.</p>,
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Survey Builder',
    description: 'Drag, resize, and configure your survey with modular question cards.',
    icon: Sparkles,
  },
};

export const WithFormContent: Story = {
  args: {
    title: 'Survey Details',
    contentClassName: 'space-y-3',
    children: (
      <>
        <TextInput label="Survey Name" placeholder="Enter survey name..." />
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-foreground">
            Status
          </label>
          <select
            id="status"
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option>draft</option>
            <option>published</option>
          </select>
        </div>
      </>
    ),
  },
};

export const WithButtonContent: Story = {
  args: {
    title: 'Public Links',
    icon: LayoutGrid,
    contentClassName: 'space-y-2',
    children: (
      <>
        <Button variant="outline" className="w-full justify-start text-xs">
          Copy public survey
        </Button>
        <p className="text-xs text-muted-foreground">Save survey first to get a public link.</p>
      </>
    ),
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Just a Title',
    icon: Info,
  },
};

export const DescriptionOnly: Story = {
  args: {
    description: 'This section has only a description, no title.',
    children: <p className="text-sm">Content here.</p>,
  },
};

export const NoHeader: Story = {
  args: {
    children: (
      <div className="space-y-2">
        <p className="text-sm">Section with no title or description.</p>
        <Button size="sm">Action Button</Button>
      </div>
    ),
  },
};
