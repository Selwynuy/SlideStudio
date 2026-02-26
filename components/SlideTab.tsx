"use client";

import { Slide } from "@/types/slide";


interface SlideTabProps {
  slide: Slide | null;
  updateSlide: (updated: Slide) => void;
  regenField: (field: "title" | "description" | "both") => Promise<void>;
  applyTextStyleToAll: () => void;
  textStyleMasterId: string | null;
  setTextStyleMasterId: (id: string | null) => void;
}

export default function SlideTab({
  slide,
  updateSlide,
  regenField,
  applyTextStyleToAll,
  textStyleMasterId,
  setTextStyleMasterId,
}: SlideTabProps) {
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

  // Check if current slide is a hook
  const isHook = slide.type === "hook";
  const isTextMaster = textStyleMasterId === slide.id;

  return (
    <div id="slideEditorContent" style={{ display: "flex", flexDirection: "column" }}>
      <div className="slide-editor-field">
        <div className="sef-label">
          <span>SLIDE TYPE</span>
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
        {/* Removed the explanatory text as requested */}
      </div>

      <div className="slide-editor-field">
        <div className="sef-label">
          <span>TEXT ALIGNMENT</span>
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

      {/* Hook-specific eyebrow field - FIXED: Now properly displays and editable */}
      {isHook && (
        <div className="slide-editor-field">
          <div className="sef-label">
            <span style={{color:'var(--hook-color)'}}>EYEBROW TEXT</span> 
            <span style={{fontSize:'9px',color:'var(--text-dim)'}}>{(slide.eyebrow || "").length}/20</span>
          </div>
          <input 
            className="sef-input" 
            value={slide.eyebrow || "STOP SCROLLING"} 
            maxLength={20} 
            onChange={e => handleChange('eyebrow', e.target.value)} 
            placeholder="STOP SCROLLING"
            style={{borderColor: 'rgba(255,107,53,0.3)'}}
          />
          <div style={{fontSize:'9px',color:'var(--text-dim)',marginTop:'4px'}}>
            Small text above the hook (max 2-3 words)
          </div>
        </div>
      )}
      
      {/* Title/Hook Line field */}
      <div className="slide-editor-field">
        <div className="sef-label">
          {isHook ? (
            <span style={{color:'var(--hook-color)'}}>HOOK LINE</span>
          ) : (
            <span>TITLE</span>
          )} 
          <span style={{fontSize:'9px',color:'var(--text-dim)'}}>{slide.title.length}/{isHook ? 60 : 80}</span>
        </div>
        <input 
          className="sef-input" 
          value={slide.title} 
          maxLength={isHook ? 60 : 80} 
          onChange={e => handleChange('title', e.target.value)} 
          placeholder={isHook ? "Your powerful hook line (max 4-5 words)…" : "Punchy title (max 6 words)…"}
          style={isHook ? {borderColor: 'rgba(255,107,53,0.3)'} : {}}
        />
        
        {/* Hook-specific suggestions */}
        {isHook && (
          <div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginTop:'6px'}}>
            <button 
              className="suggestion-btn" 
              onClick={() => handleChange('title', "Stop scrolling if you want to…")}
              style={{fontSize:'9px',padding:'2px 6px',background:'rgba(255,107,53,0.1)',border:'1px solid rgba(255,107,53,0.2)',borderRadius:'4px',color:'var(--hook-color)'}}
            >
              Stop scrolling…
            </button>
            <button 
              className="suggestion-btn" 
              onClick={() => handleChange('title', "The #1 mistake people make")}
              style={{fontSize:'9px',padding:'2px 6px',background:'rgba(255,107,53,0.1)',border:'1px solid rgba(255,107,53,0.2)',borderRadius:'4px',color:'var(--hook-color)'}}
            >
              The #1 mistake…
            </button>
            <button 
              className="suggestion-btn" 
              onClick={() => handleChange('title', "Most people don't know this…")}
              style={{fontSize:'9px',padding:'2px 6px',background:'rgba(255,107,53,0.1)',border:'1px solid rgba(255,107,53,0.2)',borderRadius:'4px',color:'var(--hook-color)'}}
            >
              Most people don't know…
            </button>
          </div>
        )}
        
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'8px'}}>
          <label style={{fontFamily:'"JetBrains Mono",monospace',fontSize:'9px',letterSpacing:'1px',textTransform:'uppercase',color:'var(--text-muted)'}}>COLOR</label>
          <input type="color" value={slide.titleColor} onChange={e => handleChange('titleColor', e.target.value)} title="Title text color"/>
          <div style={{display:'flex',gap:'4px'}}>
            <button className="color-preset-btn" style={{background:'#ffffff'}} onClick={() => handleChange('titleColor', '#ffffff')} title="White"></button>
            <button className="color-preset-btn" style={{background:'#000000',borderColor:'#555'}} onClick={() => handleChange('titleColor', '#000000')} title="Black"></button>
            <button className="color-preset-btn" style={{background:'#fbbf24'}} onClick={() => handleChange('titleColor', '#fbbf24')} title="Amber"></button>
            <button className="color-preset-btn" style={{background:'#00d4ff'}} onClick={() => handleChange('titleColor', '#00d4ff')} title="Cyan"></button>
            <button className="color-preset-btn" style={{background:'#ff6b35'}} onClick={() => handleChange('titleColor', '#ff6b35')} title="Orange"></button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "9px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "4px",
              }}
            >
              Font
            </label>
            <select
              className="ctrl-select"
              value={slide.titleFontFamily || "bebas"}
              onChange={(e) =>
                handleChange("titleFontFamily", e.target.value as any)
              }
            >
              <option value="bebas">Bebas Neue</option>
              <option value="jakarta">Sans (Plus Jakarta)</option>
              <option value="mono">Mono (JetBrains)</option>
            </select>
          </div>
          <div style={{ width: "72px" }}>
            <label
              style={{
                display: "block",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "9px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "4px",
              }}
            >
              Size
            </label>
            <input
              type="number"
              min={16}
              max={72}
              className="ctrl-input"
              value={slide.titleFontSize ?? 30}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (!Number.isNaN(value)) {
                  handleChange("titleFontSize", value);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Description field - FIXED: Now editable for normal slides, shows preview for hooks */}
      <div className="slide-editor-field">
        <div className="sef-label">
          {isHook ? (
            <>
              <span>DESCRIPTION</span>
            </>
          ) : (
            <span>DESCRIPTION</span>
          )}
          <span style={{fontSize:'9px',color:'var(--text-dim)',marginLeft:'auto'}}>{slide.description.length}/300</span>
        </div>
        <textarea 
          className="sef-textarea" 
          value={slide.description} 
          maxLength={300} 
          onChange={e => handleChange('description', e.target.value)} 
          placeholder={isHook ? "Description won't appear on hook slides (just for reference)" : "1–3 sentences…"}
          style={isHook ? {background:'rgba(0,0,0,0.05)',borderColor:'rgba(255,255,255,0.1)'} : {}}
          disabled={false}  
        ></textarea>
        
        {isHook && (
          <div style={{fontSize:'9px',color:'var(--text-dim)',marginTop:'4px'}}>
            Hook slides show only the eyebrow and hook line for maximum impact. 
            Description is saved but not displayed.
          </div>
        )}
        
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'8px'}}>
          <label style={{fontFamily:'"JetBrains Mono",monospace',fontSize:'9px',letterSpacing:'1px',textTransform:'uppercase',color:'var(--text-muted)'}}>COLOR</label>
          <input type="color" value={slide.descColor} onChange={e => handleChange('descColor', e.target.value)} title="Description text color"/>
          <div style={{display:'flex',gap:'4px'}}>
            <button className="color-preset-btn" style={{background:'#ffffff'}} onClick={() => handleChange('descColor', '#ffffff')} title="White"></button>
            <button className="color-preset-btn" style={{background:'#d4d4d4'}} onClick={() => handleChange('descColor', '#d4d4d4')} title="Light grey"></button>
            <button className="color-preset-btn" style={{background:'#a3a3a3'}} onClick={() => handleChange('descColor', '#a3a3a3')} title="Mid grey"></button>
            <button className="color-preset-btn" style={{background:'#fbbf24'}} onClick={() => handleChange('descColor', '#fbbf24')} title="Amber"></button>
            <button className="color-preset-btn" style={{background:'#00d4ff'}} onClick={() => handleChange('descColor', '#00d4ff')} title="Cyan"></button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "9px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "4px",
              }}
            >
              Font
            </label>
            <select
              className="ctrl-select"
              value={slide.descFontFamily || "jakarta"}
              onChange={(e) =>
                handleChange("descFontFamily", e.target.value as any)
              }
            >
              <option value="jakarta">Sans (Plus Jakarta)</option>
              <option value="bebas">Bebas Neue</option>
              <option value="mono">Mono (JetBrains)</option>
            </select>
          </div>
          <div style={{ width: "72px" }}>
            <label
              style={{
                display: "block",
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "9px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "4px",
              }}
            >
              Size
            </label>
            <input
              type="number"
              min={8}
              max={28}
              className="ctrl-input"
              value={slide.descFontSize ?? 10}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (!Number.isNaN(value)) {
                  handleChange("descFontSize", value);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Apply text styles to all slides */}
      <div className="regen-strip" style={{ marginTop: "4px" }}>
        <button
          className="regen-btn"
          onClick={applyTextStyleToAll}
          title="Apply alignment and text colors to all slides"
        >
          Apply text styles to all
        </button>
      </div>

      {/* Always apply settings (text master) */}
      <div className="slide-editor-field" style={{ marginTop: "4px" }}>
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
            checked={isTextMaster}
            onChange={(e) =>
              setTextStyleMasterId(e.target.checked ? slide.id : null)
            }
          />
          <span>Always apply these text settings</span>
        </label>
      </div>

      {/* Regenerate buttons */}
      <div className="regen-strip">
        <button className="regen-btn" onClick={() => regenField('title')} style={isHook ? {borderColor:'rgba(255,107,53,0.3)'} : {}}>
          {isHook ? '↻ Generate New Hook' : '↻ Title'}
        </button>
        <button className="regen-btn" onClick={() => regenField('description')} style={isHook ? {borderColor:'rgba(255,107,53,0.3)'} : {}}>
          {isHook ? '↻ Generate Desc' : '↻ Desc'}
        </button>
        <button className="regen-btn" onClick={() => regenField('both')} style={isHook ? {borderColor:'rgba(255,107,53,0.3)'} : {}}>
          {isHook ? '↻ Regenerate Both' : '↻ Both'}
        </button>
      </div>
    </div>
  );
}