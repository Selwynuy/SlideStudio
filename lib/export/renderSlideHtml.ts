import { Slide, AspectRatio } from "@/types/slide";
import { BG_PRESETS } from "@/lib/presets";
import { calculateSlideLayout } from "./slideCalculations";

function resolveFontFamily(key: string | undefined, fallback: "display" | "body"): string {
  if (key === "jakarta") return "'Plus Jakarta Sans', sans-serif";
  if (key === "mono") return "'JetBrains Mono', monospace";
  if (key === "bebas") return "'Bebas Neue', sans-serif";
  return fallback === "display" ? "'Bebas Neue', sans-serif" : "'Plus Jakarta Sans', sans-serif";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate HTML string for a slide that matches RenderedSlide exactly.
 * Uses shared calculation logic to ensure consistency.
 */
export function renderSlideHtml(
  slide: Slide,
  aspectRatio: AspectRatio = "9:16",
  slideIndex?: number
): string {
  const { dims, scaleRatio, titleSize, descSize, numSize, numMarginBottom, titleMarginBottom, dividerWidth, dividerHeight, dividerMarginV, contentTop, contentBottom } = calculateSlideLayout(slide, aspectRatio);

  // Background
  const bgStyle = slide.bgImage
    ? `background-image: url(${escapeHtml(slide.bgImage)}); opacity: ${(slide.imageOpacity ?? 100) / 100};`
    : `background: ${BG_PRESETS[slide.bgPresetIdx]?.css ?? "#111"};`;

  // Alignment
  const alignClass = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  }[slide.align] ?? "items-center text-center";

  const dividerSelfAlign = {
    left: "self-start",
    center: "self-center",
    right: "self-end",
  }[slide.align] ?? "self-center";

  // Eyebrow
  const eyebrowHtml = slide.type === "hook" ? `
    <div style="
      font-family: 'JetBrains Mono', monospace;
      font-size: ${20 * scaleRatio}px;
      letter-spacing: ${2 * scaleRatio}px;
      border-radius: ${3 * scaleRatio}px;
      background: rgba(255,107,53,0.25);
      color: #ffaa80;
      border: 1px solid rgba(255,107,53,0.35);
      padding: ${10 * scaleRatio}px ${20 * scaleRatio}px;
      display: inline-block;
      width: fit-content;
    ">
      ${escapeHtml(slide.eyebrow || "STOP SCROLLING →")}
    </div>
  ` : "";

  // Slide number
  const slideNum = slideIndex !== undefined
    ? String(slideIndex + 1).padStart(2, "0")
    : String(slide.id).padStart(2, "0");

  // Divider
  const dividerHtml = (slide.dividerEnabled ?? true) ? `
    <div class="${dividerSelfAlign}" style="
      background: ${slide.accentColor};
      width: ${dividerWidth}px;
      height: ${dividerHeight}px;
      border-radius: ${dividerHeight / 2}px;
      margin: ${dividerMarginV}px 0;
      flex-shrink: 0;
    "></div>
  ` : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slide Export</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      width: ${dims.width}px;
      height: ${dims.height}px;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #000;
    }
    .slide-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .bg-layer {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
    }
    .overlay-layer {
      position: absolute;
      inset: 0;
    }
    .content-layer {
      position: absolute;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: center;
      ${alignClass}
      top: ${contentTop}px;
      bottom: ${contentBottom}px;
      left: 50%;
      transform: translateX(-50%);
      width: 76%;
      padding: ${10 * scaleRatio}px ${8 * scaleRatio}px;
    }
    .slide-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: ${numSize}px;
      color: rgba(255,255,255,0.25);
      letter-spacing: ${2 * scaleRatio}px;
      margin-bottom: ${numMarginBottom}px;
    }
    .slide-title {
      font-family: ${resolveFontFamily(slide.titleFontFamily, "display")};
      font-size: ${titleSize}px;
      line-height: ${slide.type === "hook" ? 0.95 : 1.0};
      color: ${slide.titleColor};
      text-shadow: 0 ${2 * scaleRatio}px ${16 * scaleRatio}px rgba(0,0,0,0.7);
      margin-bottom: ${titleMarginBottom}px;
      letter-spacing: ${1.5 * scaleRatio}px;
      white-space: pre-wrap;
    }
    .slide-description {
      font-family: ${resolveFontFamily(slide.descFontFamily, "body")};
      font-size: ${descSize}px;
      line-height: 1.6;
      color: ${slide.descColor};
      text-shadow: 0 ${scaleRatio}px ${8 * scaleRatio}px rgba(0,0,0,0.6);
      max-height: 100%;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }
    .self-start { align-self: flex-start; }
    .self-center { align-self: center; }
    .self-end { align-self: flex-end; }
    .items-start { align-items: flex-start; }
    .items-center { align-items: center; }
    .items-end { align-items: flex-end; }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
  </style>
</head>
<body>
  <div class="slide-container">
    <div class="bg-layer" style="${bgStyle}"></div>
    <div class="overlay-layer" style="background-color: ${slide.overlayColor}; opacity: ${slide.overlayOpacity / 100};"></div>
    <div class="content-layer">
      ${eyebrowHtml}
      <div class="slide-number">${slideNum}</div>
      <div class="slide-title">${escapeHtml(slide.title)}</div>
      ${dividerHtml}
      <div class="slide-description">${escapeHtml(slide.description)}</div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
