import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes (web only)',
    },
    style: {
      control: 'object',
      description: 'Inline styles (React Native)',
    },
    testID: {
      control: 'text',
      description: 'Test identifier for automated testing',
    },
  },
};

export default preview;