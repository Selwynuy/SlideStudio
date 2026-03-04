"use client";

import { Slide } from "@/types/slide";
import { useEffect, useState } from "react";
import InputTab from "./InputTab";
import SlideTab from "./SlideTab";
import BgTab from "./BgTab";
import ExportTab from "./ExportTab";
import SlidesTab from "./SlidesTab";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type EditorTabId = "input" | "slide" | "bg" | "export" | "slides";

export interface GenerationSettings {
  rawText: string;
  tone: string;
  complexity: string;
  maxSlides: number;
  focus: string;
  hook: boolean;
}

interface EditorPanelProps {
  slide: Slide | null;
  updateSlide: (updated: Slide) => void;
  generateSlides: (isBatch: boolean) => Promise<void>;
  isLoading: boolean;
  settings: GenerationSettings;
  setRawText: (value: string) => void;
  setTone: (value: string) => void;
  setComplexity: (value: string) => void;
  setMaxSlides: (value: number) => void;
  setFocus: (value: string) => void;
  setHook: (value: boolean) => void;
  regenField: (field: "title" | "description" | "both") => Promise<void>;
  sourceText: string;
  batchOffset: number;
  slides: Slide[];
  activeIdx: number | null;
  setActiveIdx: (idx: number) => void;
  onAddSlide: () => void;
  onMoveSlide: (index: number, direction: "up" | "down") => void;
  onDeleteSlide: (index: number) => void;
  exportJson: () => void;
  exportAll: (format: "png" | "jpg", asZip?: boolean) => void;
  exportSelected: (indices: number[], format: "png" | "jpg", asZip?: boolean) => void;
  applyTextStyleToAll: () => void;
  applyBgToAll: () => void;
  activeTab: EditorTabId;
  setActiveTab: (tab: EditorTabId) => void;
  textStyleMasterId: string | null;
  setTextStyleMasterId: (id: string | null) => void;
  bgStyleMasterId: string | null;
  setBgStyleMasterId: (id: string | null) => void;
  editorOpen: boolean;
  setEditorOpen: (open: boolean) => void;
  aspectRatio?: "9:16" | "1:1" | "4:3";
}

// ── Tab definitions ───────────────────────────────────────────────────────────

function buildTabs(showSlidesTab: boolean): { id: EditorTabId; label: string }[] {
  const base: { id: EditorTabId; label: string }[] = [
    { id: "input", label: "INPUT" },
    { id: "slide", label: "SLIDE" },
    { id: "bg",    label: "BG" },
    { id: "export", label: "EXPORT" },
  ];
  if (showSlidesTab) {
    base.splice(1, 0, { id: "slides", label: "SLIDES" });
  }
  return base;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EditorPanel({
  slide,
  updateSlide,
  generateSlides,
  isLoading,
  settings,
  setRawText,
  setTone,
  setComplexity,
  setMaxSlides,
  setFocus,
  setHook,
  regenField,
  sourceText,
  batchOffset,
  slides,
  activeIdx,
  setActiveIdx,
  onAddSlide,
  onMoveSlide,
  onDeleteSlide,
  exportJson,
  exportAll,
  exportSelected,
  applyTextStyleToAll,
  applyBgToAll,
  activeTab,
  setActiveTab,
  textStyleMasterId,
  setTextStyleMasterId,
  bgStyleMasterId,
  setBgStyleMasterId,
  editorOpen,
  setEditorOpen,
  aspectRatio,
}: EditorPanelProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTabletOrSmaller, setIsTabletOrSmaller] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTabletOrSmaller(window.innerWidth <= 1024);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const tabs = buildTabs(isTabletOrSmaller);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && editorOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[99]"
          onClick={() => setEditorOpen(false)}
        />
      )}

      {/* Panel shell */}
      <div
        className={cn(
          "flex flex-col bg-card overflow-hidden min-h-0 flex-1",
          "border-l border-border",
          // Mobile: fixed bottom sheet
          isMobile && [
            "fixed bottom-0 left-0 right-0 z-[100] h-[40vh]",
            "rounded-t-2xl border-l-0 border-t border-border",
            "shadow-[0_-4px_24px_rgba(0,0,0,0.4)]",
            "transition-transform duration-300",
            editorOpen ? "translate-y-0" : "translate-y-full",
          ]
        )}
      >
        {/* Mobile close affordance */}
        {isMobile && (
          <button
            type="button"
            aria-label="Close editor"
            onClick={() => setEditorOpen(false)}
            className={cn(
              "absolute top-2 right-3 text-[22px] bg-transparent border-none",
              "text-foreground cursor-pointer z-10"
            )}
          >
            ×
          </button>
        )}

        {/* Tab bar */}
        <div className="flex border-b border-border shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex-1 py-2.5 px-1 text-[10px] font-bold font-mono",
                "tracking-[1px] uppercase text-center cursor-pointer",
                "border-b-2 transition-all bg-transparent border-none",
                isTabletOrSmaller && "text-[9px] py-2 tracking-[0.5px]",
                activeTab === t.id
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "input" && (
          <InputTab
            generateSlides={generateSlides}
            isLoading={isLoading}
            settings={settings}
            setRawText={setRawText}
            setTone={setTone}
            setComplexity={setComplexity}
            setMaxSlides={setMaxSlides}
            setFocus={setFocus}
            setHook={setHook}
            sourceText={sourceText}
            batchOffset={batchOffset}
          />
        )}
        {activeTab === "slide" && (
          <SlideTab
            slide={slide}
            updateSlide={updateSlide}
            regenField={regenField}
            applyTextStyleToAll={applyTextStyleToAll}
            textStyleMasterId={textStyleMasterId}
            setTextStyleMasterId={setTextStyleMasterId}
          />
        )}
        {activeTab === "bg" && (
          <BgTab
            slide={slide}
            updateSlide={updateSlide}
            applyBgToAll={applyBgToAll}
            bgStyleMasterId={bgStyleMasterId}
            setBgStyleMasterId={setBgStyleMasterId}
          />
        )}
        {activeTab === "export" && (
          <ExportTab
            slides={slides}
            exportJson={exportJson}
            exportAll={exportAll}
            exportSelected={exportSelected}
            aspectRatio={aspectRatio}
          />
        )}
        {activeTab === "slides" && isTabletOrSmaller && (
          <SlidesTab
            slides={slides}
            activeIdx={activeIdx}
            setActiveIdx={setActiveIdx}
            onAddSlide={onAddSlide}
            onMoveSlide={onMoveSlide}
            onDeleteSlide={onDeleteSlide}
          />
        )}
      </div>
    </>
  );
}
