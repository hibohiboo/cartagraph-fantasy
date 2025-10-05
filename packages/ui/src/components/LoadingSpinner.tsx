import React from 'react';

export interface LoadingSpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional loading message */
  message?: string;
  /** Whether to show as fullscreen overlay */
  fullscreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  fullscreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`
          ${sizeClasses[size]}
          border-blue-600 border-t-transparent
          rounded-full animate-spin
        `}
        role="status"
        aria-label="読み込み中"
      />
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export interface ErrorMessageProps {
  /** Error title */
  title?: string;
  /** Error message */
  message: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** Variant */
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'エラー',
  message,
  onRetry,
  onDismiss,
  variant = 'error',
}) => {
  const variantStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '❌',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠️',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ️',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-lg p-4`}
      role="alert"
    >
      <div className="flex gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">
          {styles.icon}
        </span>
        <div className="flex-1">
          <h3 className={`font-semibold ${styles.text} mb-1`}>{title}</h3>
          <p className={`text-sm ${styles.text}`}>{message}</p>
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3 py-1 text-sm font-medium bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  再試行
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  閉じる
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export interface EmptyStateProps {
  /** Icon or illustration */
  icon?: React.ReactNode;
  /** Title */
  title: string;
  /** Description */
  description?: string;
  /** Call-to-action button */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="text-6xl mb-4" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-4 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
