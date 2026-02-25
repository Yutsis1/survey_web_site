import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import '../src/app/globals.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Global color theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'dark',
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === 'light' ? 'light' : 'dark';

      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('light', theme === 'light');
      }

      return React.createElement(
        'div',
        { className: 'min-h-screen bg-background p-6 text-foreground' },
        React.createElement(Story, {})
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
