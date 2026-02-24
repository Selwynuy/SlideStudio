"use client";

import { Slide } from "@/types/slide";
import React, { useState } from "react";

interface ExportTabProps {
  slides: Slide[];
  exportJson: () => void;
  exportAll: (format: 'png' | 'jpg', branding: boolean) => void; // Update to include options
}

export default function ExportTab({ slides, exportJson, exportAll }: ExportTabProps) {
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
  const [brandingEnabled, setBrandingEnabled] = useState(false);

  const handleExportAll = () => {
    exportAll(exportFormat, brandingEnabled);
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
          <div className="toggle-row">
            <div>
              <div className="toggle-label" style={{ fontSize: "12px" }}>
                Branding Watermark
              </div>
              <div className="toggle-sub">Add subtle SlideStudio mark</div>
            </div>
            <label className="toggle">
              <input 
                type="checkbox" 
                id="brandingToggle"
                checked={brandingEnabled}
                onChange={(e) => setBrandingEnabled(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
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
          Download structured slide data for use in other tools or pipelines.
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
          Exports 1080×1920px PNG images. Each slide rendered with its own
          background, alignment, and overlay settings.
        </div>
        <button
          className="btn btn-cyan"
          onClick={handleExportAll}
          disabled={slides.length === 0}
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "11px",
          }}
        >
          ↓ Export All Images ({exportFormat.toUpperCase()})
          {brandingEnabled && " with Branding"}
        </button>
      </div>
    </div>
  );
}