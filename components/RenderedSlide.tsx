"use client";

import { Slide, AspectRatio, ASPECT_RATIO_DIMENSIONS } from "@/types/slide";
import { BG_PRESETS } from "@/lib/presets";
import React from "react";
import { cn, resolveFontFamily } from "@/lib/utils";
import { calculateSlideLayout } from "@/lib/export/slideCalculations";

interface RenderedSlideProps {
  slide: Slide;
  aspectRatio?: AspectRatio;
  slideIndex?: number;
}

const RenderedSlide = React.forwardRef<HTMLDivElement, RenderedSlideProps>(
  ({ slide, aspectRatio = "9:16", slideIndex }, ref) => {
    // Use shared calculation logic to ensure preview and export match exactly
    const { dims, scaleRatio, titleSize, descSize, numSize, numMarginBottom, titleMarginBottom, dividerWidth, dividerHeight, dividerMarginV, contentTop, contentBottom } = calculateSlideLayout(slide, aspectRatio);

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
        data-slide-rendered="true"
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
              top: `${contentTop}px`,
              bottom: `${contentBottom}px`,
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
                  fontSize: `${20 * scaleRatio}px`,
                  letterSpacing: `${2 * scaleRatio}px`,
                  borderRadius: `${3 * scaleRatio}px`,
                  background: "rgba(255,107,53,0.25)",
                  color: "#ffaa80",
                  border: "1px solid rgba(255,107,53,0.35)",
                  padding: `${10 * scaleRatio}px ${20 * scaleRatio}px`,
                  display: "inline-block",
                  width: "fit-content",
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