/**
 * VAS-DJ SaaS Animation System
 *
 * Provides reusable animation presets for Framer Motion.
 * These variants create consistent, polished micro-interactions.
 */

import type { Variants, Transition } from "framer-motion";

// =============================================================================
// SPRING CONFIGS (Physics-based animations)
// =============================================================================

export const springConfig = {
  gentle: { type: "spring", stiffness: 120, damping: 14 },
  snappy: { type: "spring", stiffness: 300, damping: 20 },
  bouncy: { type: "spring", stiffness: 400, damping: 10 },
  stiff: { type: "spring", stiffness: 500, damping: 25 },
} as const;

export const easingConfig = {
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: [0.175, 0.885, 0.32, 1.275],
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;

// =============================================================================
// FADE VARIANTS
// =============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: easingConfig.easeOut }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: easingConfig.easeIn }
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easingConfig.easeOut }
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.2, ease: easingConfig.easeIn }
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easingConfig.easeOut }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: easingConfig.easeIn }
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: easingConfig.easeOut }
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.2, ease: easingConfig.easeIn }
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: easingConfig.easeOut }
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: { duration: 0.2, ease: easingConfig.easeIn }
  },
};

// =============================================================================
// SCALE VARIANTS
// =============================================================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfig.snappy
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15, ease: easingConfig.easeIn }
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfig.bouncy
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.15, ease: easingConfig.easeIn }
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfig.bouncy
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.1, ease: easingConfig.easeIn }
  },
};

// =============================================================================
// SLIDE VARIANTS
// =============================================================================

export const slideUp: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: springConfig.snappy
  },
  exit: {
    y: "100%",
    transition: { duration: 0.2, ease: easingConfig.easeIn }
  },
};

export const slideDown: Variants = {
  hidden: { y: "-100%" },
  visible: {
    y: 0,
    transition: springConfig.snappy
  },
  exit: {
    y: "-100%",
    transition: { duration: 0.2, ease: easingConfig.easeIn }
  },
};

export const slideLeft: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: springConfig.snappy
  },
  exit: {
    x: "100%",
    transition: { duration: 0.2, ease: easingConfig.easeIn }
  },
};

export const slideRight: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: springConfig.snappy
  },
  exit: {
    x: "-100%",
    transition: { duration: 0.2, ease: easingConfig.easeIn }
  },
};

// =============================================================================
// STAGGER VARIANTS (for lists and grids)
// =============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easingConfig.easeOut }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: easingConfig.easeIn }
  },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfig.gentle
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15, ease: easingConfig.easeIn }
  },
};

// =============================================================================
// MODAL & OVERLAY VARIANTS
// =============================================================================

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: easingConfig.easeOut }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: easingConfig.easeIn }
  },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springConfig.snappy
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15, ease: easingConfig.easeIn }
  },
};

export const drawerLeft: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: springConfig.snappy
  },
  exit: {
    x: "-100%",
    transition: { duration: 0.2, ease: easingConfig.easeIn }
  },
};

export const drawerRight: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: springConfig.snappy
  },
  exit: {
    x: "100%",
    transition: { duration: 0.2, ease: easingConfig.easeIn }
  },
};

export const bottomSheet: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: springConfig.snappy
  },
  exit: {
    y: "100%",
    transition: { duration: 0.2, ease: easingConfig.easeIn }
  },
};

// =============================================================================
// TOAST VARIANTS
// =============================================================================

export const toastSlideIn: Variants = {
  hidden: { opacity: 0, x: 100, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springConfig.bouncy
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: { duration: 0.2, ease: easingConfig.easeIn }
  },
};

export const toastSlideUp: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springConfig.bouncy
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.9,
    transition: { duration: 0.2, ease: easingConfig.easeIn }
  },
};

// =============================================================================
// BUTTON & INTERACTIVE VARIANTS
// =============================================================================

export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

export const buttonHover = {
  scale: 1.02,
  transition: springConfig.gentle,
};

export const cardHover: Variants = {
  rest: {
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)"
  },
  hover: {
    y: -4,
    boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
    transition: springConfig.gentle
  },
};

// =============================================================================
// LOADING VARIANTS
// =============================================================================

export const shimmer: Variants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 1.5,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

export const pulse: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

// =============================================================================
// COLLAPSE VARIANTS
// =============================================================================

export const collapse: Variants = {
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: easingConfig.easeOut },
      opacity: { duration: 0.2, delay: 0.1 }
    }
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: easingConfig.easeIn },
      opacity: { duration: 0.1 }
    }
  },
};

// =============================================================================
// UTILITY: Create transition with custom duration
// =============================================================================

export function createTransition(
  duration: number = 0.25,
  ease: keyof typeof easingConfig = "easeOut"
): Transition {
  return {
    duration,
    ease: easingConfig[ease],
  };
}

// =============================================================================
// UTILITY: Create stagger config
// =============================================================================

export function createStaggerConfig(
  staggerChildren: number = 0.1,
  delayChildren: number = 0
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
}
