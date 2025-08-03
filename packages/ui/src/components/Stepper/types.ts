export interface StepperStep {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  optional?: boolean;
}

export interface StepperProps {
  steps: StepperStep[];
  activeStep: number;
  
  // Display options
  orientation?: 'horizontal' | 'vertical';
  showStepNumbers?: boolean;
  showConnectors?: boolean;
  
  // Styling
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'circle';
  
  // Navigation handlers
  onStepPress?: (stepIndex: number) => void;  // React Native
  onStepClick?: (stepIndex: number) => void;  // Web
  
  // Platform-specific styling
  className?: string;    // Web only
  style?: any;          // React Native only
  testID?: string;      // Cross-platform testing
  
  // Accessibility props (WCAG 2.1 AA compliant)
  accessibilityLabel?: string;     // React Native: Accessible name
  'aria-label'?: string;           // Web: Accessible name
  'aria-describedby'?: string;     // Web: References to describing elements
  
  // State options
  allowClickableSteps?: boolean;
  completedSteps?: number[];
}

export interface StepperStepComponentProps {
  step: StepperStep;
  stepIndex: number;
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
  orientation: 'horizontal' | 'vertical';
  showStepNumbers: boolean;
  showConnectors: boolean;
  onPress?: () => void;
  onClick?: () => void;
  size: 'sm' | 'md' | 'lg';
  variant: 'default' | 'minimal' | 'circle';
  allowClickable: boolean;
  style?: any;
  className?: string;
  testID?: string;
}