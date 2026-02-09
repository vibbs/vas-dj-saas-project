import type { Preview } from "@storybook/react";
import React from "react";
import "../src/styles/globals.css";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import { themes, type ThemeName } from "../src/theme/tokens";

// Suppress React testing warnings in Storybook
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("ReactDOMTestUtils.act") ||
      args[0].includes("testing environment is not configured to support act"))
  ) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("ReactDOMTestUtils.act") ||
      args[0].includes("testing environment is not configured to support act"))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
    // Add theme switcher toolbar
    toolbar: {
      theme: {
        name: "Theme",
        description: "Global theme for components",
        defaultValue: "default",
        toolbar: {
          icon: "paintbrush",
          items: [
            { value: "default", title: "Default", left: "🌟" },
            { value: "dark", title: "Dark", left: "🌙" },
            { value: "blue", title: "Blue", left: "🔵" },
            { value: "green", title: "Green", left: "🟢" },
            { value: "purple", title: "Purple", left: "🟣" },
            { value: "rose", title: "Rose", left: "🌹" },
            { value: "orange", title: "Orange", left: "🟠" },
          ],
          showName: true,
        },
      },
    },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: "default",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "default", title: "Default" },
          { value: "dark", title: "Dark" },
          { value: "blue", title: "Blue" },
          { value: "green", title: "Green" },
          { value: "purple", title: "Purple" },
          { value: "rose", title: "Rose" },
          { value: "orange", title: "Orange" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const themeName = (context.globals.theme as ThemeName) || "default";
      const selectedTheme = themes[themeName];

      return (
        <ThemeProvider theme={selectedTheme}>
          <Story />
        </ThemeProvider>
      );
    },
  ],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes (web only)",
    },
    style: {
      control: "object",
      description: "Inline styles (React Native)",
    },
    testID: {
      control: "text",
      description: "Test identifier for automated testing",
    },
  },
};

export default preview;
