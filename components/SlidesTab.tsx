"use client";

import { Slide } from "@/types/slide";
import SlideList from "./SlideList";

interface SlidesTabProps {
  slides: Slide[];
  activeIdx: number | null;
  setActiveIdx: (idx: number) => void;
  onAddSlide: () => void;
  onMoveSlide: (index: number, direction: "up" | "down") => void;
  onDeleteSlide: (index: number) => void;
}

/**
 * Thin wrapper that embeds <SlideList> inside the editor panel SLIDES tab
 * (shown on tablet/mobile where the left sidebar is hidden).
 */
export default function SlidesTab({
  slides,
  activeIdx,
  setActiveIdx,
  onAddSlide,
  onMoveSlide,
  onDeleteSlide,
}: SlidesTabProps) {
  return (
    <div className="flex flex-col overflow-hidden min-h-0 flex-1">
      <SlideList
        slides={slides}
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
        onAddSlide={onAddSlide}
        onMoveSlide={onMoveSlide}
        onDeleteSlide={onDeleteSlide}
      />
    </div>
  );
}
