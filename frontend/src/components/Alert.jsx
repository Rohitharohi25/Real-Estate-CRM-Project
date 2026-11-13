import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

const variants = {
  success: { wrap: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900', Icon: FiCheckCircle },
  error: { wrap: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900', Icon: FiAlertCircle },
  info: { wrap: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900', Icon: FiInfo },
};

const Alert = ({ type = 'info', children, onClose }) => {
  const { wrap, Icon } = variants[type] || variants.info;
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${wrap}`}>
      <Icon className="mt-0.5 shrink-0" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss">
          <FiX />
        </button>
      )}
    </div>
  );
};

export default Alert;
