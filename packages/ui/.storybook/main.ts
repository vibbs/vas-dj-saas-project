import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "!../src/components/TestButton/**",
    "!../src/components/Button/Button.comparison.stories.tsx",
    "!../src/components/ShallowTabs/**",
  ],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-native": "react-native-web",
      "react-native-svg": "react-native-svg-web",
      // Mock Next.js navigation for Storybook
      "next/navigation": path.resolve(__dirname, "nextNavigationMock.ts"),
    };
    config.resolve.extensions = [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".json",
    ];
    config.define = {
      ...config.define,
      __DEV__: process.env.NODE_ENV !== "production",
    };
    return config;
  },
  typescript: {
    check: false,
    reactDocgen: "react-docgen",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  docs: {
    autodocs: "tag",
  },
};

export default config;
