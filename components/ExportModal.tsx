"use client";

interface ExportModalProps {
  isOpen: boolean;
  progress: number;
  status: string;
  onClose: () => void;
  onCancel?: () => void;
  canCancel?: boolean;
}

export default function ExportModal({
  isOpen,
  progress,
  status,
  onClose,
  onCancel,
  canCancel = false,
}: ExportModalProps) {
  if (!isOpen) return null;

  const isComplete = progress >= 100;

  return (
    <div className="modal-bg open">
      <div className="modal">
        <div className="modal-title">EXPORTING</div>
        <div className="modal-desc" id="exportStatus">
          {status}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          {canCancel && !isComplete && onCancel && (
            <button className="btn btn-ghost btn-sm" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            {isComplete ? "Close" : "Close (Background)"}
          </button>
        </div>
      </div>
    </div>
  );
}
