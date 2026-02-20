/**
 * Plop.js code generators for the VAS-DJ SaaS monorepo.
 *
 * Usage:
 *   pnpm generate              # Interactive menu
 *   pnpm generate django-app   # Generate a Django app
 *   pnpm generate component    # Generate a cross-platform React component
 *   pnpm generate api-service  # Generate an API service in api-client
 */

export default function (plop) {
  // ─── Django App Generator ───────────────────────────────────────────
  plop.setGenerator("django-app", {
    description:
      "Create a new Django app with models, views, serializers, URLs, and tests",
    prompts: [
      {
        type: "input",
        name: "name",
        message: 'App name (snake_case, e.g., "invoices"):',
        validate: (v) =>
          /^[a-z][a-z0-9_]*$/.test(v) || "Must be lowercase snake_case",
      },
    ],
    actions: [
      {
        type: "add",
        path: "backend/apps/{{name}}/__init__.py",
        template: "",
      },
      {
        type: "add",
        path: "backend/apps/{{name}}/models.py",
        templateFile: "plop-templates/django-app/models.py.hbs",
      },
      {
        type: "add",
        path: "backend/apps/{{name}}/views.py",
        templateFile: "plop-templates/django-app/views.py.hbs",
      },
      {
        type: "add",
        path: "backend/apps/{{name}}/serializers.py",
        templateFile: "plop-templates/django-app/serializers.py.hbs",
      },
      {
        type: "add",
        path: "backend/apps/{{name}}/urls.py",
        templateFile: "plop-templates/django-app/urls.py.hbs",
      },
      {
        type: "add",
        path: "backend/apps/{{name}}/admin.py",
        templateFile: "plop-templates/django-app/admin.py.hbs",
      },
      {
        type: "add",
        path: "backend/apps/{{name}}/apps.py",
        templateFile: "plop-templates/django-app/apps.py.hbs",
      },
      {
        type: "add",
        path: "backend/apps/{{name}}/tests/__init__.py",
        template: "",
      },
      {
        type: "add",
        path: "backend/apps/{{name}}/tests/test_views.py",
        templateFile: "plop-templates/django-app/test_views.py.hbs",
      },
      {
        type: "add",
        path: "backend/apps/{{name}}/migrations/__init__.py",
        template: "",
      },
    ],
  });

  // ─── React Component Generator ──────────────────────────────────────
  plop.setGenerator("component", {
    description: "Create a cross-platform React component in packages/ui",
    prompts: [
      {
        type: "input",
        name: "name",
        message: 'Component name (PascalCase, e.g., "DataTable"):',
        validate: (v) => /^[A-Z][a-zA-Z0-9]*$/.test(v) || "Must be PascalCase",
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/ui/src/components/{{name}}/{{name}}.web.tsx",
        templateFile: "plop-templates/react-component/Component.web.tsx.hbs",
      },
      {
        type: "add",
        path: "packages/ui/src/components/{{name}}/{{name}}.native.tsx",
        templateFile: "plop-templates/react-component/Component.native.tsx.hbs",
      },
      {
        type: "add",
        path: "packages/ui/src/components/{{name}}/types.ts",
        templateFile: "plop-templates/react-component/types.ts.hbs",
      },
      {
        type: "add",
        path: "packages/ui/src/components/{{name}}/index.ts",
        templateFile: "plop-templates/react-component/index.ts.hbs",
      },
      {
        type: "add",
        path: "packages/ui/src/components/{{name}}/{{name}}.stories.tsx",
        templateFile:
          "plop-templates/react-component/Component.stories.tsx.hbs",
      },
    ],
  });

  // ─── API Service Generator ──────────────────────────────────────────
  plop.setGenerator("api-service", {
    description: "Create a new API service in packages/api-client",
    prompts: [
      {
        type: "input",
        name: "name",
        message: 'Service name (camelCase, e.g., "analytics"):',
        validate: (v) => /^[a-z][a-zA-Z0-9]*$/.test(v) || "Must be camelCase",
      },
      {
        type: "input",
        name: "endpoint",
        message: 'API base endpoint (e.g., "/api/v1/analytics"):',
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/api-client/src/services/{{name}}.ts",
        templateFile: "plop-templates/api-service/service.ts.hbs",
      },
    ],
  });
}
