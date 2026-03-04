import { Slide, AspectRatio, ASPECT_RATIO_DIMENSIONS } from "@/types/slide";

const BASE_DESIGN_WIDTH = ASPECT_RATIO_DIMENSIONS["9:16"].width;
const BASE_DESIGN_HEIGHT = ASPECT_RATIO_DIMENSIONS["9:16"].height;

/**
 * Shared calculation logic used by both RenderedSlide and export HTML.
 * This ensures preview and export use identical layout math.
 */
export function calculateSlideLayout(slide: Slide, aspectRatio: AspectRatio) {
  const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];
  const scaleRatio = dims.width / BASE_DESIGN_WIDTH;

  return {
    dims,
    scaleRatio,
    titleSize: (slide.titleFontSize ?? 30) * scaleRatio,
    descSize: (slide.descFontSize ?? 9.5) * scaleRatio,
    numSize: 20 * scaleRatio, // Match what user set in RenderedSlide
    numMarginBottom: 6 * scaleRatio,
    titleMarginBottom: 4 * scaleRatio,
    dividerWidth: 30 * scaleRatio,
    dividerHeight: 2 * scaleRatio,
    dividerMarginV: 24 * scaleRatio,
    contentTop: (BASE_DESIGN_HEIGHT * 0.08) * scaleRatio,
    contentBottom: (BASE_DESIGN_HEIGHT * 0.22) * scaleRatio,
  };
}
