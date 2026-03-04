/**
 * editor-primitives.tsx
 *
 * Small, reusable UI atoms used exclusively inside editor tabs.
 * They represent the "design language" of the editor panel:
 *   – consistent section padding / borders
 *   – mono-spaced label pattern
 *   – controlled form elements (select, input, toggle)
 *   – colour preset dot buttons
 *
 * All styling is Tailwind-first with CSS variable fallbacks for dynamic values.
 */
"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ── Section wrapper ───────────────────────────────────────────────────────────

interface CtrlSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function CtrlSection({ children, className }: CtrlSectionProps) {
  return (
    <div className={cn("px-3.5 pt-3.5 pb-2.5 border-b border-border", className)}>
      {children}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

interface CtrlLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function CtrlLabel({ children, className }: CtrlLabelProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 mb-2",
        "font-mono text-[9px] tracking-[2px] uppercase text-muted-foreground",
        className
      )}
    >
      {children}
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

// ── Editable field wrapper ────────────────────────────────────────────────────

interface SefFieldProps {
  children: React.ReactNode;
  className?: string;
}

/** Slide Editor Field — padded section for a single input control. */
export function SefField({ children, className }: SefFieldProps) {
  return (
    <div className={cn("px-3.5 py-2.5 border-b border-border", className)}>
      {children}
    </div>
  );
}

// ── Field label (inside a SefField) ──────────────────────────────────────────

interface SefLabelProps {
  children: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}

export function SefLabel({ children, trailing, className }: SefLabelProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between mb-1.5",
        "font-mono text-[9px] tracking-[1.5px] uppercase text-muted-foreground",
        className
      )}
    >
      <span>{children}</span>
      {trailing}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────

export function CtrlSelect({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full bg-secondary border border-border rounded-[5px]",
        "text-foreground font-sans text-[12px] px-2 py-[7px]",
        "outline-none appearance-none cursor-pointer transition-colors",
        "focus:border-primary",
        className
      )}
      {...props}
    />
  );
}

// ── Text input ────────────────────────────────────────────────────────────────

export function CtrlInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-secondary border border-border rounded-[5px]",
        "text-foreground font-sans text-[12px] px-2 py-[7px]",
        "outline-none transition-colors",
        "focus:border-primary",
        className
      )}
      {...props}
    />
  );
}

// ── Title / description textarea ──────────────────────────────────────────────

interface SefInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** If true renders as a large bold title input. */
  isTitle?: boolean;
}

export function SefInput({ isTitle, className, ...props }: SefInputProps) {
  return (
    <input
      className={cn(
        "w-full bg-secondary border border-border rounded-md",
        "text-foreground font-sans outline-none transition-colors px-2.5 py-2",
        "focus:border-primary",
        isTitle ? "text-[13px] font-bold" : "text-[12px]",
        className
      )}
      {...props}
    />
  );
}

interface SefTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** If true adds orange border hint for hook-type fields. */
  isHook?: boolean;
}

export function SefTextarea({ isHook, className, ...props }: SefTextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full min-h-[72px] resize-none",
        "bg-secondary border border-border rounded-md",
        "text-foreground font-sans text-[12px] leading-[1.6]",
        "px-2.5 py-2 outline-none transition-colors",
        "focus:border-primary",
        isHook && "border-hook/30",
        className
      )}
      {...props}
    />
  );
}

// ── Toggle (styled checkbox) ──────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * CSS-only toggle switch implemented with Tailwind `peer` utilities.
 * Replaces the old `.toggle` / `.toggle-slider` CSS class pattern.
 */
export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <label className={cn("relative inline-flex cursor-pointer shrink-0", disabled && "opacity-50 cursor-not-allowed")}>
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {/* Track */}
      <div
        className={cn(
          "w-9 h-5 rounded-full border transition-all",
          "bg-surface-raised border-border-strong",
          "peer-checked:bg-primary peer-checked:border-primary"
        )}
      />
      {/* Thumb */}
      <div
        className={cn(
          "absolute top-[3px] left-[3px]",
          "w-3.5 h-3.5 rounded-full transition-transform",
          "bg-muted-foreground",
          "peer-checked:translate-x-4 peer-checked:bg-primary-foreground"
        )}
      />
    </label>
  );
}

// ── Regen button strip ────────────────────────────────────────────────────────

interface RegenBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isHook?: boolean;
}

export function RegenBtn({ isHook, className, children, ...props }: RegenBtnProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex-1 py-1.5 px-1 rounded-[5px] cursor-pointer transition-all text-center",
        "bg-secondary border border-border text-muted-foreground",
        "text-[10px] font-mono tracking-[0.3px]",
        "hover:bg-cyan-tint hover:text-primary hover:border-primary/30",
        isHook && "border-hook/30",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Alignment button group ────────────────────────────────────────────────────

type AlignValue = "left" | "center" | "right";

interface AlignButtonsProps {
  value: AlignValue;
  onChange: (v: AlignValue) => void;
}

const ALIGN_SVG: Record<AlignValue, React.ReactNode> = {
  left: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="2" rx="1"/>
      <rect x="3" y="11" width="12" height="2" rx="1"/>
      <rect x="3" y="17" width="15" height="2" rx="1"/>
    </svg>
  ),
  center: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="2" rx="1"/>
      <rect x="6" y="11" width="12" height="2" rx="1"/>
      <rect x="4.5" y="17" width="15" height="2" rx="1"/>
    </svg>
  ),
  right: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="2" rx="1"/>
      <rect x="9" y="11" width="12" height="2" rx="1"/>
      <rect x="6" y="17" width="15" height="2" rx="1"/>
    </svg>
  ),
};

export function AlignButtons({ value, onChange }: AlignButtonsProps) {
  return (
    <div className="flex gap-1">
      {(["left", "center", "right"] as AlignValue[]).map((a) => (
        <button
          key={a}
          type="button"
          title={`Align ${a}`}
          onClick={() => onChange(a)}
          className={cn(
            "flex-1 py-[7px] px-1 rounded-[4px] border cursor-pointer",
            "flex items-center justify-center transition-all",
            value === a
              ? "border-primary text-primary bg-cyan-tint"
              : "border-border bg-secondary text-muted-foreground hover:border-border-strong hover:text-foreground"
          )}
        >
          {ALIGN_SVG[a]}
        </button>
      ))}
    </div>
  );
}

// ── Colour preset dots ────────────────────────────────────────────────────────

interface ColorPresetProps {
  colors: { value: string; title: string }[];
  onSelect: (color: string) => void;
  borderStyle?: string;
}

export function ColorPresets({ colors, onSelect, borderStyle }: ColorPresetProps) {
  return (
    <div className="flex gap-1">
      {colors.map(({ value, title }) => (
        <button
          key={value}
          type="button"
          title={title}
          onClick={() => onSelect(value)}
          className="w-[18px] h-[18px] rounded-full cursor-pointer shrink-0 transition-transform hover:scale-125 border-2 border-white/15 hover:border-white/50 p-0"
          style={{ background: value, ...(borderStyle ? { borderColor: borderStyle } : {}) }}
        />
      ))}
    </div>
  );
}

// ── Font + size row ───────────────────────────────────────────────────────────

interface FontRowProps {
  fontValue: string;
  sizeValue: number;
  onFontChange: (v: string) => void;
  onSizeChange: (v: number) => void;
  minSize?: number;
  maxSize?: number;
  fontOptions: { value: string; label: string }[];
}

export function FontRow({
  fontValue,
  sizeValue,
  onFontChange,
  onSizeChange,
  minSize = 8,
  maxSize = 72,
  fontOptions,
}: FontRowProps) {
  return (
    <div className="flex gap-2 mt-2">
      <div className="flex-1">
        <label className="block font-mono text-[9px] tracking-[1px] uppercase text-muted-foreground mb-1">
          Font
        </label>
        <CtrlSelect value={fontValue} onChange={(e) => onFontChange(e.target.value)}>
          {fontOptions.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </CtrlSelect>
      </div>
      <div className="w-[72px]">
        <label className="block font-mono text-[9px] tracking-[1px] uppercase text-muted-foreground mb-1">
          Size
        </label>
        <CtrlInput
          type="number"
          min={minSize}
          max={maxSize}
          value={sizeValue}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v)) onSizeChange(v);
          }}
        />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

export function EmptyState({ icon = "◈", message }: { icon?: string; message: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-7 py-8 text-center text-muted-foreground">
      <span className="text-[32px] opacity-25">{icon}</span>
      <span className="text-[12px] leading-[1.6]">{message}</span>
    </div>
  );
}
