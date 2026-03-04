"use client";

import { Slide, AspectRatio, ASPECT_RATIO_DIMENSIONS } from "@/types/slide";
import { BG_PRESETS } from "@/lib/presets";
import React from "react";

interface RenderedSlideProps {
  slide: Slide;
  aspectRatio?: AspectRatio;
  slideIndex?: number;
}

// Base frame dimensions (matches Preview.tsx phone frame)
const BASE_FRAME_WIDTH = 300;
const BASE_FRAME_HEIGHT = 650;

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

    // --- Scale ratio: maps CSS base px values (designed for ~300px preview) to export canvas px ---
    // Calculate how the slide fits inside the phone frame (same letterbox logic as Preview.tsx)
    const frameAspect = BASE_FRAME_WIDTH / BASE_FRAME_HEIGHT;
    const slideAspect = dims.width / dims.height;

    let slideRenderWidth: number;
    if (slideAspect > frameAspect) {
      slideRenderWidth = BASE_FRAME_WIDTH; // fit to frame width
    } else {
      slideRenderWidth = BASE_FRAME_HEIGHT * slideAspect; // fit to frame height
    }

    // scaleRatio: how much larger the export canvas is vs the preview render
    const scaleRatio = dims.width / slideRenderWidth;

    // --- Font sizes (base values = user-facing "preview px") ---
    const baseTitleSize = slide.titleFontSize ?? 30;
    const baseDescSize = slide.descFontSize ?? 9.5;

    const exportTitleSize = baseTitleSize * scaleRatio;
    const exportDescSize = baseDescSize * scaleRatio;



    // .sld-title: margin-bottom: 4px
    const exportTitleMarginBottom = 4 * scaleRatio;

    // .sld-divider: width: 30px; height: 2px; margin: 8px 0
    const exportDividerWidth = 30 * scaleRatio;
    const exportDividerHeight = 2 * scaleRatio;
    const exportDividerMarginV = 24 * scaleRatio;

    // .sld-num: font-size: 7px; margin-bottom: 6px
    const exportNumSize = 7 * scaleRatio;
    const exportNumMarginBottom = 6 * scaleRatio;

    // .sld-hook-eyebrow: uses base CSS values from globals.css (no export scaling)

    // --- Font families ---
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
        <div
          className="slide-render"
          style={{ width: "100%", height: "100%"}}
        >
          <div
            className="slide-bg-layer"
            style={{ ...bgStyle, position: "absolute", inset: 0 }}
          />
          <div
            className="slide-overlay-layer"
            style={{ ...overlayStyle, position: "absolute", inset: 0 }}
          />
          <div
            className={`slide-content-layer align-${slide.align}`}
          >
            {slide.type === "hook" && (
              <div className="sld-hook-eyebrow">
                {slide.eyebrow || "STOP SCROLLING →"}
              </div>
            )}
            <div
              className="sld-num"
              style={{
                fontSize: `${exportNumSize}px`,
                marginBottom: `${exportNumMarginBottom}px`,
              }}
            >
              {slideIndex !== undefined
                ? String(slideIndex + 1).padStart(2, "0")
                : String(slide.id).padStart(2, "0")}
            </div>
            <div
              className="sld-title"
              style={{
                color: slide.titleColor,
                fontSize: `${exportTitleSize}px`,
                fontFamily: titleFontFamily,
                marginBottom: `${exportTitleMarginBottom}px`,
              }}
            >
              {slide.title}
            </div>
            {slide.dividerEnabled ?? true ? (
              <div
                className="sld-divider"
                style={{
                  background: slide.accentColor,
                  width: `${exportDividerWidth}px`,
                  height: `${exportDividerHeight}px`,
                  margin: `${exportDividerMarginV}px 0`,
                  borderRadius: exportDividerHeight / 2,
                }}
              />
            ) : null}
            <div
              className="sld-desc"
              style={{
                color: slide.descColor,
                fontSize: `${exportDescSize}px`,
                lineHeight: "1.6",
                fontFamily: descFontFamily,
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
