"use client";

import RenderedSlide from "@/components/RenderedSlide";
import { Slide, AspectRatio } from "@/types/slide";
import { ASPECT_RATIO_DIMENSIONS } from "@/types/slide";

interface ExportSlideClientProps {
  slide: Slide;
  aspectRatio: AspectRatio;
  slideIndex?: number;
}

/**
 * Client component that renders the slide.
 * Receives data from server component, so no fetch needed.
 */
export default function ExportSlideClient({
  slide,
  aspectRatio,
  slideIndex,
}: ExportSlideClientProps) {
  const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];

  return (
    <div
      style={{
        width: dims.width,
        height: dims.height,
        margin: 0,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
      }}
    >
      <RenderedSlide
        slide={slide}
        aspectRatio={aspectRatio}
        slideIndex={slideIndex}
      />
    </div>
  );
}
