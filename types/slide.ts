// types/slide.ts

export interface Slide {
  id: string;
  type: "normal" | "hook";
  title: string;
  description: string;
  titleColor: string;
  descColor: string;
  align: "left" | "center" | "right";
  bgPresetIdx: number;
  bgImage: string | null;
  overlayColor: string;
  overlayOpacity: number;
  accentColor: string;
  eyebrow?: string;
}