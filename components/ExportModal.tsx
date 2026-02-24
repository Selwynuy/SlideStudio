"use client";

interface ExportModalProps {
  isOpen: boolean;
  progress: number;
  status: string;
  onClose: () => void;
}

export default function ExportModal({
  isOpen,
  progress,
  status,
  onClose,
}: ExportModalProps) {
  if (!isOpen) return null;

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
        <button className="btn btn-ghost btn-sm" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
