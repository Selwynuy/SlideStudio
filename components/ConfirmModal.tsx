"use client";

import { cn } from "@/lib/utils";

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
    <ModalBackdrop onClickOutside={onCancel}>
      <ModalBox>
        <h2 className="font-display text-[18px] tracking-[1.5px] text-foreground mb-1">
          {title}
        </h2>
        {description && (
          <p className="text-[12px] text-muted-foreground leading-[1.6] mb-4">
            {description}
          </p>
        )}
        <div className="flex gap-2 mt-4">
          <GhostButton onClick={onCancel}>{cancelLabel}</GhostButton>
          <DangerButton onClick={onConfirm}>{confirmLabel}</DangerButton>
        </div>
      </ModalBox>
    </ModalBackdrop>
  );
}

// ── Shared modal primitives ───────────────────────────────────────────────────

export function ModalBackdrop({
  children,
  onClickOutside,
}: {
  children: React.ReactNode;
  onClickOutside?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClickOutside?.();
      }}
    >
      {children}
    </div>
  );
}

export function ModalBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl shadow-[0_8px_48px_rgba(0,0,0,0.7)]",
        "px-6 py-5 min-w-[280px] max-w-[90vw]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function GhostButton({
  children,
  onClick,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center px-3.5 py-[7px] rounded-[5px]",
        "text-[11px] font-semibold cursor-pointer transition-all",
        "bg-transparent text-muted-foreground border border-border-strong",
        "hover:bg-secondary hover:text-foreground hover:border-border",
        className
      )}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center px-3.5 py-[7px] rounded-[5px]",
        "text-[11px] font-bold cursor-pointer transition-all",
        "bg-primary text-primary-foreground",
        "hover:bg-primary/90 hover:-translate-y-px",
        "disabled:opacity-35 disabled:cursor-not-allowed disabled:translate-y-0",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  onClick,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center px-3.5 py-[7px] rounded-[5px]",
        "text-[11px] font-bold cursor-pointer transition-all",
        "bg-destructive/80 text-white border border-destructive",
        "hover:bg-destructive",
        className
      )}
    >
      {children}
    </button>
  );
}
