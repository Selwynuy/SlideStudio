"use client";

import { Slide, AspectRatio, ASPECT_RATIO_DIMENSIONS } from "@/types/slide";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CtrlSection, CtrlLabel, CtrlSelect, Toggle } from "./editor-primitives";
import { formatSlideNum } from "@/lib/utils";

interface ExportTabProps {
  slides: Slide[];
  exportJson: () => void;
  exportAll: (format: "png" | "jpg", asZip?: boolean) => void;
  exportSelected: (indices: number[], format: "png" | "jpg", asZip?: boolean) => void;
  aspectRatio?: AspectRatio;
}

export default function ExportTab({
  slides,
  exportJson,
  exportAll,
  exportSelected,
  aspectRatio = "9:16",
}: ExportTabProps) {
  const [exportFormat, setExportFormat] = useState<"png" | "jpg">("png");
  const [exportAsZip, setExportAsZip] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];

  // Sync selection when slides change
  useEffect(() => {
    setSelectedIndices(slides.map((_, i) => i));
  }, [slides]);

  const toggleIndex = (i: number) => {
    setSelectedIndices((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort((a, b) => a - b)
    );
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* ── Format settings ─────────────────────────────────────────────────── */}
      <CtrlSection>
        <CtrlLabel>Export Settings</CtrlLabel>
        <div>
          <label className="block font-mono text-[9px] tracking-[1px] uppercase text-muted-foreground mb-[5px]">
            Format
          </label>
          <CtrlSelect
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as "png" | "jpg")}
          >
            <option value="png">PNG (Lossless)</option>
            <option value="jpg">JPEG (Smaller)</option>
          </CtrlSelect>
        </div>
      </CtrlSection>

      {/* ── Image export ────────────────────────────────────────────────────── */}
      <CtrlSection>
        <CtrlLabel>Image Export</CtrlLabel>
        <p className="text-[11px] text-muted-foreground mb-2.5 leading-[1.6]">
          Exports {dims.width}×{dims.height}px {exportFormat.toUpperCase()} ({dims.label}).
        </p>

        {/* ZIP toggle */}
        <div className="flex items-center justify-between mb-2.5 py-2">
          <div>
            <div className="text-[12px] text-foreground font-medium">Export as ZIP</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Download all images in a single ZIP file
            </div>
          </div>
          <Toggle checked={exportAsZip} onChange={setExportAsZip} />
        </div>

        <button
          onClick={() => exportAll(exportFormat, exportAsZip)}
          disabled={slides.length === 0}
          className={cn(
            "w-full flex items-center justify-center px-3 py-[11px] rounded-md",
            "text-[12px] font-bold cursor-pointer transition-all",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 hover:-translate-y-px hover:shadow-[0_4px_16px_var(--cyan-glow)]",
            "active:translate-y-0",
            "disabled:opacity-35 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          )}
        >
          ↓ Export All Slides ({exportFormat.toUpperCase()})
          {exportAsZip && " as ZIP"}
        </button>
      </CtrlSection>

      {/* ── JSON export ─────────────────────────────────────────────────────── */}
      <CtrlSection>
        <CtrlLabel>JSON Export</CtrlLabel>
        <p className="text-[11px] text-muted-foreground mb-2.5 leading-[1.6]">
          Export all slides as structured JSON for backup or import.
        </p>
        <button
          onClick={exportJson}
          disabled={slides.length === 0}
          className={cn(
            "w-full flex items-center justify-center px-2.5 py-[7px] rounded-[5px]",
            "text-[11px] font-semibold cursor-pointer transition-all",
            "bg-transparent text-muted-foreground border border-border-strong",
            "hover:bg-secondary hover:text-foreground hover:border-border",
            "disabled:opacity-35 disabled:cursor-not-allowed"
          )}
        >
          {"{ }"} Download JSON
        </button>
      </CtrlSection>

      {/* ── Selective export ────────────────────────────────────────────────── */}
      <CtrlSection>
        <CtrlLabel>Selective Export</CtrlLabel>
        <p className="text-[11px] text-muted-foreground mb-2.5 leading-[1.6]">
          Pick specific slides to export.
        </p>

        {slides.length > 0 && (
          <div className="rounded-md border border-border overflow-hidden">
            {/* Selection summary */}
            <div className="flex justify-end px-2 py-1.5 border-b border-border bg-card">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                Selected {selectedIndices.length}/{slides.length}
              </span>
            </div>

            {/* Slide list */}
            <div className="max-h-[220px] overflow-y-auto">
              {slides.map((slide, i) => {
                const checked = selectedIndices.includes(i);
                return (
                  <label
                    key={slide.id}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-[7px] cursor-pointer transition-colors",
                      i < slides.length - 1 && "border-b border-border",
                      checked ? "bg-cyan-tint/40" : "bg-transparent hover:bg-secondary"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleIndex(i)}
                      className="accent-primary shrink-0"
                    />
                    <span className="font-mono text-[10px] text-muted-foreground min-w-[20px] shrink-0">
                      {formatSlideNum(i + 1)}
                    </span>
                    <span className="text-[12px] text-foreground truncate">
                      {slide.title || "(no title)"}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Confirm export */}
            <div className="px-2 py-2 border-t border-border bg-card">
              <button
                onClick={() => exportSelected(selectedIndices, exportFormat, exportAsZip)}
                disabled={selectedIndices.length === 0}
                className={cn(
                  "w-full flex items-center justify-center px-3 py-[9px] rounded-md",
                  "text-[12px] font-bold cursor-pointer transition-all",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90",
                  "disabled:opacity-35 disabled:cursor-not-allowed"
                )}
              >
                ↓ Export Selected ({selectedIndices.length})
              </button>
            </div>
          </div>
        )}
      </CtrlSection>
    </div>
  );
}
