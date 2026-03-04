"use client";

import { cn } from "@/lib/utils";
import { ModalBackdrop, ModalBox, GhostButton } from "./ConfirmModal";

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
    <ModalBackdrop>
      <ModalBox className="min-w-[320px]">
        <h2 className="font-display text-[18px] tracking-[1.5px] text-foreground mb-2">
          EXPORTING
        </h2>
        <p className="text-[12px] text-muted-foreground mb-4 min-h-[18px]">{status}</p>

        {/* Progress bar */}
        <div className="h-[4px] rounded-full bg-secondary overflow-hidden mb-5">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex gap-2 justify-center">
          {canCancel && !isComplete && onCancel && (
            <GhostButton onClick={onCancel}>Cancel</GhostButton>
          )}
          <GhostButton onClick={onClose}>
            {isComplete ? "Close" : "Close (Background)"}
          </GhostButton>
        </div>
      </ModalBox>
    </ModalBackdrop>
  );
}
