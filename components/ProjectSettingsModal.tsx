"use client";

import { useState, useEffect } from "react";
import { ModalBackdrop, ModalBox, GhostButton, PrimaryButton } from "./ConfirmModal";
import { CtrlSection, CtrlSelect, Toggle } from "./editor-primitives";
import { cn } from "@/lib/utils";

export interface ProjectSettingsValues {
  title: string;
  tone: string;
  complexity: string;
  maxSlides: number;
  focus: string;
  hook: boolean;
}

interface ProjectSettingsModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialValues: ProjectSettingsValues;
  onSubmit: (values: ProjectSettingsValues) => void;
  onCancel: () => void;
}

export default function ProjectSettingsModal({
  isOpen,
  mode,
  initialValues,
  onSubmit,
  onCancel,
}: ProjectSettingsModalProps) {
  const [values, setValues] = useState<ProjectSettingsValues>(initialValues);

  // Sync form when modal opens
  useEffect(() => {
    if (isOpen) setValues(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const set = <K extends keyof ProjectSettingsValues>(key: K, val: ProjectSettingsValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <ModalBackdrop onClickOutside={onCancel}>
      <ModalBox className="min-w-[340px] max-w-[480px] w-[90vw]">
        <h2 className="font-display text-[18px] tracking-[1.5px] text-foreground mb-1">
          {mode === "create" ? "NEW PROJECT" : "EDIT PROJECT"}
        </h2>
        <p className="text-[12px] text-muted-foreground mb-4">
          {mode === "create"
            ? "Set up your project before generating slides."
            : "Update project metadata and generation defaults."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Title */}
          <div>
            <label className="block text-[11px] text-muted-foreground mb-1">
              Project Title
            </label>
            <input
              type="text"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Untitled Slideshow"
              maxLength={100}
              autoFocus
              className={cn(
                "w-full bg-secondary border border-border rounded-md",
                "text-foreground font-sans text-[13px] px-2.5 py-2",
                "outline-none transition-colors focus:border-primary"
              )}
            />
          </div>

          {/* Tone + Complexity */}
          <div className="grid grid-cols-2 gap-2">
            <SettingsField label="Tone">
              <CtrlSelect value={values.tone} onChange={(e) => set("tone", e.target.value)}>
                <option value="educational">Educational</option>
                <option value="conversational">Conversational</option>
                <option value="motivational">Motivational</option>
                <option value="analytical">Analytical</option>
                <option value="casual">Casual</option>
              </CtrlSelect>
            </SettingsField>
            <SettingsField label="Complexity">
              <CtrlSelect value={values.complexity} onChange={(e) => set("complexity", e.target.value)}>
                <option value="simple">Simple</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </CtrlSelect>
            </SettingsField>
          </div>

          {/* Slides per Batch + Focus */}
          <div className="grid grid-cols-2 gap-2">
            <SettingsField label="Slides per Batch">
              <CtrlSelect
                value={values.maxSlides}
                onChange={(e) => set("maxSlides", parseInt(e.target.value))}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </CtrlSelect>
            </SettingsField>
            <SettingsField label="Focus">
              <CtrlSelect value={values.focus} onChange={(e) => set("focus", e.target.value)}>
                <option value="key_points">Key Points</option>
                <option value="tips">Tips &amp; Advice</option>
                <option value="facts">Facts &amp; Stats</option>
                <option value="steps">Steps / How-To</option>
                <option value="terms">Terms &amp; Defs</option>
              </CtrlSelect>
            </SettingsField>
          </div>

          {/* Hook toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-[12px] text-foreground font-medium">Hook Slide</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Auto-generate attention-grabbing opener
              </div>
            </div>
            <Toggle checked={values.hook} onChange={(v) => set("hook", v)} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-1">
            <GhostButton type="button" onClick={onCancel}>Cancel</GhostButton>
            <PrimaryButton type="submit" className="flex-1 justify-center">
              {mode === "create" ? "Create Project" : "Save Changes"}
            </PrimaryButton>
          </div>
        </form>
      </ModalBox>
    </ModalBackdrop>
  );
}

// ── Local helper ──────────────────────────────────────────────────────────────

function SettingsField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}
