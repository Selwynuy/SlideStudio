"use client";

import { Slide } from "@/types/slide";
import { cn } from "@/lib/utils";
import {
  SefField,
  SefLabel,
  SefTextarea,
  AlignButtons,
  ColorPresets,
  FontRow,
  RegenBtn,
  EmptyState,
} from "./editor-primitives";

// ── Constants ─────────────────────────────────────────────────────────────────

const TITLE_COLORS = [
  { value: "#ffffff", title: "White" },
  { value: "#000000", title: "Black" },
  { value: "#fbbf24", title: "Amber" },
  { value: "#00d4ff", title: "Cyan" },
  { value: "#ff6b35", title: "Orange" },
];

const DESC_COLORS = [
  { value: "#ffffff", title: "White" },
  { value: "#d4d4d4", title: "Light grey" },
  { value: "#a3a3a3", title: "Mid grey" },
  { value: "#fbbf24", title: "Amber" },
  { value: "#00d4ff", title: "Cyan" },
];

const TITLE_FONTS = [
  { value: "bebas",   label: "Bebas Neue" },
  { value: "jakarta", label: "Sans (Plus Jakarta)" },
  { value: "mono",    label: "Mono (JetBrains)" },
];

const DESC_FONTS = [
  { value: "jakarta", label: "Sans (Plus Jakarta)" },
  { value: "bebas",   label: "Bebas Neue" },
  { value: "mono",    label: "Mono (JetBrains)" },
];

const HOOK_SUGGESTIONS = [
  "Stop scrolling if you want to…",
  "The #1 mistake people make",
  "Most people don't know this…",
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

interface SlideTabProps {
  slide: Slide | null;
  updateSlide: (updated: Slide) => void;
  regenField: (field: "title" | "description" | "both") => Promise<void>;
  applyTextStyleToAll: () => void;
  textStyleMasterId: string | null;
  setTextStyleMasterId: (id: string | null) => void;
}

export default function SlideTab({
  slide,
  updateSlide,
  regenField,
  applyTextStyleToAll,
  textStyleMasterId,
  setTextStyleMasterId,
}: SlideTabProps) {
  if (!slide) {
    return (
      <EmptyState message="Select a slide from the left panel to edit its content." />
    );
  }

  const set = <K extends keyof Slide>(field: K, value: Slide[K]) =>
    updateSlide({ ...slide, [field]: value });

  const isHook = slide.type === "hook";
  const isTextMaster = textStyleMasterId === slide.id;

  return (
    <div id="slideEditorContent" className="flex flex-col flex-1 overflow-y-auto min-h-0">
      {/* ── Slide type ─────────────────────────────────────────────────────── */}
      <SefField>
        <SefLabel>Slide Type</SefLabel>
        <div className="flex gap-1.5 mb-2">
          <TypeButton
            active={slide.type === "normal"}
            variant="normal"
            onClick={() => set("type", "normal")}
          >
            Normal
          </TypeButton>
          <TypeButton
            active={slide.type === "hook"}
            variant="hook"
            onClick={() => set("type", "hook")}
          >
            Hook Opener
          </TypeButton>
        </div>
      </SefField>

      {/* ── Text alignment ─────────────────────────────────────────────────── */}
      <SefField>
        <SefLabel>Text Alignment</SefLabel>
        <AlignButtons
          value={slide.align}
          onChange={(v) => set("align", v)}
        />
      </SefField>

      {/* ── Hook eyebrow ────────────────────────────────────────────────────── */}
      {isHook && (
        <SefField>
          <SefLabel
            className="text-hook"
            trailing={
              <span className="text-[9px] text-text-subtle">
                {(slide.eyebrow ?? "").length}/20
              </span>
            }
          >
            Eyebrow Text
          </SefLabel>
          <input
            className={cn(
              "w-full bg-secondary border border-hook/30 rounded-md",
              "text-foreground font-sans text-[13px] font-bold",
              "px-2.5 py-2 outline-none transition-colors",
              "focus:border-hook/60"
            )}
            value={slide.eyebrow ?? "STOP SCROLLING"}
            maxLength={20}
            onChange={(e) => set("eyebrow", e.target.value)}
            placeholder="STOP SCROLLING"
          />
          <p className="text-[9px] text-text-subtle mt-1">
            Small text above the hook (max 2–3 words)
          </p>
        </SefField>
      )}

      {/* ── Title / Hook line ────────────────────────────────────────────────── */}
      <SefField>
        <SefLabel
          className={isHook ? "text-hook" : undefined}
          trailing={
            <span className="text-[9px] text-text-subtle">
              {slide.title.length}/{isHook ? 60 : 80}
            </span>
          }
        >
          {isHook ? "Hook Line" : "Title"}
        </SefLabel>

        <SefTextarea
          value={slide.title}
          maxLength={isHook ? 60 : 80}
          onChange={(e) => set("title", e.target.value)}
          placeholder={
            isHook
              ? "Your powerful hook line (max 4–5 words)…"
              : "Punchy title (max 6 words)…"
          }
          isHook={isHook}
          className="min-h-[48px] font-bold text-[13px]"
        />

        {/* Hook suggestion chips */}
        {isHook && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {HOOK_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set("title", s)}
                className={cn(
                  "text-[9px] px-1.5 py-[2px] rounded cursor-pointer",
                  "bg-hook/10 border border-hook/20 text-hook transition-all",
                  "hover:bg-hook/20"
                )}
              >
                {s.substring(0, 18)}…
              </button>
            ))}
          </div>
        )}

        {/* Title colour + font */}
        <ColorRow
          label="Color"
          colorValue={slide.titleColor}
          onColorChange={(v) => set("titleColor", v)}
          presets={TITLE_COLORS}
        />
        <FontRow
          fontValue={slide.titleFontFamily ?? "bebas"}
          sizeValue={slide.titleFontSize ?? 30}
          onFontChange={(v) => set("titleFontFamily", v as Slide["titleFontFamily"])}
          onSizeChange={(v) => set("titleFontSize", v)}
          minSize={16}
          maxSize={72}
          fontOptions={TITLE_FONTS}
        />
      </SefField>

      {/* ── Description ─────────────────────────────────────────────────────── */}
      <SefField>
        <SefLabel
          trailing={
            <span className="text-[9px] text-text-subtle ml-auto">
              {slide.description.length}/300
            </span>
          }
        >
          Description
        </SefLabel>

        <SefTextarea
          value={slide.description}
          maxLength={300}
          onChange={(e) => set("description", e.target.value)}
          placeholder={
            isHook
              ? "Description won't appear on hook slides (just for reference)"
              : "1–3 sentences…"
          }
          className={isHook ? "bg-black/5 border-white/10" : undefined}
        />

        {isHook && (
          <p className="text-[9px] text-text-subtle mt-1">
            Hook slides show only the eyebrow and hook line for maximum impact.
            Description is saved but not displayed.
          </p>
        )}

        <ColorRow
          label="Color"
          colorValue={slide.descColor}
          onColorChange={(v) => set("descColor", v)}
          presets={DESC_COLORS}
        />
        <FontRow
          fontValue={slide.descFontFamily ?? "jakarta"}
          sizeValue={slide.descFontSize ?? 10}
          onFontChange={(v) => set("descFontFamily", v as Slide["descFontFamily"])}
          onSizeChange={(v) => set("descFontSize", v)}
          minSize={8}
          maxSize={28}
          fontOptions={DESC_FONTS}
        />
      </SefField>

      {/* ── Apply to all / text master ───────────────────────────────────────── */}
      <div className="flex gap-1.5 px-3.5 py-2 border-b border-border">
        <RegenBtn onClick={applyTextStyleToAll} title="Apply alignment and text colours to all slides" className="flex-1">
          Apply text styles to all
        </RegenBtn>
      </div>

      <SefField>
        <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={isTextMaster}
            onChange={(e) => setTextStyleMasterId(e.target.checked ? slide.id : null)}
            className="accent-primary"
          />
          Always apply these text settings
        </label>
      </SefField>

      {/* ── Regen buttons ────────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 px-3.5 py-2">
        <RegenBtn isHook={isHook} onClick={() => regenField("title")}>
          {isHook ? "↻ New Hook" : "↻ Title"}
        </RegenBtn>
        <RegenBtn isHook={isHook} onClick={() => regenField("description")}>
          {isHook ? "↻ Desc" : "↻ Desc"}
        </RegenBtn>
        <RegenBtn isHook={isHook} onClick={() => regenField("both")}>
          ↻ Both
        </RegenBtn>
      </div>
    </div>
  );
}

// ── Local helpers ─────────────────────────────────────────────────────────────

interface TypeButtonProps {
  active: boolean;
  variant: "normal" | "hook";
  onClick: () => void;
  children: React.ReactNode;
}

function TypeButton({ active, variant, onClick, children }: TypeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center px-2.5 py-[5px]",
        "rounded-[5px] text-[11px] font-semibold cursor-pointer transition-all",
        variant === "normal" && active && "bg-primary text-primary-foreground font-bold",
        variant === "normal" && !active && "bg-transparent text-muted-foreground border border-border-strong hover:bg-secondary hover:text-foreground",
        variant === "hook" && active && "bg-hook/12 text-hook border border-hook/25",
        variant === "hook" && !active && "bg-transparent text-muted-foreground border border-border-strong hover:bg-secondary hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

interface ColorRowProps {
  label: string;
  colorValue: string;
  onColorChange: (v: string) => void;
  presets: { value: string; title: string }[];
}

function ColorRow({ label, colorValue, onColorChange, presets }: ColorRowProps) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <label className="font-mono text-[9px] tracking-[1px] uppercase text-muted-foreground">
        {label}
      </label>
      <input
        type="color"
        value={colorValue}
        onChange={(e) => onColorChange(e.target.value)}
        title={`${label} colour`}
      />
      <div className="flex gap-1">
        {presets.map(({ value, title }) => (
          <button
            key={value}
            type="button"
            title={title}
            onClick={() => onColorChange(value)}
            className="w-[18px] h-[18px] rounded-full cursor-pointer shrink-0 transition-transform hover:scale-125 border-2 border-white/15 hover:border-white/50 p-0"
            style={{ background: value }}
          />
        ))}
      </div>
    </div>
  );
}
