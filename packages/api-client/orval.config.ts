import { defineConfig } from 'orval';

export default defineConfig({
  'vas-dj-api': {
    input: {
      target: '../../backend/docs/api/openapi-v1.0.0.yaml',
    },
    output: {
      target: 'src/generated/api.ts',
      client: 'fetch',
      mode: 'tags-split',
      override: {
        mutator: {
          path: 'src/core/mutator.ts',
          name: 'customFetch',
        },
      },
    },
  },
});
