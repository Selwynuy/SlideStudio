"use client";

import { Slide, AspectRatio, ASPECT_RATIO_DIMENSIONS } from "@/types/slide";
import React, { useEffect, useState } from "react";

interface ExportTabProps {
  slides: Slide[];
  exportJson: () => void;
  exportAll: (format: 'png' | 'jpg', asZip?: boolean) => void;
  exportSelected: (indices: number[], format: 'png' | 'jpg', asZip?: boolean) => void;
  aspectRatio?: AspectRatio;
}

export default function ExportTab({ slides, exportJson, exportAll, exportSelected, aspectRatio = "9:16" }: ExportTabProps) {
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
  const [exportAsZip, setExportAsZip] = useState(false);
  
  const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];

  // Selective export state
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // By default, keep all slides selected; reset whenever slides change
  useEffect(() => {
    setSelectedIndices(slides.map((_, i) => i));
  }, [slides]);

  const toggleIndex = (i: number) => {
    setSelectedIndices((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort((a, b) => a - b)
    );
  };

  const handleExportAll = () => {
    exportAll(exportFormat, exportAsZip);
  };

  const handleExportSelected = () => {
    exportSelected(selectedIndices, exportFormat, exportAsZip);
  };

  return (
    <div className="tab-pane active" id="tab-export">
      <div className="ctrl-section">
        <div className="ctrl-label">
          Export Settings <span></span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div className="ctrl-item">
            <label>Format</label>
            <select
              className="ctrl-select"
              id="exportFormat"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'png' | 'jpg')}
            >
              <option value="png">PNG (Lossless)</option>
              <option value="jpg">JPEG (Smaller)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="ctrl-section">
        <div className="ctrl-label">
          Image Export <span></span>
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            marginBottom: "10px",
            lineHeight: 1.6,
          }}
        >
          Exports {dims.width}×{dims.height}px {exportFormat.toUpperCase()} images ({dims.label}) using the settings above.
        </div>
        <div className="toggle-row" style={{ marginBottom: "10px" }}>
          <div>
            <div className="toggle-label" style={{ fontSize: "12px" }}>
              Export as ZIP
            </div>
            <div className="toggle-sub">Download all images in a single ZIP file</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={exportAsZip}
              onChange={(e) => setExportAsZip(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <button
          className="btn btn-cyan"
          onClick={handleExportAll}
          disabled={slides.length === 0}
          style={{ width: "100%", justifyContent: "center", padding: "11px" }}
        >
          ↓ Export All Slides ({exportFormat.toUpperCase()})
          {exportAsZip && " as ZIP"}
        </button>
      </div>

      <div className="ctrl-section">
        <div className="ctrl-label">
          JSON Export <span></span>
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            marginBottom: "10px",
            lineHeight: 1.6,
          }}
        >
          Export all slides as structured JSON.
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={exportJson}
          disabled={slides.length === 0}
          style={{ width: "100%", justifyContent: "center" }}
        >
          {"{ } Download JSON"}
        </button>
      </div>

      <div className="ctrl-section">
        <div className="ctrl-label">
          Selective Export <span></span>
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            marginBottom: "10px",
            lineHeight: 1.6,
          }}
        >
          Pick specific slides to export.
        </div>

        {slides.length > 0 && (
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            {/* Selection summary */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "6px 8px",
                borderBottom: "1px solid var(--border)",
                background: "var(--bg-panel)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                Selected {selectedIndices.length}/{slides.length}
              </span>
            </div>

            {/* Slide list */}
            <div style={{ maxHeight: "220px", overflowY: "auto" }}>
              {slides.map((slide, i) => {
                const checked = selectedIndices.includes(i);
                return (
                  <label
                    key={slide.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "7px 10px",
                      cursor: "pointer",
                      borderBottom: i < slides.length - 1 ? "1px solid var(--border)" : "none",
                      background: checked ? "var(--bg-hover)" : "transparent",
                      transition: "background 0.1s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleIndex(i)}
                      style={{ accentColor: "var(--cyan)", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--text-muted)",
                        minWidth: "20px",
                        flexShrink: 0,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {slide.title || "(no title)"}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Confirm export */}
            <div style={{ padding: "8px", borderTop: "1px solid var(--border)", background: "var(--bg-panel)" }}>
              <button
                className="btn btn-cyan"
                onClick={handleExportSelected}
                disabled={selectedIndices.length === 0}
                style={{ width: "100%", justifyContent: "center", padding: "9px" }}
              >
                ↓ Export Selected ({selectedIndices.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
