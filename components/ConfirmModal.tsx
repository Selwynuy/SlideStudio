"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-bg open">
      <div className="modal">
        <div className="modal-title">{title}</div>
        {description && <div className="modal-desc">{description}</div>}
        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

