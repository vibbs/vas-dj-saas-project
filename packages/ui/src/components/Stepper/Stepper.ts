// Platform-aware Stepper export
// Automatically selects the correct implementation based on platform

import { createPlatformComponent } from '../../utils/platform';

// Import both implementations
import { Stepper as WebStepper } from './Stepper.web';
import { Stepper as NativeStepper } from './Stepper.native';

// Export the platform-aware Stepper component
export const Stepper = createPlatformComponent(
  NativeStepper,
  WebStepper
);

// Re-export types
export type { StepperProps, StepperStep, StepperStepComponentProps } from './types';