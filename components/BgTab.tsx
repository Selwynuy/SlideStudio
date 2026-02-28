"use client";

import { Slide } from "@/types/slide";
import React from "react";

import { BG_PRESETS } from "@/lib/presets";

interface BgTabProps {
  slide: Slide | null;
  updateSlide: (updated: Slide) => void;
  applyBgToAll: () => void;
  bgStyleMasterId: string | null;
  setBgStyleMasterId: (id: string | null) => void;
}

export default function BgTab({
  slide,
  updateSlide,
  applyBgToAll,
  bgStyleMasterId,
  setBgStyleMasterId,
}: BgTabProps) {
    if (!slide) {
        return (
            <div id="bgEditorEmpty" className="empty-right">
                <div className="empty-icon">◈</div>
                <div className="empty-msg">Select a slide to customize its background.</div>
            </div>
        );
    }

    const handleChange = (field: keyof Slide, value: any) => {
        updateSlide({ ...slide, [field]: value });
    };

    const isBgMaster = bgStyleMasterId === slide.id;

    const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const updatedSlide = { ...slide, bgImage: ev.target?.result as string | null, bgPresetIdx: -1 } as Slide;
                updateSlide(updatedSlide);
            };
            reader.readAsDataURL(file);
        }
    };

    const setBgPreset = (presetIdx: number) => {
        const updatedSlide = { ...slide, bgPresetIdx: presetIdx, bgImage: null };
        updateSlide(updatedSlide);
    }


    return (
        <div id="bgEditorContent" style={{ display: "flex", flexDirection: "column" }}>
            <div className="ctrl-section">
                <div className="ctrl-label">Preset Themes <span></span></div>
                <div className="bg-presets">
                    {BG_PRESETS.map((p, i) => (
                        <div
                            key={p.name}
                            className={`bg-preset ${slide.bgPresetIdx === i ? 'active' : ''}`}
                            style={{ background: p.css }}
                            onClick={() => setBgPreset(i)}
                        >
                            <div className="bg-preset-label">{p.name}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="ctrl-section">
                <div className="ctrl-label">Upload Image <span></span></div>
                <label className="upload-zone" id="uploadZone">
                    <div className="upload-zone-text" id="uploadZoneText">
                        {slide.bgImage ? '✓ Custom image loaded' : 'Click to upload image background'}
                    </div>
                    <input type="file" accept="image/*" id="bgUploadInput" onChange={handleBgUpload} />
                </label>
                {slide.bgImage && (
                    <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Image Opacity</label>
                            <span style={{fontFamily:'"JetBrains Mono",monospace',fontSize:'10px',color:'var(--text-muted)'}}>{slide.imageOpacity ?? 100}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={slide.imageOpacity ?? 100} 
                            onInput={e => handleChange('imageOpacity', parseInt(e.currentTarget.value))} 
                            style={{width:'100%'}}
                        />
                    </div>
                )}
            </div>
            <div className="ctrl-section">
                <div className="ctrl-label">Overlay (Readability) <span></span></div>
                <div className="overlay-controls">
                    <div className="overlay-row">
                        <label>Overlay Color</label>
                        <input type="color" value={slide.overlayColor} onInput={e => handleChange('overlayColor', e.currentTarget.value)} />
                    </div>
                    <div className="overlay-row">
                        <label>Opacity</label>
                        <span style={{fontFamily:'"JetBrains Mono",monospace',fontSize:'10px',color:'var(--text-muted)'}}>{slide.overlayOpacity}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={slide.overlayOpacity} onInput={e => handleChange('overlayOpacity', parseInt(e.currentTarget.value))} style={{width:'100%'}}/>
                </div>
            </div>
            <div className="ctrl-section">
                <div className="ctrl-label">Accent Color <span></span></div>
                <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'10px',opacity: slide.dividerEnabled ?? true ? 1 : 0.4}}>
                        <input
                          type="color"
                          value={slide.accentColor}
                          onInput={e => handleChange('accentColor', e.currentTarget.value)}
                          disabled={slide.dividerEnabled === false}
                        />
                        <span style={{fontSize:'11px',color:'var(--text-muted)'}}>Divider line color</span>
                    </div>
                    <label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'11px',color:'var(--text-muted)',cursor:'pointer'}}>
                      <input
                        type="checkbox"
                        checked={slide.dividerEnabled ?? true}
                        onChange={e => handleChange('dividerEnabled', e.target.checked)}
                      />
                      <span>Show divider line</span>
                    </label>
                </div>
            </div>
            <div className="ctrl-section">
              <button
                className="regen-btn"
                onClick={applyBgToAll}
                title="Apply this background to all slides"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Apply background to all
              </button>
            </div>
            <div className="ctrl-section">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={isBgMaster}
                  onChange={(e) =>
                    setBgStyleMasterId(e.target.checked ? slide.id : null)
                  }
                />
                <span>Always apply this background</span>
              </label>
            </div>
        </div>
    );
}