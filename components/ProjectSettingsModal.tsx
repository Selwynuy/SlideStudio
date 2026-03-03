"use client";

import { useState, useEffect } from "react";

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

  // Sync form when modal opens with new initialValues
  useEffect(() => {
    if (isOpen) setValues(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  const set = <K extends keyof ProjectSettingsValues>(
    key: K,
    val: ProjectSettingsValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: val }));

  return (
    <div
      className="modal-bg open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal" style={{ minWidth: "340px", maxWidth: "480px", width: "90vw" }}>
        <div className="modal-title">
          {mode === "create" ? "NEW PROJECT" : "EDIT PROJECT"}
        </div>
        <div className="modal-desc" style={{ marginBottom: "16px" }}>
          {mode === "create"
            ? "Set up your project before generating slides."
            : "Update project metadata and generation defaults."}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Title */}
          <div className="ctrl-item">
            <label style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
              Project Title
            </label>
            <input
              className="ctrl-select"
              style={{ width: "100%", padding: "6px 10px" }}
              type="text"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Untitled Slideshow"
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Tone + Complexity row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div className="ctrl-item">
              <label>Tone</label>
              <select
                className="ctrl-select"
                value={values.tone}
                onChange={(e) => set("tone", e.target.value)}
              >
                <option value="educational">Educational</option>
                <option value="conversational">Conversational</option>
                <option value="motivational">Motivational</option>
                <option value="analytical">Analytical</option>
                <option value="casual">Casual</option>
              </select>
            </div>
            <div className="ctrl-item">
              <label>Complexity</label>
              <select
                className="ctrl-select"
                value={values.complexity}
                onChange={(e) => set("complexity", e.target.value)}
              >
                <option value="simple">Simple</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Max Slides + Focus row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div className="ctrl-item">
              <label>Slides per Batch</label>
              <select
                className="ctrl-select"
                value={values.maxSlides}
                onChange={(e) => set("maxSlides", parseInt(e.target.value))}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
            <div className="ctrl-item">
              <label>Focus</label>
              <select
                className="ctrl-select"
                value={values.focus}
                onChange={(e) => set("focus", e.target.value)}
              >
                <option value="key_points">Key Points</option>
                <option value="tips">Tips &amp; Advice</option>
                <option value="facts">Facts &amp; Stats</option>
                <option value="steps">Steps / How-To</option>
                <option value="terms">Terms &amp; Defs</option>
              </select>
            </div>
          </div>

          {/* Hook toggle */}
          <div className="toggle-row" style={{ padding: "4px 0" }}>
            <div>
              <div className="toggle-label">Hook Slide</div>
              <div className="toggle-sub">Auto-generate attention-grabbing opener</div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={values.hook}
                onChange={(e) => set("hook", e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-cyan btn-sm" style={{ flex: 1, justifyContent: "center" }}>
              {mode === "create" ? "Create Project" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
