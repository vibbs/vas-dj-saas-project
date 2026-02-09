# @vas-dj-saas/ui - Cross-Platform UI Components

A comprehensive, cross-platform component library built for both React Native and Web, providing consistent design and behavior across the VAS-DJ SaaS ecosystem.

## 🚀 Quick Start

```bash
# Install in your project
pnpm add @vas-dj-saas/ui

# Peer dependencies (if not already installed)
pnpm add react@19.0.0 react-dom@19.0.0
```

### Basic Usage
```typescript
import { Button, Card, Input, ThemeProvider } from '@vas-dj-saas/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Card>
        <Input placeholder="Enter your email" />
        <Button variant="primary">Sign Up</Button>
      </Card>
    </ThemeProvider>
  );
}
```

## 🏗️ Architecture

### Cross-Platform Design
The library uses a sophisticated platform-detection system that automatically renders the appropriate component implementation:

- **Web**: HTML-based components with Tailwind CSS styling
- **React Native**: Native components optimized for mobile performance
- **Shared API**: Identical props and behavior across all platforms

### Component Structure
Each component follows this pattern:
```
Button/
├── Button.ts              # Platform-aware export (entry point)
├── Button.web.tsx         # Web implementation (HTML + Tailwind)
├── Button.native.tsx      # React Native implementation
├── types.ts              # Shared TypeScript interfaces
├── index.ts              # Public exports
├── README.md            # Component-specific documentation
└── Button.stories.tsx   # Storybook stories
```

## 🎨 Design System

### Theme System
Unified design tokens work across all platforms:
```typescript
const theme = {
  colors: {
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#f1f5f9',
    // ... more colors
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontSizes: [12, 14, 16, 18, 24, 32, 48],
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};
```

### Dark Mode Support
Automatic dark mode with system preference detection:
```typescript
import { useTheme } from '@vas-dj-saas/ui';

function MyComponent() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  // Theme automatically adapts to system preferences
}
```

## 📱 Available Components

### Core Components

#### [Button](./src/components/Button/README.md)
Cross-platform button with multiple variants:
```typescript
<Button 
  variant="primary" 
  size="md" 
  onPress={handlePress} // React Native
  onClick={handleClick} // Web
>
  Click me
</Button>
```

#### [Card](./src/components/Card/README.md)
Flexible container component:
```typescript
<Card variant="outlined" padding="md">
  <Card.Header>
    <Text variant="h3">Card Title</Text>
  </Card.Header>
  <Card.Content>
    Card content goes here
  </Card.Content>
</Card>
```

#### [Input](./src/components/Input/README.md)
Form input with validation:
```typescript
<Input
  placeholder="Enter email"
  type="email"
  error={errors.email}
  onValueChange={handleEmailChange}
/>
```

#### [Icon](./src/components/Icon/README.md)
Unified icon system using Lucide:
```typescript
<Icon 
  name="user" 
  size={24} 
  color="primary"
  // Automatically uses lucide-react on web, lucide-react-native on mobile
/>
```

### Layout Components

#### Modal
Cross-platform modal/dialog:
```typescript
<Modal visible={isOpen} onClose={handleClose}>
  <Modal.Header>
    <Text variant="h2">Modal Title</Text>
  </Modal.Header>
  <Modal.Content>
    Modal content
  </Modal.Content>
  <Modal.Footer>
    <Button onPress={handleClose}>Close</Button>
  </Modal.Footer>
</Modal>
```

#### Sidebar
Responsive navigation sidebar:
```typescript
<Sidebar>
  <Sidebar.Item icon="home" href="/dashboard">
    Dashboard
  </Sidebar.Item>
  <Sidebar.Item icon="users" href="/team">
    Team
  </Sidebar.Item>
</Sidebar>
```

### Form Components

#### FormField
Complete form field with label and error handling:
```typescript
<FormField
  label="Email Address"
  error={errors.email}
  required
>
  <Input
    type="email"
    placeholder="you@example.com"
    value={email}
    onValueChange={setEmail}
  />
</FormField>
```

#### Select
Custom select dropdown:
```typescript
<Select
  options={[
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ]}
  value={selectedValue}
  onValueChange={setSelectedValue}
  placeholder="Choose an option"
/>
```

### Data Display Components

#### Table
Responsive data table:
```typescript
<Table>
  <Table.Header>
    <Table.Row>
      <Table.HeaderCell>Name</Table.HeaderCell>
      <Table.HeaderCell>Email</Table.HeaderCell>
      <Table.HeaderCell>Actions</Table.HeaderCell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {users.map(user => (
      <Table.Row key={user.id}>
        <Table.Cell>{user.name}</Table.Cell>
        <Table.Cell>{user.email}</Table.Cell>
        <Table.Cell>
          <Button size="sm">Edit</Button>
        </Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
```

#### Badge
Status indicators and labels:
```typescript
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Inactive</Badge>
```

### Feedback Components

#### Toast
Notification system:
```typescript
import { toast } from '@vas-dj-saas/ui';

// Show success message
toast.success('Profile updated successfully');

// Show error message
toast.error('Failed to save changes');

// Custom toast
toast.custom({
  title: 'Custom Notification',
  description: 'This is a custom toast message',
  action: <Button size="sm">Undo</Button>,
});
```

#### Progress
Loading and progress indicators:
```typescript
<Progress value={75} max={100} />
<Progress.Circle value={50} />
<Spinner size="lg" />
```

### Navigation Components

#### Pagination
Data pagination:
```typescript
<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
  showFirst
  showLast
  showPrevNext
/>
```

#### Breadcrumbs
Navigation breadcrumbs:
```typescript
<Breadcrumbs>
  <Breadcrumbs.Item href="/dashboard">Dashboard</Breadcrumbs.Item>
  <Breadcrumbs.Item href="/users">Users</Breadcrumbs.Item>
  <Breadcrumbs.Item current>Edit User</Breadcrumbs.Item>
</Breadcrumbs>
```

## 🎭 Storybook Development

### Running Storybook
```bash
# Start Storybook development server
pnpm storybook

# Build Storybook for production
pnpm build-storybook
```

### Component Stories
Each component has comprehensive Storybook stories:
```typescript
// Button.stories.tsx
export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
    },
  },
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const AllVariants = () => (
  <div className="flex gap-4">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="destructive">Destructive</Button>
  </div>
);
```

## ⚙️ Configuration

### Theme Customization
```typescript
// Custom theme configuration
import { createTheme, ThemeProvider } from '@vas-dj-saas/ui';

const customTheme = createTheme({
  colors: {
    primary: '#your-brand-color',
    secondary: '#your-secondary-color',
  },
  spacing: {
    // Custom spacing scale
  },
  typography: {
    // Custom typography scale
  },
});

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### Platform-Specific Overrides
```typescript
import { Platform } from 'react-native';

const platformStyles = {
  ...commonStyles,
  ...Platform.select({
    ios: {
      // iOS-specific styles
    },
    android: {
      // Android-specific styles
    },
    web: {
      // Web-specific styles
    },
  }),
};
```

## 🧪 Development

### Development Commands
```bash
# Build the package
pnpm build

# Development mode with watch
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Run Storybook
pnpm storybook
```

### Adding New Components

1. **Create component directory:**
```bash
mkdir src/components/NewComponent
cd src/components/NewComponent
```

2. **Create component files:**
```bash
touch NewComponent.ts        # Platform detection
touch NewComponent.web.tsx   # Web implementation
touch NewComponent.native.tsx # React Native implementation
touch types.ts              # TypeScript interfaces
touch index.ts             # Exports
touch README.md           # Documentation
touch NewComponent.stories.tsx # Storybook stories
```

3. **Follow established patterns:**
- Use the same platform detection pattern
- Implement consistent prop APIs
- Include comprehensive TypeScript types
- Add Storybook stories
- Write component-specific documentation

### Testing
```bash
# Unit tests for components
pnpm test

# Test coverage report
pnpm test:coverage

# Visual regression testing with Storybook
pnpm test:visual
```

## 📦 Build & Distribution

### Build Process
```bash
# Build for production
pnpm build

# Build outputs:
# - dist/ - Compiled JavaScript and TypeScript definitions
# - CSS files copied to maintain import paths
# - Platform-specific builds optimized for each target
```

### Package Structure
```
dist/
├── components/
│   ├── Button/
│   │   ├── Button.js
│   │   ├── Button.web.js
│   │   ├── Button.native.js
│   │   ├── types.js
│   │   └── index.js
│   └── ...
├── theme/
├── utils/
├── index.js
├── index.d.ts
└── package.json
```

## 🔗 Integration Examples

### Next.js Web App
```typescript
// apps/web/src/components/LoginForm.tsx
import { Card, Input, Button, FormField } from '@vas-dj-saas/ui';

export function LoginForm() {
  return (
    <Card className="max-w-md mx-auto">
      <Card.Header>
        <h2 className="text-2xl font-bold">Sign In</h2>
      </Card.Header>
      <Card.Content className="space-y-4">
        <FormField label="Email">
          <Input type="email" placeholder="you@example.com" />
        </FormField>
        <FormField label="Password">
          <Input type="password" placeholder="••••••••" />
        </FormField>
        <Button variant="primary" className="w-full">
          Sign In
        </Button>
      </Card.Content>
    </Card>
  );
}
```

### React Native Mobile App
```typescript
// apps/mobile/components/LoginForm.tsx
import { View, StyleSheet } from 'react-native';
import { Card, Input, Button, FormField } from '@vas-dj-saas/ui';

export function LoginForm() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Header>
          <Text style={styles.title}>Sign In</Text>
        </Card.Header>
        <Card.Content style={styles.content}>
          <FormField label="Email">
            <Input 
              type="email" 
              placeholder="you@example.com"
              keyboardType="email-address"
            />
          </FormField>
          <FormField label="Password">
            <Input 
              type="password" 
              placeholder="••••••••"
              secureTextEntry
            />
          </FormField>
          <Button variant="primary" style={styles.button}>
            Sign In
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { maxWidth: 400, alignSelf: 'center' },
  content: { gap: 16 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  button: { marginTop: 8 },
});
```

## 🤝 Contributing

### Development Guidelines
1. **Platform Parity**: Ensure components work consistently across web and mobile
2. **TypeScript**: Maintain strict type safety across all components
3. **Accessibility**: Follow WCAG guidelines and platform accessibility standards
4. **Documentation**: Update README files and Storybook stories for new components
5. **Testing**: Write unit tests and visual regression tests

### Component Design Principles
1. **Consistency**: Follow established patterns for props and behavior
2. **Flexibility**: Support customization through props and theming
3. **Performance**: Optimize for both web and mobile performance characteristics
4. **Accessibility**: Include proper ARIA labels, focus management, and screen reader support
5. **Responsiveness**: Ensure components work across all screen sizes

## 📚 Related Documentation

- **[Button Component](./src/components/Button/README.md)** - Detailed button documentation
- **[Icon System](./src/components/Icon/README.md)** - Icon usage and customization
- **[Modal Component](./src/components/Modal/README.md)** - Modal/dialog patterns
- **[Web App Integration](../../apps/web/README.md)** - Using components in Next.js
- **[Mobile App Integration](../../apps/mobile/README.md)** - Using components in React Native
- **[Authentication Components](../auth/README.md)** - Auth-specific components

## 🎯 Roadmap

### Upcoming Components
- [ ] **DataTable** - Advanced table with sorting, filtering, pagination
- [ ] **Charts** - Chart components for analytics dashboards
- [ ] **Calendar** - Date picker and calendar components
- [ ] **Rich Text Editor** - WYSIWYG editor component
- [ ] **File Uploader** - Advanced file upload with progress
- [ ] **Virtualized Lists** - Performance-optimized lists for large datasets

### Platform Enhancements
- [ ] **React Native Web** - Improved web compatibility
- [ ] **Server Components** - Next.js server component support
- [ ] **Animation Library** - Unified animations across platforms
- [ ] **Advanced Theming** - Dynamic theme switching and customization
- [ ] **Design Tokens** - Export design tokens for other tools