import React, { useState, useEffect } from 'react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  isLoading?: boolean;
}

const NOTE_MAX_LENGTH = 115;

const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    // Reset note when modal opens
    if (isOpen) {
      setNote('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(note);
  };

  const charsLeft = NOTE_MAX_LENGTH - note.length;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" aria-hidden="true" onClick={onClose}></div>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-modal-title"
      >
        <div className="relative bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl text-center transform transition-all animate-fade-in-scale">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-icon-bg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>

          <h2 id="note-modal-title" className="text-2xl font-bold text-text-primary">
            Clock Out
          </h2>
          <p className="mt-2 text-text-secondary">
            Please provide a short summary of your work for this session.
          </p>

          <div className="mt-6 text-left">
            <label htmlFor="session-note" className="block text-sm font-medium text-text-secondary mb-1">
              Session Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              id="session-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={NOTE_MAX_LENGTH}
              className="w-full px-4 py-3 bg-input-bg border border-border-color rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="What did you work on?"
            />
            <p className={`text-xs text-right mt-1 ${charsLeft < 20 ? 'text-red-600' : 'text-text-secondary'}`}>
              {charsLeft} characters remaining
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row-reverse justify-center gap-4">
            <button
              onClick={handleConfirm}
              disabled={isLoading || !note.trim()}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-primary px-8 py-3 text-base font-bold text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Confirm & Clock Out'
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-border-color px-8 py-3 text-base font-bold text-text-secondary shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoteModal;