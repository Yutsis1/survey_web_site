import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Sparkles, LayoutGrid } from 'lucide-react';

import { Sidebar } from '@/app/app-modules/sidebar/sidebar';
import { Section } from '@/app/app-modules/sidebar/section';
import { ButtonGroup } from '@/app/app-modules/sidebar/button-group';
import { TextInput } from '@/components/app/text-field/text-field';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const meta = {
  title: 'App Modules/Sidebar/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    className: '',
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Section
          title="Application"
          description="This is a simple sidebar with one section"
          icon={Sparkles}
        />
      </>
    ),
  },
};

export const MultipleSections: Story = {
  args: {
    children: (
      <>
        <Section title="Header" description="Application header section" icon={Sparkles} />
        <Section title="Details" contentClassName="space-y-2">
          <TextInput label="Name" placeholder="Enter name..." />
        </Section>
        <Section title="Actions">
          <ButtonGroup
            buttons={[
              { label: 'Save Survey', onClick: fn(), test_id: 'save' },
              { label: 'Logout', onClick: fn(), test_id: 'logout' },
            ]}
          />
        </Section>
      </>
    ),
  },
};

export const SurveyBuilderExample: Story = {
  args: {
    children: (
      <>
        <Section
          title="Survey Builder"
          description="Drag, resize, and configure your survey with modular question cards."
          icon={Sparkles}
        />

        <Section title="Survey Details" contentClassName="space-y-3">
          <div>
            <TextInput label="Survey Name" placeholder="Enter survey name..." />
          </div>
          <div>
            <label htmlFor="survey-status" className="mb-1 block text-xs font-medium text-foreground">
              Survey Status
            </label>
            <select
              id="survey-status"
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              defaultValue="draft"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </div>
        </Section>

        <Section title="Actions">
          <ButtonGroup
            buttons={[
              { label: 'New Question', onClick: fn(), test_id: 'button-1' },
              { label: 'Clear Questions', onClick: fn(), test_id: 'button-2' },
              { label: 'Save Survey', onClick: fn(), test_id: 'button-save' },
              { label: 'Load Survey', onClick: fn(), test_id: 'button-load' },
              { label: 'Logout', onClick: fn(), test_id: 'button-logout' },
            ]}
          />
        </Section>

        <Separator className="my-4" />

        <Section title="Public Survey Link" icon={LayoutGrid} contentClassName="space-y-2">
          <Button variant="outline" className="w-full justify-start text-xs">
            Copy public survey
          </Button>
          <p className="text-xs text-muted-foreground">Save survey first to get a public link.</p>
        </Section>
      </>
    ),
  },
};

export const WithSeparators: Story = {
  args: {
    children: (
      <>
        <Section title="Section 1" icon={Sparkles}>
          <p className="text-sm">First section content</p>
        </Section>

        <Separator className="my-4" />

        <Section title="Section 2">
          <p className="text-sm">Second section content</p>
        </Section>

        <Separator className="my-4" />

        <Section title="Section 3">
          <ButtonGroup buttons={[{ label: 'Logout', onClick: fn(), test_id: 'logout' }]} />
        </Section>
      </>
    ),
  },
};

export const MinimalSidebar: Story = {
  args: {
    children: (
      <>
        <Section title="Actions">
          <ButtonGroup
            buttons={[
              { label: 'Save Survey', onClick: fn(), test_id: 'save' },
              { label: 'Logout', onClick: fn(), test_id: 'logout' },
            ]}
          />
        </Section>
      </>
    ),
  },
};

export const ComplexLayout: Story = {
  args: {
    children: (
      <>
        <Section title="Application" description="Welcome to the app" icon={Sparkles} />

        <Section title="Form" contentClassName="space-y-3">
          <TextInput label="Title" placeholder="Enter title..." />
          <TextInput label="Description" placeholder="Enter description..." />
        </Section>

        <Section title="Primary Actions">
          <ButtonGroup
            buttons={[
              { label: 'New Question', onClick: fn(), test_id: 'new' },
              { label: 'Save Survey', onClick: fn(), test_id: 'save' },
            ]}
          />
        </Section>

        <Section title="Secondary Actions">
          <ButtonGroup
            buttons={[
              { label: 'Load Survey', onClick: fn(), test_id: 'load' },
              { label: 'Clear Questions', onClick: fn(), test_id: 'clear' },
            ]}
          />
        </Section>

        <Separator />

        <Section title="Account">
          <ButtonGroup buttons={[{ label: 'Logout', onClick: fn(), test_id: 'logout' }]} />
        </Section>
      </>
    ),
  },
};
