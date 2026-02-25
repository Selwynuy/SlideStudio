"use client";

import { Slide } from "@/types/slide";
import { BG_PRESETS } from "@/lib/presets";
import React from "react";

interface RenderedSlideProps {
  slide: Slide;
}

const RenderedSlide = React.forwardRef<HTMLDivElement, RenderedSlideProps>(
  ({ slide }, ref) => {
    const bgStyle = slide.bgImage
      ? { backgroundImage: `url(${slide.bgImage})` }
      : { background: BG_PRESETS[slide.bgPresetIdx]?.css || "#111" };

    const overlayStyle = {
      backgroundColor: slide.overlayColor,
      opacity: slide.overlayOpacity / 100,
    };

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1920,
          position: "absolute",
          left: -9999, // Off-screen
        }}
      >
        <div className="slide-render" style={{ width: "100%", height: "100%" }}>
          <div
            className="slide-bg-layer"
            style={{ ...bgStyle, position: "absolute", inset: 0 }}
          ></div>
          <div
            className="slide-overlay-layer"
            style={{ ...overlayStyle, position: "absolute", inset: 0 }}
          ></div>
          <div className={`slide-content-layer align-${slide.align}`}>
            {slide.type === "hook" && (
              <div className="sld-hook-eyebrow">{slide.eyebrow || "STOP SCROLLING →"}</div>
            )}
            <div className="sld-num">
              {slide.type === "hook" ? "HOOK" : String(slide.id).padStart(2, "0")}
            </div>
            <div className="sld-title" style={{ color: slide.titleColor, fontSize: '96px', lineHeight: '1.1' }}>
              {slide.title}
            </div>
            <div
              className="sld-divider"
              style={{ background: slide.accentColor }}
            ></div>
            <div className="sld-desc" style={{ color: slide.descColor, fontSize: '46px', lineHeight: '1.6' }}>
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