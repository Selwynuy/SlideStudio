"use client";

import { Slide } from "@/types/slide";
import { useState } from "react";
import { BG_PRESETS } from "@/lib/presets";

interface PreviewProps {
  slide: Slide | null;
  onPrev: () => void;
  onNext: () => void;
  slideIndex: number;
  totalSlides: number;
}

export default function Preview({ slide, onPrev, onNext, slideIndex, totalSlides }: PreviewProps) {
  const [showTikTokUI, setShowTikTokUI] = useState(false);

  const bgStyle = slide
    ? slide.bgImage
      ? { backgroundImage: `url(${slide.bgImage})` }
      : { background: BG_PRESETS[slide.bgPresetIdx]?.css || '#111' }
    : { background: "#111" };

  const overlayStyle = slide
    ? {
        backgroundColor: slide.overlayColor,
        opacity: slide.overlayOpacity / 100,
      }
    : { backgroundColor: "rgba(0,0,0,0.4)" };

  return (
    <div className="panel-center">
      <div className="preview-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--text-muted)",
              letterSpacing: "1px",
            }}
          >
            LIVE PREVIEW
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "var(--text-dim)",
              fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            1080 × 1920
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              fontSize: "11px",
              color: "var(--text-muted)",
            }}
          >
            <input
              type="checkbox"
              checked={showTikTokUI}
              onChange={(e) => setShowTikTokUI(e.target.checked)}
              style={{ accentColor: "var(--cyan)" }}
            />
            Show TikTok UI
          </label>
        </div>
      </div>

      <div className="preview-scroll" id="previewScroll">
        <div className="phone-frame" id="phoneFrame">
          <div className="phone-notch"></div>
          <div className="phone-home"></div>

          <div className="slide-render" id="slideRender">
            <div className="slide-bg-layer" style={bgStyle}></div>
            <div className="slide-overlay-layer" style={overlayStyle}></div>

            {showTikTokUI && (
              <>
                <div className="tiktok-status">
                  <span>9:41</span>
                  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="rgba(255,255,255,0.8)"><rect x="0" y="4" width="2" height="6" rx="0.5" /><rect x="3" y="2.5" width="2" height="7.5" rx="0.5" /><rect x="6" y="1" width="2" height="9" rx="0.5" /><rect x="9" y="0" width="2" height="10" rx="0.5" /></svg>
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="rgba(255,255,255,0.8)"><path d="M7 1C4.5 1 2.3 2 0.8 3.7L2.2 5.1C3.4 3.8 5.1 3 7 3s3.6.8 4.8 2.1l1.4-1.4C11.7 2 9.5 1 7 1zm0 3c-1.5 0-2.8.6-3.8 1.5L4.6 7C5.3 6.4 6.1 6 7 6s1.7.4 2.4 1L10.8 5.5C9.8 4.6 8.5 4 7 4zm0 3c-.8 0-1.4.3-1.9.8L7 10l1.9-2.2C8.4 7.3 7.8 7 7 7z" /></svg>
                    <svg width="22" height="10" viewBox="0 0 22 10" fill="rgba(255,255,255,0.8)"><rect x="0" y="1" width="19" height="8" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" /><rect x="19.5" y="3" width="2" height="4" rx="1" /><rect x="1.5" y="2.5" width="14" height="5" rx="1" /></svg>
                  </div>
                </div>
                <div className="tiktok-ui">
                  <div className="tiktok-avatar-wrap">
                    <div className="tiktok-avatar"></div>
                    <div className="tiktok-follow-plus">+</div>
                  </div>
                  <div className="tiktok-action">
                    <div className="tiktok-action-icon">
                      <svg viewBox="0 0 24 24" fill="white" width="26" height="26"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    </div>
                    <div className="tiktok-count">42.1K</div>
                  </div>
                  <div className="tiktok-action">
                    <div className="tiktok-action-icon">
                      <svg viewBox="0 0 24 24" fill="white" width="26" height="26"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" /></svg>
                    </div>
                    <div className="tiktok-count">1.2K</div>
                  </div>
                  <div className="tiktok-action">
                    <div className="tiktok-action-icon">
                      <svg viewBox="0 0 24 24" fill="white" width="26" height="26"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" /></svg>
                    </div>
                    <div className="tiktok-count">8.5K</div>
                  </div>
                  <div className="tiktok-action">
                    <div className="tiktok-disc">
                      <div className="tiktok-disc-inner"></div>
                    </div>
                  </div>
                </div>
                <div className="tiktok-bottom">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "linear-gradient(135deg,#ff0080,#ff8c00)", flexShrink: 0 }}></div>
                    <span className="tiktok-username">@yourchannel</span>
                    <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.5)", marginLeft: "2px" }}>· Follow</span>
                  </div>
                  <div className="tiktok-caption">✨ slide content here #learn #tiktok #fyp</div>
                  <div className="tiktok-music-bar">
                    <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" width="10" height="10"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                    <span>original sound - yourchannel</span>
                  </div>
                </div>
              </>
            )}

            {slide ? (
              <div
                className={`slide-content-layer align-${slide.align}`}
              >
                {slide.type === "hook" && (
                  <div className="sld-hook-eyebrow">{slide.eyebrow || "STOP SCROLLING →"}</div>
                )}
                <div className="sld-num">
                  {slide.type === "hook"
                    ? "HOOK"
                    : String(slideIndex + 1).padStart(2, "0")}
                </div>
                <div className="sld-title" style={{ color: slide.titleColor }}>
                  {slide.title}
                </div>
                <div
                  className="sld-divider"
                  style={{ background: slide.accentColor }}
                ></div>
                <div className="sld-desc" style={{ color: slide.descColor }}>
                  {slide.description}
                </div>
              </div>
            ) : (
              <div className="slide-content-layer align-center">
                <div className="sld-title">Select a slide</div>
                <div className="sld-desc">
                  Generate or select a slide to preview.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="preview-nav">
          <button
            className="nav-btn"
            onClick={onPrev}
            disabled={slideIndex <= 0}
          >
            ‹
          </button>
          <span className="nav-counter">
            {totalSlides > 0 ? `${slideIndex + 1} / ${totalSlides}` : "— / —"}
          </span>
          <button
            className="nav-btn"
            onClick={onNext}
            disabled={slideIndex >= totalSlides - 1}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}