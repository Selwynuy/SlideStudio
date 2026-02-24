"use client";

import { Slide } from "@/types/slide";
import React from "react";

interface SlideTabProps {
  slide: Slide | null;
  updateSlide: (updated: Slide) => void;
  regenField: (field: "title" | "description" | "both") => Promise<void>;
}

export default function SlideTab({ slide, updateSlide, regenField }: SlideTabProps) {
  if (!slide) {
    return (
      <div id="slideEditorEmpty" className="empty-right">
        <div className="empty-icon">◈</div>
        <div className="empty-msg">
          Select a slide from the left panel to edit its content.
        </div>
      </div>
    );
  }

  // A helper function to handle updates
  const handleChange = (field: keyof Slide, value: any) => {
    updateSlide({ ...slide, [field]: value });
  };

  return (
    <div id="slideEditorContent" style={{ display: "flex", flexDirection: "column" }}>
      <div className="slide-editor-field">
        <div className="sef-label">
          <span>Slide Type</span>
        </div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
          <button
            className={`btn btn-sm ${
              slide.type === "normal" ? "btn-cyan" : "btn-ghost"
            }`}
            onClick={() => handleChange("type", "normal")}
            style={{ flex: 1, justifyContent: "center" }}
          >
            Normal
          </button>
          <button
            className={`btn btn-sm ${
              slide.type === "hook" ? "btn-hook" : "btn-ghost"
            }`}
            onClick={() => handleChange("type", "hook")}
            style={{ flex: 1, justifyContent: "center" }}
          >
            Hook Opener
          </button>
        </div>
        {slide.type === 'hook' && (
            <div id="hookExplainer" style={{background:'rgba(255,107,53,0.07)', border:'1px solid rgba(255,107,53,0.2)', borderRadius:'5px', padding:'8px 10px', fontSize:'10px', color:'rgba(255,160,110,0.9)', lineHeight:1.5}}>
                <strong style={{color:'var(--hook-color)'}}>Hook Slide</strong> — the first slide viewers see. Designed to stop scrolling with a bold question, stat, or claim. Gets larger text, a "STOP SCROLLING" eyebrow, and no description — just the pure hook line.
            </div>
        )}
      </div>
      <div className="slide-editor-field">
        <div className="sef-label">
          <span>Text Alignment</span>
        </div>
        <div className="align-btns">
          <button className={`align-btn ${slide.align === 'left' ? 'active' : ''}`} onClick={() => handleChange('align', 'left')} title="Align Left">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="2" rx="1"/><rect x="3" y="11" width="12" height="2" rx="1"/><rect x="3" y="17" width="15" height="2" rx="1"/></svg>
          </button>
          <button className={`align-btn ${slide.align === 'center' ? 'active' : ''}`} onClick={() => handleChange('align', 'center')} title="Align Center">
             <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="2" rx="1"/><rect x="6" y="11" width="12" height="2" rx="1"/><rect x="4.5" y="17" width="15" height="2" rx="1"/></svg>
          </button>
          <button className={`align-btn ${slide.align === 'right' ? 'active' : ''}`} onClick={() => handleChange('align', 'right')} title="Align Right">
             <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="2" rx="1"/><rect x="9" y="11" width="12" height="2" rx="1"/><rect x="6" y="17" width="15" height="2" rx="1"/></svg>
          </button>
        </div>
      </div>
      <div className="slide-editor-field">
          <div className="sef-label">Title <span style={{fontSize:'9px',color:'var(--text-dim)'}}>{slide.title.length}/80</span></div>
          <input className="sef-input" value={slide.title} maxLength={80} onChange={e => handleChange('title', e.target.value)} placeholder="Punchy title (max 6 words)…" />
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'8px'}}>
            <label style={{fontFamily:'"JetBrains Mono",monospace',fontSize:'9px',letterSpacing:'1px',textTransform:'uppercase',color:'var(--text-muted)'}}>Color</label>
            <input type="color" value={slide.titleColor} onChange={e => handleChange('titleColor', e.target.value)} title="Title text color"/>
            <div style={{display:'flex',gap:'4px'}}>
              <button className="color-preset-btn" style={{background:'#ffffff'}} onClick={() => handleChange('titleColor', '#ffffff')} title="White"></button>
              <button className="color-preset-btn" style={{background:'#000000',borderColor:'#555'}} onClick={() => handleChange('titleColor', '#000000')} title="Black"></button>
              <button className="color-preset-btn" style={{background:'#fbbf24'}} onClick={() => handleChange('titleColor', '#fbbf24')} title="Amber"></button>
              <button className="color-preset-btn" style={{background:'#00d4ff'}} onClick={() => handleChange('titleColor', '#00d4ff')} title="Cyan"></button>
              <button className="color-preset-btn" style={{background:'#ff6b35'}} onClick={() => handleChange('titleColor', '#ff6b35')} title="Orange"></button>
            </div>
          </div>
      </div>
       <div className="slide-editor-field">
          <div className="sef-label">Description <span style={{fontSize:'9px',color:'var(--text-dim)'}}>{slide.description.length}/300</span></div>
          <textarea className="sef-textarea" value={slide.description} maxLength={300} onChange={e => handleChange('description', e.target.value)} placeholder="1–3 sentences…"></textarea>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'8px'}}>
            <label style={{fontFamily:'"JetBrains Mono",monospace',fontSize:'9px',letterSpacing:'1px',textTransform:'uppercase',color:'var(--text-muted)'}}>Color</label>
            <input type="color" value={slide.descColor} onChange={e => handleChange('descColor', e.target.value)} title="Description text color"/>
            <div style={{display:'flex',gap:'4px'}}>
                <button className="color-preset-btn" style={{background:'#ffffff'}} onClick={() => handleChange('descColor', '#ffffff')} title="White"></button>
                <button className="color-preset-btn" style={{background:'#d4d4d4'}} onClick={() => handleChange('descColor', '#d4d4d4')} title="Light grey"></button>
                <button className="color-preset-btn" style={{background:'#a3a3a3'}} onClick={() => handleChange('descColor', '#a3a3a3')} title="Mid grey"></button>
                <button className="color-preset-btn" style={{background:'#fbbf24'}} onClick={() => handleChange('descColor', '#fbbf24')} title="Amber"></button>
                <button className="color-preset-btn" style={{background:'#00d4ff'}} onClick={() => handleChange('descColor', '#00d4ff')} title="Cyan"></button>
            </div>
          </div>
      </div>
      <div className="regen-strip">
          <button className="regen-btn" onClick={() => regenField('title')}>↻ Title</button>
          <button className="regen-btn" onClick={() => regenField('description')}>↻ Desc</button>
          <button className="regen-btn" onClick={() => regenField('both')}>↻ Both</button>
      </div>
    </div>
  );
}