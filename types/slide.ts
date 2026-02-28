// types/slide.ts

export type AspectRatio = "9:16" | "1:1" | "4:3";

export const ASPECT_RATIO_DIMENSIONS: Record<AspectRatio, { width: number; height: number; label: string }> = {
  "9:16": { width: 1080, height: 1920, label: "9:16 Vertical" },
  "1:1":  { width: 1080, height: 1080, label: "1:1 Square" },
  "4:3":  { width: 1440, height: 1080, label: "4:3 Classic" },
};

export interface Slide {
  id: string;
  type: "normal" | "hook";
  title: string;
  description: string;
  titleColor: string;
  descColor: string;
  /** Per-slide title font size in px (preview canvas scale) */
  titleFontSize?: number;
  /** Per-slide description font size in px (preview canvas scale) */
  descFontSize?: number;
  /** Logical font choice for title */
  titleFontFamily?: "bebas" | "jakarta" | "mono";
  /** Logical font choice for description */
  descFontFamily?: "bebas" | "jakarta" | "mono";
  align: "left" | "center" | "right";
  bgPresetIdx: number;
  bgImage: string | null;
  /** Background image opacity (0-100) */
  imageOpacity?: number;
  overlayColor: string;
  overlayOpacity: number;
  accentColor: string;
  eyebrow?: string;
  /** Whether the divider line is shown / colored */
  dividerEnabled?: boolean;
}