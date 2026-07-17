import React from 'react';
import Modal from './Modal';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Подтверждение',
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  danger = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? 'btn-primary btn-danger' : 'btn-primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="modal-message">{message}</p>
    </Modal>
  );
}
