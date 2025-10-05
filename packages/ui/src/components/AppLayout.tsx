import React from 'react';

export interface AppLayoutProps {
  /** Header content */
  header?: React.ReactNode;
  /** Sidebar content */
  sidebar?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Whether sidebar is collapsed on mobile */
  sidebarCollapsed?: boolean;
  /** Callback when sidebar toggle is clicked */
  onSidebarToggle?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  header,
  sidebar,
  children,
  footer,
  sidebarCollapsed = false,
  onSidebarToggle,
}) => (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      {header && (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-3">{header}</div>
        </header>
      )}

      {/* Main container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Mobile sidebar overlay */}
            {!sidebarCollapsed && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                onClick={onSidebarToggle}
                aria-hidden="true"
              />
            )}

            {/* Sidebar panel */}
            <aside
              className={`
                fixed lg:static inset-y-0 left-0 z-30
                w-64 bg-white border-r border-gray-200
                transform transition-transform duration-200 ease-in-out
                ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
              `}
              aria-label="サイドバー"
            >
              <div className="h-full overflow-y-auto p-4">{sidebar}</div>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto" role="main">
          <div className="container mx-auto px-4 py-6 max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="px-4 py-3">{footer}</div>
        </footer>
      )}
    </div>
  );
