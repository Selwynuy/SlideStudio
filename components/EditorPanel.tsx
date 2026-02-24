"use client";

import { Slide } from "@/types/slide";
import { useState } from "react";
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
}: EditorPanelProps) {
  const [activeTab, setActiveTab] = useState("input");

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
        <SlideTab
          slide={slide}
          updateSlide={updateSlide}
          regenField={regenField}
        />
      )}
      {activeTab === "bg" && <BgTab slide={slide} updateSlide={updateSlide} />}
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