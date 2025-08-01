import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'small' | 'medium' | 'large';
  hover?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  padding = 'medium',
  hover = false 
}: CardProps) {
  const baseStyles = `
    bg-white rounded-lg border border-gray-200 shadow-sm
    ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
  `;

  const paddingStyles = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const combinedClassName = `
    ${baseStyles}
    ${paddingStyles[padding]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
}