"use client";

import { Slide } from "@/types/slide";
import { formatSlideNum } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SlideListProps {
  slides: Slide[];
  activeIdx: number | null;
  setActiveIdx: (idx: number) => void;
  onAddSlide: () => void;
  onMoveSlide: (index: number, direction: "up" | "down") => void;
  onDeleteSlide: (index: number) => void;
}

export default function SlideList({
  slides,
  activeIdx,
  setActiveIdx,
  onAddSlide,
  onMoveSlide,
  onDeleteSlide,
}: SlideListProps) {
  return (
    <div className="flex flex-col overflow-hidden bg-card border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-border shrink-0">
        <span className="text-[11px] font-bold text-muted-foreground tracking-[1px] uppercase">
          Slides
        </span>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5">
        {slides.map((slide, i) => (
          <SlideThumb
            key={slide.id}
            slide={slide}
            index={i}
            isActive={i === activeIdx}
            onSelect={() => setActiveIdx(i)}
            onMoveUp={() => onMoveSlide(i, "up")}
            onMoveDown={() => onMoveSlide(i, "down")}
            onDelete={() => onDeleteSlide(i)}
          />
        ))}

        {/* Add slide button */}
        <button
          onClick={onAddSlide}
          className={cn(
            "w-full border border-dashed border-border-strong rounded-[7px]",
            "px-2.5 py-2.5 text-[11px] text-muted-foreground font-sans",
            "cursor-pointer transition-all bg-transparent text-center",
            "hover:border-primary hover:text-primary hover:bg-cyan-tint"
          )}
        >
          + Add Slide
        </button>
      </div>
    </div>
  );
}

// ── Slide thumb ───────────────────────────────────────────────────────────────

interface SlideThumbProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

function SlideThumb({
  slide,
  index,
  isActive,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
}: SlideThumbProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative rounded-[7px] border px-3 py-2.5 cursor-pointer transition-all",
        slide.type === "hook" && "border-l-[3px] border-l-hook",
        isActive
          ? "border-primary bg-cyan-tint"
          : "border-border bg-secondary hover:border-border-strong hover:bg-surface-raised"
      )}
    >
      {/* Slide number + hook badge */}
      <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground tracking-[1px] mb-1">
        {formatSlideNum(index + 1)}
        {slide.type === "hook" && (
          <span className="text-[8px] px-[5px] py-[1px] rounded-[3px] bg-hook/15 text-hook font-mono tracking-[0.5px]">
            HOOK
          </span>
        )}
      </div>

      <div className="text-[12px] font-bold text-foreground truncate">
        {slide.title || "(untitled)"}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
        {slide.description}
      </div>

      {/* Hover action buttons */}
      <div className="absolute top-1.5 right-1.5 hidden group-hover:flex gap-0.5">
        <ThumbActionButton onClick={onMoveUp} title="Move up">↑</ThumbActionButton>
        <ThumbActionButton onClick={onMoveDown} title="Move down">↓</ThumbActionButton>
        <ThumbActionButton
          onClick={onDelete}
          title="Delete"
          className="hover:bg-destructive/15 hover:text-destructive"
        >
          ✕
        </ThumbActionButton>
      </div>
    </div>
  );
}

interface ThumbActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  className?: string;
  children: React.ReactNode;
}

function ThumbActionButton({
  onClick,
  title,
  className,
  children,
}: ThumbActionButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      className={cn(
        "w-[22px] h-[22px] flex items-center justify-center rounded-[4px] border-none",
        "cursor-pointer text-[10px] text-muted-foreground bg-surface-raised",
        "transition-all hover:bg-border hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}
