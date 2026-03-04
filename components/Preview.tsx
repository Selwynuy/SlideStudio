"use client";

import { Slide, AspectRatio, ASPECT_RATIO_DIMENSIONS } from "@/types/slide";
import { useEffect, useRef, useState } from "react";
import RenderedSlide from "./RenderedSlide";
import { cn } from "@/lib/utils";
import styles from "./Preview.module.css";

const BASE_FRAME_WIDTH = 300;
const BASE_FRAME_HEIGHT = 650;

interface PreviewProps {
  slide: Slide | null;
  onPrev: () => void;
  onNext: () => void;
  slideIndex: number;
  totalSlides: number;
  editorOpen: boolean;
  setEditorOpen: (open: boolean) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
}

// ── TikTok chrome overlay ─────────────────────────────────────────────────────

function TikTokChrome() {
  return (
    <>
      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 z-[25] h-9 px-4 flex items-center justify-between pointer-events-none font-mono text-[9px] text-white/90 font-semibold bg-gradient-to-b from-black/30 to-transparent">
        <span>9:41</span>
        <div className="flex gap-1 items-center">
          {/* Signal bars */}
          <svg width="14" height="10" viewBox="0 0 14 10" fill="rgba(255,255,255,0.8)">
            <rect x="0" y="4" width="2" height="6" rx="0.5" />
            <rect x="3" y="2.5" width="2" height="7.5" rx="0.5" />
            <rect x="6" y="1" width="2" height="9" rx="0.5" />
            <rect x="9" y="0" width="2" height="10" rx="0.5" />
          </svg>
          {/* Wifi */}
          <svg width="14" height="10" viewBox="0 0 14 10" fill="rgba(255,255,255,0.8)">
            <path d="M7 1C4.5 1 2.3 2 0.8 3.7L2.2 5.1C3.4 3.8 5.1 3 7 3s3.6.8 4.8 2.1l1.4-1.4C11.7 2 9.5 1 7 1zm0 3c-1.5 0-2.8.6-3.8 1.5L4.6 7C5.3 6.4 6.1 6 7 6s1.7.4 2.4 1L10.8 5.5C9.8 4.6 8.5 4 7 4zm0 3c-.8 0-1.4.3-1.9.8L7 10l1.9-2.2C8.4 7.3 7.8 7 7 7z" />
          </svg>
          {/* Battery */}
          <svg width="22" height="10" viewBox="0 0 22 10" fill="rgba(255,255,255,0.8)">
            <rect x="0" y="1" width="19" height="8" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />
            <rect x="19.5" y="3" width="2" height="4" rx="1" />
            <rect x="1.5" y="2.5" width="14" height="5" rx="1" />
          </svg>
        </div>
      </div>

      {/* Right sidebar actions */}
      <div className="absolute right-2 bottom-[22%] z-[25] flex flex-col gap-4 items-center pointer-events-none">
        {/* Avatar */}
        <div className="relative">
          <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#ff0080] to-[#ff8c00] border-2 border-white" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#fe2c55] text-white text-[11px] font-black leading-4 text-center">+</div>
        </div>
        {/* Like */}
        <TikTokAction count="42.1K">
          <svg viewBox="0 0 24 24" fill="white" width="26" height="26">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </TikTokAction>
        {/* Comment */}
        <TikTokAction count="1.2K">
          <svg viewBox="0 0 24 24" fill="white" width="26" height="26">
            <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        </TikTokAction>
        {/* Share */}
        <TikTokAction count="8.5K">
          <svg viewBox="0 0 24 24" fill="white" width="26" height="26">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" />
          </svg>
        </TikTokAction>
        {/* Disc */}
        <div
          className={cn(
            "w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#444]",
            "border-[3px] border-[#888] flex items-center justify-center",
            styles.tiktokDisc
          )}
        >
          <div className="w-[14px] h-[14px] rounded-full bg-gradient-to-br from-[#ff0080] to-[#ff8c00] border-2 border-white" />
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[20%] z-[25] px-3 pb-[18px] pt-2 bg-gradient-to-t from-black/70 from-60% to-transparent pointer-events-none">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#ff0080] to-[#ff8c00] shrink-0" />
          <span className="text-[9px] font-bold text-white font-sans">@yourchannel</span>
          <span className="text-[7px] text-white/50 ml-0.5">· Follow</span>
        </div>
        <div className="text-[8px] text-white/80 leading-[1.4] font-sans">
          ✨ slide content here #learn #tiktok #fyp
        </div>
        <div className="flex items-center gap-1 mt-1.5 text-[7.5px] text-white/60 font-mono">
          <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" width="10" height="10">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
          <span>original sound - yourchannel</span>
        </div>
      </div>
    </>
  );
}

interface TikTokActionProps {
  count: string;
  children: React.ReactNode;
}

function TikTokAction({ count, children }: TikTokActionProps) {
  return (
    <div className="flex flex-col items-center gap-[3px]">
      <div className="w-[42px] h-[42px] rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
        {children}
      </div>
      <span className="text-[8px] text-white/90 font-mono font-semibold">{count}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Preview({
  slide,
  onPrev,
  onNext,
  slideIndex,
  totalSlides,
  editorOpen,
  setEditorOpen,
  aspectRatio,
  setAspectRatio,
}: PreviewProps) {
  const [showTikTokUI, setShowTikTokUI] = useState(false);
  const [showRawCanvas, setShowRawCanvas] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];

  // Letterbox: fit slide aspect ratio inside the fixed phone frame
  const frameAspect = BASE_FRAME_WIDTH / BASE_FRAME_HEIGHT;
  const slideAspect = dims.width / dims.height;

  let slideRenderWidth: number;
  let slideRenderHeight: number;

  if (slideAspect > frameAspect) {
    slideRenderWidth = BASE_FRAME_WIDTH;
    slideRenderHeight = BASE_FRAME_WIDTH / slideAspect;
  } else {
    slideRenderHeight = BASE_FRAME_HEIGHT;
    slideRenderWidth = BASE_FRAME_HEIGHT * slideAspect;
  }

  const canvasScale = slideRenderWidth / dims.width;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const updateScale = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const navHeight = navRef.current?.offsetHeight ?? 0;

      const isMobileWidth = containerWidth <= 768;
      const sideMargin = isMobileWidth ? 40 : 80;
      const verticalMargin = isMobileWidth ? 40 : 80;

      const availableWidth = containerWidth - sideMargin;
      const availableHeight = containerHeight - navHeight - verticalMargin;

      const widthScale = availableWidth > 0 ? availableWidth / BASE_FRAME_WIDTH : 1;
      const heightScale = availableHeight > 0 ? availableHeight / BASE_FRAME_HEIGHT : 1;
      const rawScale = Math.min(1, widthScale, heightScale);
      setScale(Number.isFinite(rawScale) && rawScale > 0 ? rawScale : 1);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center overflow-hidden bg-gradient-to-b from-background via-card to-surface-raised relative"
    >
      {/* Toolbar */}
      <div className="w-full px-5 py-2.5 border-b border-border flex items-center justify-between shrink-0 bg-card">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold text-muted-foreground tracking-[1px] uppercase">
            Live Preview
          </span>
          {!isMobile && (
            <span className="text-[10px] text-text-subtle font-mono">
              {dims.width} × {dims.height}
            </span>
          )}
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            className={cn(
              "text-[10px] font-mono text-muted-foreground",
              "bg-secondary border border-border rounded px-1.5 py-[2px]",
              "cursor-pointer outline-none"
            )}
          >
            <option value="9:16">9:16</option>
            <option value="1:1">1:1</option>
            <option value="4:3">4:3</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              checked={showTikTokUI}
              onChange={(e) => setShowTikTokUI(e.target.checked)}
              className="accent-primary"
            />
            Show TikTok UI
          </label>
          <label className="hidden md:flex items-center gap-1.5 cursor-pointer text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              checked={showRawCanvas}
              onChange={(e) => setShowRawCanvas(e.target.checked)}
              className="accent-primary"
            />
            Show raw export canvas
          </label>

          {/* Editor toggle — mobile only */}
          <button
            type="button"
            onClick={() => setEditorOpen(!editorOpen)}
            title={editorOpen ? "Hide Editor" : "Show Editor"}
            className={cn(
              "md:hidden inline-flex items-center gap-1 px-2 py-[3px] rounded text-[10px]",
              "font-mono tracking-[0.5px] cursor-pointer transition-all",
              "bg-transparent text-muted-foreground border border-border-strong",
              "hover:bg-secondary hover:text-foreground"
            )}
          >
            {editorOpen ? "◄ Editor" : "► Editor"}
          </button>
        </div>
      </div>

      {/* Scrollable preview area */}
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-start py-6 px-5 gap-0">
        <div className="flex w-full items-start justify-center gap-6">
          {/* Phone frame (what the user normally sees) */}
          <div
            id="phoneFrame"
            className={cn(
              styles.phoneFrame,
              "relative overflow-hidden shrink-0 rounded-[44px] border-[8px] border-[#1a1a1a]"
            )}
            style={{
              width: BASE_FRAME_WIDTH * scale,
              height: BASE_FRAME_HEIGHT * scale,
              backgroundColor: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Dynamic island notch */}
            <div
              className="absolute top-[10px] left-1/2 -translate-x-1/2 z-[30] rounded-[20px] bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
              style={{ width: 90 * scale, height: 26 * scale }}
            />
            {/* Home indicator */}
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[30] rounded-[3px] bg-white/30"
              style={{ width: 90 * scale, height: 4 * scale }}
            />

            {/* Slide canvas */}
            <div
              id="slideRender"
              style={{
                width: slideRenderWidth * scale,
                height: slideRenderHeight * scale,
                position: "relative",
              }}
            >
              {slide ? (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: dims.width,
                    height: dims.height,
                    transform: `scale(${canvasScale * scale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <RenderedSlide slide={slide} aspectRatio={aspectRatio} slideIndex={slideIndex} />
                </div>
              ) : (
                /* No-slide placeholder */
                <>
                  <div className="absolute inset-0 bg-secondary" />
                  <div
                    className="absolute z-10 inset-0 flex flex-col items-center justify-center text-center px-2"
                    style={{ top: "8%", bottom: "22%" }}
                  >
                    <div className="font-display text-[30px] leading-none text-white tracking-[1.5px]">
                      Select a slide
                    </div>
                    <div className="font-sans text-[9.5px] leading-[1.6] text-white/85 mt-2">
                      Generate or select a slide to preview.
                    </div>
                  </div>
                </>
              )}

              {/* TikTok chrome */}
              {showTikTokUI && <TikTokChrome />}
            </div>
          </div>

          {/* Raw export canvas (mirrors ExportRoot) for side‑by‑side inspection */}
          {showRawCanvas && slide && (
            <div className="hidden xl:flex flex-col items-center gap-1 shrink-0">
              <span className="text-[10px] font-mono text-muted-foreground tracking-[0.6px] uppercase">
                Export canvas (raw)
              </span>
              <div
                className="relative border border-border bg-black overflow-hidden rounded-md"
                style={{
                  width: dims.width * 0.25,
                  height: dims.height * 0.25,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: dims.width,
                    height: dims.height,
                    transform: "scale(0.25)",
                    transformOrigin: "top left",
                  }}
                >
                  <RenderedSlide slide={slide} aspectRatio={aspectRatio} slideIndex={slideIndex} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div
          ref={navRef}
          className="flex items-center gap-3 pt-3.5 shrink-0"
        >
          <NavButton onClick={onPrev} disabled={slideIndex <= 0}>‹</NavButton>
          <span className="font-mono text-[11px] text-muted-foreground min-w-[60px] text-center">
            {totalSlides > 0 ? `${slideIndex + 1} / ${totalSlides}` : "— / —"}
          </span>
          <NavButton onClick={onNext} disabled={slideIndex >= totalSlides - 1}>›</NavButton>
        </div>
      </div>
    </div>
  );
}

interface NavButtonProps {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}

function NavButton({ onClick, disabled, children }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-[34px] h-[34px] rounded-full border border-border-strong bg-secondary",
        "text-muted-foreground text-[14px] cursor-pointer flex items-center justify-center",
        "transition-all",
        "hover:not-disabled:border-primary hover:not-disabled:text-primary hover:not-disabled:bg-cyan-tint",
        "disabled:opacity-25 disabled:cursor-default"
      )}
    >
      {children}
    </button>
  );
}
