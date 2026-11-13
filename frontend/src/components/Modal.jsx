import { FiX } from 'react-icons/fi';

const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  if (!open) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative z-10 max-h-[100dvh] w-full ${sizes[size]} rounded-t-2xl bg-white shadow-xl sm:rounded-xl dark:bg-slate-900`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="max-h-[calc(100dvh-9rem)] overflow-y-auto px-4 py-4 sm:max-h-[70vh] sm:px-5">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-4 py-4 sm:flex-row sm:justify-end sm:px-5 [&>button]:w-full sm:[&>button]:w-auto dark:border-slate-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
