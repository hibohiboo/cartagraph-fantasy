// Card Component
import React from 'react';

export interface CardProps {
  /** Card title */
  title?: string;
  /** Card content */
  children: React.ReactNode;
  /** Card variant */
  variant?: 'default' | 'bordered' | 'elevated';
  /** Click handler */
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  variant = 'default',
  onClick,
}) => {
  const baseStyles = 'rounded-lg p-4';

  const variantStyles = {
    default: 'bg-white',
    bordered: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg',
  };

  const interactiveStyles = onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '';

  const className = [
    baseStyles,
    variantStyles[variant],
    interactiveStyles,
  ].filter(Boolean).join(' ');

  return (
    <div className={className} onClick={onClick}>
      {title && (
        <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      )}
      <div className="text-gray-700">{children}</div>
    </div>
  );
};