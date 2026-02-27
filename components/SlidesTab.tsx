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

export default function SlidesTab({
  slides,
  activeIdx,
  setActiveIdx,
  onAddSlide,
  onMoveSlide,
  onDeleteSlide,
}: SlidesTabProps) {
  return (
    <div className="slides-tab-pane">
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
