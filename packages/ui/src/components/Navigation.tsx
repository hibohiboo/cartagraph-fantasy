import React from 'react';

export interface NavigationItem {
  /** Navigation item label */
  label: string;
  /** Navigation item path or href */
  href: string;
  /** Whether the item is currently active */
  active?: boolean;
  /** Optional icon component */
  icon?: React.ReactNode;
  /** Optional badge content */
  badge?: string | number;
}

export interface NavigationProps {
  /** Navigation items */
  items: NavigationItem[];
  /** Callback when navigation item is clicked */
  onNavigate?: (href: string) => void;
  /** Orientation of navigation */
  orientation?: 'horizontal' | 'vertical';
  /** Visual variant */
  variant?: 'default' | 'pills' | 'underline';
}

export const Navigation: React.FC<NavigationProps> = ({
  items,
  onNavigate,
  orientation = 'horizontal',
  variant = 'default',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  const baseItemClasses = 'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors';

  const variantClasses = {
    default: {
      base: 'rounded hover:bg-gray-100',
      active: 'bg-blue-100 text-blue-700',
      inactive: 'text-gray-700',
    },
    pills: {
      base: 'rounded-full hover:bg-gray-100',
      active: 'bg-blue-600 text-white hover:bg-blue-700',
      inactive: 'text-gray-700',
    },
    underline: {
      base: 'border-b-2 border-transparent hover:border-gray-300',
      active: 'border-blue-600 text-blue-700',
      inactive: 'text-gray-700',
    },
  };

  const containerClasses = orientation === 'horizontal'
    ? 'flex flex-wrap gap-1'
    : 'flex flex-col space-y-1';

  return (
    <nav role="navigation" aria-label="メインナビゲーション">
      <ul className={containerClasses}>
        {items.map((item, index) => {
          const isActive = item.active ?? false;
          const classes = `
            ${baseItemClasses}
            ${variantClasses[variant].base}
            ${isActive ? variantClasses[variant].active : variantClasses[variant].inactive}
          `.trim();

          return (
            <li key={index}>
              <a
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className={classes}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon && <span aria-hidden="true">{item.icon}</span>}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`
                      ml-auto px-2 py-0.5 text-xs font-semibold rounded-full
                      ${isActive ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700'}
                    `}
                    aria-label={`${item.badge}件`}
                  >
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
