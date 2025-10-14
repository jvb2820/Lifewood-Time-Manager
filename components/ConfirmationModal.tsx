import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  intent?: 'confirmation' | 'destructive';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Yes',
  cancelText = 'No',
  isLoading = false,
  intent = 'confirmation',
}) => {
  if (!isOpen) return null;

  const isDestructive = intent === 'destructive';

  const icon = isDestructive ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  
  const iconBgClass = isDestructive ? 'bg-destructive-bg' : 'bg-icon-bg';
  const confirmButtonClasses = isDestructive
    ? 'bg-destructive hover:bg-destructive-hover focus:ring-destructive'
    : 'bg-primary hover:bg-primary-hover focus:ring-primary';


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" aria-hidden="true" onClick={onClose}></div>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
      >
        <div className="relative bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl text-center transform transition-all animate-fade-in-scale">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${iconBgClass} mb-4`}>
            {icon}
          </div>

          <h2 id="confirmation-modal-title" className="text-2xl font-bold text-text-primary">
            {title}
          </h2>
          <p className="mt-2 text-text-secondary">
            {message}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row-reverse justify-center gap-4">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent px-8 py-3 text-base font-bold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 ${confirmButtonClasses}`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                confirmText
              )}
            </button>
             <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-border-color px-8 py-3 text-base font-bold text-text-secondary shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;