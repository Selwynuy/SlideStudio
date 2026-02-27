"use client";

import { Slide } from "@/types/slide";
import { useEffect, useState } from "react";
import InputTab from "./InputTab";
import SlideTab from "./SlideTab";
import BgTab from "./BgTab";
import ExportTab from "./ExportTab";
import SlidesTab from "./SlidesTab";

interface EditorPanelProps {
  slide: Slide | null;
  updateSlide: (updated: Slide) => void;
  generateSlides: (isBatch: boolean) => Promise<void>;
  isLoading: boolean;
  settings: {
    rawText: string;
    tone: string;
    complexity: string;
    maxSlides: number;
    focus: string;
    hook: boolean;
  };
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
  exportAll: () => void;
  applyTextStyleToAll: () => void;
  applyBgToAll: () => void;
  activeTab: "input" | "slide" | "bg" | "export" | "slides";
  setActiveTab: (tab: "input" | "slide" | "bg" | "export" | "slides") => void;
  textStyleMasterId: string | null;
  setTextStyleMasterId: (id: string | null) => void;
  bgStyleMasterId: string | null;
  setBgStyleMasterId: (id: string | null) => void;
  editorOpen: boolean;
  setEditorOpen: (open: boolean) => void;
}

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

  const panelContent = (
    <>
      {isMobile && editorOpen && (
        <div
          className="editor-overlay-backdrop"
          onClick={() => setEditorOpen(false)}
        />
      )}
      <div className={`${isMobile ? "editor-overlay" : ""} panel-right ${isMobile && editorOpen ? "open" : ""}`} style={isTabletOrSmaller && !isMobile ? { display: 'flex', flexDirection: 'column' } : {}}>
        {isMobile && (
          <button
            className="editor-overlay-close"
            onClick={() => setEditorOpen(false)}
            aria-label="Close editor"
          >
            ×
          </button>
        )}
      <div className={`tabs${isTabletOrSmaller ? " has-slides-tab" : ""}`}>
        <div
          className={`tab ${activeTab === "input" ? "active" : ""}`}
          onClick={() => setActiveTab("input")}
        >
          INPUT
        </div>
        {isTabletOrSmaller && (
          <div
            className={`tab ${activeTab === "slides" ? "active" : ""}`}
            onClick={() => setActiveTab("slides")}
          >
            SLIDES
          </div>
        )}
        <div
          className={`tab ${activeTab === "slide" ? "active" : ""}`}
          onClick={() => setActiveTab("slide")}
        >
          SLIDE
        </div>
        <div
          className={`tab ${activeTab === "bg" ? "active" : ""}`}
          onClick={() => setActiveTab("bg")}
        >
          BG
        </div>
        <div
          className={`tab ${activeTab === "export" ? "active" : ""}`}
          onClick={() => setActiveTab("export")}
        >
          EXPORT
        </div>
      </div>

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
        <div className="tab-pane active" id="tab-slide">
          <SlideTab
            slide={slide}
            updateSlide={updateSlide}
            regenField={regenField}
            applyTextStyleToAll={applyTextStyleToAll}
            textStyleMasterId={textStyleMasterId}
            setTextStyleMasterId={setTextStyleMasterId}
          />
        </div>
      )}
      {activeTab === "bg" && (
        <div className="tab-pane active" id="tab-bg">
          <BgTab
            slide={slide}
            updateSlide={updateSlide}
            applyBgToAll={applyBgToAll}
            bgStyleMasterId={bgStyleMasterId}
            setBgStyleMasterId={setBgStyleMasterId}
          />
        </div>
      )}
      {activeTab === "export" && (
        <ExportTab
          slides={slides}
          exportJson={exportJson}
          exportAll={exportAll}
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

  return panelContent;
}