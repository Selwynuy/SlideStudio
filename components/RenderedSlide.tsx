"use client";

import { Slide, AspectRatio, ASPECT_RATIO_DIMENSIONS } from "@/types/slide";
import { BG_PRESETS } from "@/lib/presets";
import React from "react";
import { cn } from "@/lib/utils";

interface RenderedSlideProps {
  slide: Slide;
  aspectRatio?: AspectRatio;
  slideIndex?: number;
}

// Base frame dimensions — must match Preview.tsx phone frame constants.
const BASE_FRAME_WIDTH = 300;
const BASE_FRAME_HEIGHT = 650;

/** Maps a logical font key to a CSS font-family string. */
function resolveFontFamily(key: string | undefined, fallback: "display" | "body"): string {
  if (key === "jakarta") return "'Plus Jakarta Sans', sans-serif";
  if (key === "mono")    return "'JetBrains Mono', monospace";
  if (key === "bebas")   return "'Bebas Neue', sans-serif";
  // Default: bebas for titles, jakarta for body
  return fallback === "display" ? "'Bebas Neue', sans-serif" : "'Plus Jakarta Sans', sans-serif";
}

const RenderedSlide = React.forwardRef<HTMLDivElement, RenderedSlideProps>(
  ({ slide, aspectRatio = "9:16", slideIndex }, ref) => {
    const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];

    // ── Scale ratio: maps CSS "preview px" values to export canvas px ────────
    // Calculate how the slide fits inside the phone frame (same letterbox logic as Preview.tsx).
    const frameAspect = BASE_FRAME_WIDTH / BASE_FRAME_HEIGHT;
    const slideAspect = dims.width / dims.height;
    const slideRenderWidth =
      slideAspect > frameAspect ? BASE_FRAME_WIDTH : BASE_FRAME_HEIGHT * slideAspect;
    const scaleRatio = dims.width / slideRenderWidth;

    // ── Scaled values ─────────────────────────────────────────────────────────
    const titleSize       = (slide.titleFontSize ?? 30) * scaleRatio;
    const descSize        = (slide.descFontSize  ?? 9.5) * scaleRatio;
    const numSize         = 7  * scaleRatio;
    const numMarginBottom = 6  * scaleRatio;
    const titleMarginBottom = 4  * scaleRatio;
    const dividerWidth    = 30 * scaleRatio;
    const dividerHeight   = 2  * scaleRatio;
    const dividerMarginV  = 24 * scaleRatio;

    // ── Background layer ──────────────────────────────────────────────────────
    const bgStyle: React.CSSProperties = slide.bgImage
      ? { backgroundImage: `url(${slide.bgImage})`, opacity: (slide.imageOpacity ?? 100) / 100 }
      : { background: BG_PRESETS[slide.bgPresetIdx]?.css ?? "#111" };

    // ── Content alignment ─────────────────────────────────────────────────────
    const alignClass = {
      left:   "items-start text-left",
      center: "items-center text-center",
      right:  "items-end text-right",
    }[slide.align] ?? "items-center text-center";

    const dividerSelfAlign = {
      left:   "self-start",
      center: "self-center",
      right:  "self-end",
    }[slide.align];

    return (
      <div
        ref={ref}
        style={{ width: dims.width, height: dims.height }}
      >
        {/* Slide canvas */}
        <div className="relative w-full h-full">
          {/* Background */}
          <div
            data-layer="bg"
            className="absolute inset-0 bg-cover bg-center transition-colors duration-300"
            style={{ ...bgStyle, position: "absolute", inset: 0 }}
          />

          {/* Colour overlay (readability) */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: slide.overlayColor,
              opacity: slide.overlayOpacity / 100,
            }}
          />

          {/* Content layer — respects TikTok safe area */}
          <div
            className={cn(
              "absolute z-10 flex flex-col justify-center",
              alignClass
            )}
            style={{
              top: "8%",
              bottom: "22%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "76%",
              padding: `${10 * scaleRatio}px ${8 * scaleRatio}px`,
            }}
          >
            {/* Hook eyebrow */}
            {slide.type === "hook" && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: `20px`,
                  letterSpacing: `${2 * scaleRatio}px`,
                  borderRadius: `${3 * scaleRatio}px`,
                  background: "rgba(255,107,53,0.25)",
                  color: "#ffaa80",
                  border: "1px solid rgba(255,107,53,0.35)",
                  padding: `20px`,
                }}
              >
                {slide.eyebrow || "STOP SCROLLING →"}
              </div>
            )}

            {/* Slide number */}
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: `${numSize}px`,
                color: "rgba(255,255,255,0.25)",
                letterSpacing: `${2 * scaleRatio}px`,
                marginBottom: `${numMarginBottom}px`,
              }}
            >
              {slideIndex !== undefined
                ? String(slideIndex + 1).padStart(2, "0")
                : String(slide.id).padStart(2, "0")}
            </div>

            {/* Title */}
            <div
              style={{
                fontFamily: resolveFontFamily(slide.titleFontFamily, "display"),
                fontSize: `${titleSize}px`,
                lineHeight: slide.type === "hook" ? 0.95 : 1.0,
                color: slide.titleColor,
                textShadow: `0 ${2 * scaleRatio}px ${16 * scaleRatio}px rgba(0,0,0,0.7)`,
                marginBottom: `${titleMarginBottom}px`,
                letterSpacing: `${1.5 * scaleRatio}px`,
                whiteSpace: "pre-wrap",
              }}
            >
              {slide.title}
            </div>

            {/* Divider */}
            {(slide.dividerEnabled ?? true) && (
              <div
                className={dividerSelfAlign}
                style={{
                  background: slide.accentColor,
                  width: `${dividerWidth}px`,
                  height: `${dividerHeight}px`,
                  borderRadius: dividerHeight / 2,
                  margin: `${dividerMarginV}px 0`,
                  flexShrink: 0,
                }}
              />
            )}

            {/* Description */}
            <div
              style={{
                fontFamily: resolveFontFamily(slide.descFontFamily, "body"),
                fontSize: `${descSize}px`,
                lineHeight: 1.6,
                color: slide.descColor,
                textShadow: `0 ${scaleRatio}px ${8 * scaleRatio}px rgba(0,0,0,0.6)`,
                maxHeight: "100%",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {slide.description}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

RenderedSlide.displayName = "RenderedSlide";

export default RenderedSlide;
