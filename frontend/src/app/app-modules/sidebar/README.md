# Sidebar Architecture

## Overview

The Sidebar module provides a modular, section-based architecture for building sidebars with different types of content.

## Components

### Sidebar

The main container component that wraps all sidebar sections.

```tsx
<Sidebar>
  {/* Sections go here */}
</Sidebar>
```

**Props:**
- `children`: React nodes containing Section components
- `className`: Optional additional CSS classes

### Section

A reusable section component that can contain any type of content. Sections are visually separated with borders and padding.

```tsx
<Section
  title="Section Title"
  description="Optional description text"
  icon={IconComponent}
  contentClassName="space-y-2"
>
  {/* Section content */}
</Section>
```

**Props:**
- `title`: Optional section title
- `description`: Optional description text below the title
- `icon`: Optional Lucide icon component to display next to the title
- `children`: Optional content to display in the section
- `className`: Optional additional CSS classes for the section container
- `contentClassName`: Optional CSS classes for the content wrapper

### ButtonGroup

A specialized component for displaying a list of buttons within a section.

```tsx
<ButtonGroup
  buttons={[
    {
      label: 'Button 1',
      onClick: handleClick,
      test_id: 'button-1',
      disabled: false,
    },
    // More buttons...
  ]}
/>
```

**Props:**
- `buttons`: Array of ButtonProps with the following properties:
  - `label`: Button text (supports built-in icons for common actions)
  - `onClick`: Click handler
  - `className`: Optional CSS classes
  - `test_id`: Test identifier
  - `disabled`: Optional disabled state

**Built-in Icons:**
The ButtonGroup automatically adds icons for these labels:
- "New Question" → FilePlus2
- "Clear Questions" → Trash2
- "Save Survey" → Save
- "Saving..." → Save
- "Loading..." → Save
- "Load Survey" → Upload
- "Logout" → LogOut

## Example Usage

```tsx
import { Sidebar, Section, ButtonGroup } from '../app-modules/sidebar';
import { Sparkles, LayoutGrid } from 'lucide-react';

function MySidebar() {
  return (
    <Sidebar>
      {/* Header Section */}
      <Section
        title="My Application"
        description="Application description goes here"
        icon={Sparkles}
      />

      {/* Form Section */}
      <Section title="Details" contentClassName="space-y-3">
        <TextInput label="Name" />
        <Select label="Status" />
      </Section>

      {/* Actions Section */}
      <Section title="Actions">
        <ButtonGroup
          buttons={[
            { label: 'Save', onClick: handleSave },
            { label: 'Cancel', onClick: handleCancel },
          ]}
        />
      </Section>

      {/* Custom Section */}
      <Section title="Links" icon={LayoutGrid}>
        <Button>Copy Link</Button>
        <p className="text-xs">Additional info</p>
      </Section>
    </Sidebar>
  );
}
```

## Architecture Benefits

1. **Modularity**: Each section is independent and can contain any type of content
2. **Reusability**: Sections can be reused across different sidebars
3. **Clarity**: Clear separation between different functional areas
4. **Flexibility**: Easy to add, remove, or reorder sections
5. **Type Safety**: Full TypeScript support with proper types
6. **Maintainability**: Changes to one section don't affect others

## File Structure

```
sidebar/
├── index.ts              # Main export file
├── sidebar.tsx           # Main Sidebar container
├── section.tsx           # Section component
├── button-group.tsx      # ButtonGroup component
└── README.md            # This file
```
