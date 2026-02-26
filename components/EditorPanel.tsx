"use client";

import { Slide } from "@/types/slide";
import InputTab from "./InputTab";
import SlideTab from "./SlideTab";
import BgTab from "./BgTab";
import ExportTab from "./ExportTab";

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
  exportJson: () => void;
  exportAll: () => void;
  applyTextStyleToAll: () => void;
  applyBgToAll: () => void;
  activeTab: "input" | "slide" | "bg" | "export";
  setActiveTab: (tab: "input" | "slide" | "bg" | "export") => void;
  textStyleMasterId: string | null;
  setTextStyleMasterId: (id: string | null) => void;
  bgStyleMasterId: string | null;
  setBgStyleMasterId: (id: string | null) => void;
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
}: EditorPanelProps) {
  return (
    <div className="panel-right">
      <div className="tabs">
        <div
          className={`tab ${activeTab === "input" ? "active" : ""}`}
          onClick={() => setActiveTab("input")}
        >
          INPUT
        </div>
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
    </div>
  );
}