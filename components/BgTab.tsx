"use client";

import { Slide } from "@/types/slide";
import React from "react";
import { BG_PRESETS } from "@/lib/presets";
import { cn } from "@/lib/utils";
import { CtrlSection, CtrlLabel, EmptyState, Toggle, RegenBtn } from "./editor-primitives";

interface BgTabProps {
  slide: Slide | null;
  updateSlide: (updated: Slide) => void;
  applyBgToAll: () => void;
  bgStyleMasterId: string | null;
  setBgStyleMasterId: (id: string | null) => void;
}

export default function BgTab({
  slide,
  updateSlide,
  applyBgToAll,
  bgStyleMasterId,
  setBgStyleMasterId,
}: BgTabProps) {
  if (!slide) {
    return <EmptyState message="Select a slide to customize its background." />;
  }

  const set = <K extends keyof Slide>(field: K, value: Slide[K]) =>
    updateSlide({ ...slide, [field]: value });

  const isBgMaster = bgStyleMasterId === slide.id;

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      updateSlide({ ...slide, bgImage: (ev.target?.result as string) ?? null, bgPresetIdx: -1 });
    reader.readAsDataURL(file);
  };

  const setBgPreset = (idx: number) =>
    updateSlide({ ...slide, bgPresetIdx: idx, bgImage: null });

  return (
    <div id="bgEditorContent" className="flex flex-col flex-1 overflow-y-auto min-h-0">
      {/* ── Preset themes ───────────────────────────────────────────────────── */}
      <CtrlSection>
        <CtrlLabel>Preset Themes</CtrlLabel>
        <div className="grid grid-cols-4 gap-1.5">
          {BG_PRESETS.map((preset, i) => (
            <div
              key={preset.name}
              onClick={() => setBgPreset(i)}
              className={cn(
                "aspect-[9/16] rounded-md cursor-pointer overflow-hidden relative",
                "border-2 transition-all hover:scale-105",
                slide.bgPresetIdx === i
                  ? "border-primary shadow-[0_0_0_1px_var(--cyan)]"
                  : "border-transparent"
              )}
              style={{ background: preset.css }}
            >
              <span className="absolute bottom-[2px] left-0 right-0 text-center text-[7px] font-mono text-white/70">
                {preset.name}
              </span>
            </div>
          ))}
        </div>
      </CtrlSection>

      {/* ── Upload image ─────────────────────────────────────────────────────── */}
      <CtrlSection>
        <CtrlLabel>Upload Image</CtrlLabel>
        <label
          className={cn(
            "block rounded-md border border-dashed border-border-strong",
            "px-4 py-4 text-center cursor-pointer transition-all",
            "bg-secondary text-muted-foreground text-[11px]",
            "hover:border-primary hover:bg-cyan-tint hover:text-primary"
          )}
        >
          {slide.bgImage ? "✓ Custom image loaded" : "Click to upload image background"}
          <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
        </label>

        {slide.bgImage && (
          <div className="mt-2.5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] text-muted-foreground">Image Opacity</label>
              <span className="font-mono text-[10px] text-muted-foreground">
                {slide.imageOpacity ?? 100}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={slide.imageOpacity ?? 100}
              onInput={(e) => set("imageOpacity", parseInt(e.currentTarget.value))}
              className="w-full"
            />
          </div>
        )}
      </CtrlSection>

      {/* ── Overlay (readability) ────────────────────────────────────────────── */}
      <CtrlSection>
        <CtrlLabel>Overlay (Readability)</CtrlLabel>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] text-muted-foreground">Overlay Color</label>
            <input
              type="color"
              value={slide.overlayColor}
              onInput={(e) => set("overlayColor", e.currentTarget.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-[11px] text-muted-foreground">Opacity</label>
            <span className="font-mono text-[10px] text-muted-foreground">
              {slide.overlayOpacity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={slide.overlayOpacity}
            onInput={(e) => set("overlayOpacity", parseInt(e.currentTarget.value))}
            className="w-full"
          />
        </div>
      </CtrlSection>

      {/* ── Accent colour / divider ──────────────────────────────────────────── */}
      <CtrlSection>
        <CtrlLabel>Accent Color</CtrlLabel>
        <div className="flex flex-col gap-1.5">
          <div
            className={cn(
              "flex items-center gap-2.5",
              !(slide.dividerEnabled ?? true) && "opacity-40"
            )}
          >
            <input
              type="color"
              value={slide.accentColor}
              onInput={(e) => set("accentColor", e.currentTarget.value)}
              disabled={slide.dividerEnabled === false}
            />
            <span className="text-[11px] text-muted-foreground">Divider line color</span>
          </div>
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={slide.dividerEnabled ?? true}
              onChange={(e) => set("dividerEnabled", e.target.checked)}
              className="accent-primary"
            />
            Show divider line
          </label>
        </div>
      </CtrlSection>

      {/* ── Slide number ─────────────────────────────────────────────────────── */}
      <CtrlSection>
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-muted-foreground cursor-pointer">
            Show slide number
          </label>
          <Toggle
            checked={slide.showSlideNumber ?? true}
            onChange={(checked) => set("showSlideNumber", checked)}
          />
        </div>
      </CtrlSection>

      {/* ── Apply to all ────────────────────────────────────────────────────── */}
      <CtrlSection>
        <RegenBtn onClick={applyBgToAll} className="w-full justify-center">
          Apply background to all
        </RegenBtn>
      </CtrlSection>

      {/* ── Bg master toggle ─────────────────────────────────────────────────── */}
      <CtrlSection>
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-muted-foreground cursor-pointer">
            Always apply this background
          </label>
          <Toggle
            checked={isBgMaster}
            onChange={(checked) => setBgStyleMasterId(checked ? slide.id : null)}
          />
        </div>
      </CtrlSection>
    </div>
  );
}
