"use client";

import { Slide, AspectRatio, ASPECT_RATIO_DIMENSIONS } from "@/types/slide";
import { BG_PRESETS } from "@/lib/presets";
import React from "react";

interface RenderedSlideProps {
  slide: Slide;
  aspectRatio?: AspectRatio;
  slideIndex?: number;
}

const RenderedSlide = React.forwardRef<HTMLDivElement, RenderedSlideProps>(
  ({ slide, aspectRatio = "9:16", slideIndex }, ref) => {
    const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];

    const bgStyle = slide.bgImage
      ? { backgroundImage: `url(${slide.bgImage})`, opacity: (slide.imageOpacity ?? 100) / 100 }
      : { background: BG_PRESETS[slide.bgPresetIdx]?.css || "#111" };

    const overlayStyle = {
      backgroundColor: slide.overlayColor,
      opacity: slide.overlayOpacity / 100,
    };

    const baseTitleSize = slide.titleFontSize ?? 30;
    const baseDescSize = slide.descFontSize ?? 10;

    // Scale font sizes relative to the export canvas height (baseline: 1920px for 9:16)
    const heightRatio = dims.height / 1920;
    const exportTitleSize = baseTitleSize * 3.2 * heightRatio;
    const exportDescSize = baseDescSize * 4.6 * heightRatio;

    const titleFontFamily =
      slide.titleFontFamily === "jakarta"
        ? "'Plus Jakarta Sans', sans-serif"
        : slide.titleFontFamily === "mono"
        ? "'JetBrains Mono', monospace"
        : "'Bebas Neue', sans-serif";

    const descFontFamily =
      slide.descFontFamily === "bebas"
        ? "'Bebas Neue', sans-serif"
        : slide.descFontFamily === "mono"
        ? "'JetBrains Mono', monospace"
        : "'Plus Jakarta Sans', sans-serif";

    return (
      <div
        ref={ref}
        style={{
          width: dims.width,
          height: dims.height,
        }}
      >
        <div className="slide-render" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <div
            className="slide-bg-layer"
            style={{ ...bgStyle, position: "absolute", inset: 0 }}
          ></div>
          <div
            className="slide-overlay-layer"
            style={{ ...overlayStyle, position: "absolute", inset: 0 }}
          ></div>
          <div 
            className={`slide-content-layer align-${slide.align}`}
            style={{
              // Override CSS percentages for export - fill entire slide
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
              transform: 'none',
              padding: '8% 10%', // Generous padding while using full canvas
              overflow: 'visible', // Allow content to extend fully
              justifyContent: 'center', // Match preview - center content vertically
            }}
          >
            {slide.type === "hook" && (
              <div className="sld-hook-eyebrow">{slide.eyebrow || "STOP SCROLLING →"}</div>
            )}
            <div className="sld-num">
              {slide.type === "hook" ? "HOOK" : slideIndex !== undefined ? String(slideIndex + 1).padStart(2, "0") : String(slide.id).padStart(2, "0")}
            </div>
            <div
              className="sld-title"
              style={{
                color: slide.titleColor,
                fontSize: `${exportTitleSize}px`,
                lineHeight: "1.1",
                fontFamily: titleFontFamily,
              }}
            >
              {slide.title}
            </div>
            {slide.dividerEnabled ?? true ? (
              <div
                className="sld-divider"
                style={{ background: slide.accentColor }}
              ></div>
            ) : null}
            <div
              className="sld-desc"
              style={{
                color: slide.descColor,
                fontSize: `${exportDescSize}px`,
                lineHeight: "1.6",
                fontFamily: descFontFamily,
                maxHeight: 'none', // Remove max-height constraint for export
                overflow: 'visible', // Allow full text to be visible
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