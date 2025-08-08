import React from 'react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: any;
}

export interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export interface AuthFooterProps {
  children?: React.ReactNode;
}