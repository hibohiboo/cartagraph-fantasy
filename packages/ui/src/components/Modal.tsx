import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content (typically action buttons) */
  footer?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether clicking backdrop closes modal */
  closeOnBackdrop?: boolean;
  /** Whether pressing Escape closes modal */
  closeOnEscape?: boolean;
}

// Store and restore focus when modal opens/closes
const useFocusManagement = (isOpen: boolean, modalRef: React.RefObject<HTMLDivElement | null>) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    // Store current focus
    const activeElement = document.activeElement as HTMLElement;
    previousActiveElement.current = activeElement;

    // Focus modal
    modalRef.current?.focus();

    // Restore focus on cleanup
    return () => {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, modalRef]);
};

// Handle ESC key to close modal
const useEscapeKey = (isOpen: boolean, onClose: () => void, closeOnEscape: boolean) => {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return undefined;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);
};

// Prevent body scroll when modal is open
const useBodyScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);
};

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

const ModalHeader: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
    <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
      {title}
    </h2>
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-600 transition-colors"
      aria-label="閉じる"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

const ModalContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
);

const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">{children}</div>
);

interface ModalContainerProps {
  modalRef: React.RefObject<HTMLDivElement | null>;
  size: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
}

const ModalContainer: React.FC<ModalContainerProps> = ({
  modalRef,
  size,
  title,
  children,
  footer,
  onClose,
}) => (
  <div
    ref={modalRef}
    className={`
      bg-white rounded-lg shadow-xl w-full ${SIZE_CLASSES[size]}
      max-h-[90vh] flex flex-col
      transform transition-all
    `}
    tabIndex={-1}
  >
    {title && <ModalHeader title={title} onClose={onClose} />}
    <ModalContent>{children}</ModalContent>
    {footer && <ModalFooter>{footer}</ModalFooter>}
  </div>
);

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusManagement(isOpen, modalRef);
  useEscapeKey(isOpen, onClose, closeOnEscape);
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <ModalContainer
        modalRef={modalRef}
        size={size}
        title={title}
        footer={footer}
        onClose={onClose}
      >
        {children}
      </ModalContainer>
    </div>
  );
};

export interface DialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Dialog title */
  title: string;
  /** Dialog message */
  message: React.ReactNode;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Callback when confirm is clicked */
  onConfirm?: () => void;
  /** Dialog variant */
  variant?: 'info' | 'warning' | 'danger';
}

const VARIANT_STYLES = {
  info: 'bg-blue-600 hover:bg-blue-700 text-white',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
} as const;

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  onConfirm,
  variant = 'info',
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium rounded ${VARIANT_STYLES[variant]}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      }
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
};
