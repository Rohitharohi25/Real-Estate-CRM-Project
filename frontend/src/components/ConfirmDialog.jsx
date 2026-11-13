import Modal from './Modal';

// Reusable "are you sure" confirmation, used before destructive actions (delete).
const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Are you sure?', message, loading }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <button className="btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </>
    }
  >
    <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
  </Modal>
);

export default ConfirmDialog;
