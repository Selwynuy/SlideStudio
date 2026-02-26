"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Slide } from "@/types/slide";
import Header from "@/components/Header";
import SlideList from "@/components/SlideList";
import Preview from "@/components/Preview";
import EditorPanel from "@/components/EditorPanel";
import Toast from "@/components/Toast";
import ExportModal from "@/components/ExportModal";
import ConfirmModal from "@/components/ConfirmModal";
import { callGemini } from "@/lib/gemini";
import html2canvas from "html2canvas";
import RenderedSlide from "@/components/RenderedSlide";

export default function Home() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Generating slides…");
  const [sourceText, setSourceText] = useState("");
  const [batchOffset, setBatchOffset] = useState(0);

  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"ok" | "err" | "">("");

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState("");
  const [exportIndex, setExportIndex] = useState(0);
  const [slideForExport, setSlideForExport] = useState<Slide | null>(null);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
  const [brandingEnabled, setBrandingEnabled] = useState(false);
  const [pendingDeleteIdx, setPendingDeleteIdx] = useState<number | null>(null);
  const renderRef = React.useRef<HTMLDivElement>(null);

  // Generation Settings
  const [rawText, setRawText] = useState("");
  const [tone, setTone] = useState("educational");
  const [complexity, setComplexity] = useState("intermediate");
  const [maxSlides, setMaxSlides] = useState(8);
  const [focus, setFocus] = useState("key_points");
  const [hook, setHook] = useState(true);

  // Export trigger effect - sets up the next slide to export
  useEffect(() => {
    if (isExporting && exportIndex < slides.length) {
      setExportStatus(`Rendering slide ${exportIndex + 1} of ${slides.length}…`);
      setSlideForExport(slides[exportIndex]);
    } else if (isExporting && exportIndex >= slides.length) {
      setExportStatus(`✓ ${slides.length} slides exported!`);
      setExportProgress(100);
      // Optional: auto-close modal after delay
      setTimeout(() => setIsExporting(false), 2000);
    }
  }, [isExporting, exportIndex, slides]);

  // Export render effect - handles the actual canvas rendering
  useEffect(() => {
    if (slideForExport && renderRef.current) {
      const timer = setTimeout(() => {
        html2canvas(renderRef.current!, {
          scale: 2,
          backgroundColor: null,
        }).then((canvas) => {
          const format = exportFormat === 'jpg' ? 'jpeg' : 'png';
          const quality = exportFormat === 'jpg' ? 0.9 : 1;
          
          const link = document.createElement("a");
          link.download = `slide-${String(exportIndex + 1).padStart(2, "0")}.${exportFormat}`;
          link.href = canvas.toDataURL(`image/${format}`, quality);
          link.click();
          
          // Add branding if enabled
          if (brandingEnabled) {
            // You can implement watermark logic here later
            console.log("Branding watermark would be added here");
          }
          
          setExportProgress(((exportIndex + 1) / slides.length) * 100);
          setExportIndex(exportIndex + 1);
          setSlideForExport(null); // Clear after rendering
        }).catch((error) => {
          console.error("Export failed:", error);
          showToast("Export failed", "err");
          setIsExporting(false);
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [slideForExport, exportIndex, slides.length, exportFormat, brandingEnabled]);

  function showToast(message: string, type: "ok" | "err" | "") {
    setToastMessage(message);
    setToastType(type);
    // Auto-hide toast after 3 seconds
    if (type) {
      setTimeout(() => setToastMessage(""), 3000);
    }
  }

  function addSlide() {
    const newSlide: Slide = {
      id: Date.now().toString(),
      type: "normal",
      title: "New Slide",
      description: "Tap to edit this description.",
      align: "center",
      bgPresetIdx: 0,
      bgImage: null,
      overlayColor: "#000000",
      overlayOpacity: 55,
      accentColor: "#00d4ff",
      titleColor: "#ffffff",
      descColor: "#d4d4d4",
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setActiveIdx(newSlides.length - 1);
    showToast("+ Slide added", "ok");
  }

  function moveSlide(index: number, direction: "up" | "down") {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= slides.length) return;

    const newSlides = [...slides];
    [newSlides[index], newSlides[newIdx]] = [newSlides[newIdx], newSlides[index]];
    setSlides(newSlides);
    setActiveIdx(newIdx);
  }

  function deleteSlide(index: number) {
    // Open center modal asking for confirmation
    setPendingDeleteIdx(index);
  }

  function confirmDeleteSlide() {
    if (pendingDeleteIdx === null) return;

    const index = pendingDeleteIdx;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    setActiveIdx(
      activeIdx === index ? Math.min(index, newSlides.length - 1) : activeIdx
    );
    setPendingDeleteIdx(null);
    showToast("Slide deleted", "err");
  }

  function cancelDeleteSlide() {
    setPendingDeleteIdx(null);
  }

  function updateSlide(updated: Slide) {
    if (activeIdx === null) return;

    const newSlides = [...slides];
    newSlides[activeIdx] = updated;
    setSlides(newSlides);
  }

  function applyTextStyleToAll() {
    if (activeIdx === null || slides.length === 0) return;

    const source = slides[activeIdx];
    setSlides(
      slides.map((s) => ({
        ...s,
        align: source.align,
        titleColor: source.titleColor,
        descColor: source.descColor,
      }))
    );
    showToast("Applied text styles to all slides", "ok");
  }

  function applyBgToAll() {
    if (activeIdx === null || slides.length === 0) return;

    const source = slides[activeIdx];
    setSlides(
      slides.map((s) => ({
        ...s,
        bgPresetIdx: source.bgPresetIdx,
        bgImage: source.bgImage,
        overlayColor: source.overlayColor,
        overlayOpacity: source.overlayOpacity,
        accentColor: source.accentColor,
      }))
    );
    showToast("Applied background to all slides", "ok");
  }

  function prevSlide() {
    if (activeIdx !== null && activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
  }

  function nextSlide() {
    if (activeIdx !== null && activeIdx < slides.length - 1) {
      setActiveIdx(activeIdx + 1);
    }
  }

  async function generateSlides(isBatch: boolean) {
    if (!rawText) {
      showToast("Paste content first", "err");
      return;
    }

    setIsLoading(true);
    if (!isBatch) {
      setSourceText(rawText);
      setBatchOffset(0);
    }

    const settings = { tone, complexity, maxSlides, focus, hook };

    setLoadingText(isBatch ? "Generating next batch…" : "Analyzing content…");
    const chunkSize = 4000;
    const textChunk = (isBatch ? sourceText : rawText).substring(
      batchOffset,
      batchOffset + chunkSize
    );

    const systemPrompt = `You are a TikTok content strategist who converts raw text into vertical slide content.
Return ONLY valid JSON — no markdown, no backticks, no explanation.
Rules:
- titles: max 6 words, punchy, scroll-stopping. Bebas Neue style thinking.
- descriptions: 1-3 sentences, ${settings.complexity} level, ${
      settings.tone
    } tone
- focus on: ${settings.focus.replace(/_/g, " ")}
- generate up to ${settings.maxSlides} slides from the provided chunk
- if hook=true, first slide is a hook: attention-grabbing question or bold statement, type="hook"
- other slides: type="normal"
- JSON: {"slides":[{"id":"1","type":"normal|hook","title":"...","description":"..."}, ...]}`;

    const userPrompt = `${
      settings.hook && !isBatch ? "Include a hook slide as first slide.\n" : ""
    }Convert this content chunk into slides (batch starting at char offset ${batchOffset}):\n\n${textChunk}`;

    try {
      setLoadingText("Building slides…");
      const result = await callGemini(userPrompt, systemPrompt);
      if (result.slides?.length) {
        const newSlidesData = result.slides.map((s: any, i: number) => ({
          id: (Date.now() + i).toString(),
          type: s.type || "normal",
          title: s.title || "",
          description: s.description || "",
          align: "center",
          bgPresetIdx: 0,
          bgImage: null,
          overlayColor: "#000000",
          overlayOpacity: 55,
          accentColor: "#00d4ff",
          titleColor: "#ffffff",
          descColor: "#d4d4d4",
        }));

        if (isBatch) {
          setSlides([...slides, ...newSlidesData]);
          setBatchOffset(Math.min(batchOffset + chunkSize, sourceText.length));
          showToast(`+ ${newSlidesData.length} slides added`, "ok");
        } else {
          setSlides(newSlidesData);
          setActiveIdx(0);
          setBatchOffset(Math.min(chunkSize, sourceText.length));
          showToast(`✦ ${newSlidesData.length} slides generated`, "ok");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Generation failed — check content", "err");
    } finally {
      setIsLoading(false);
    }
  }

  async function regenField(field: "title" | "description" | "both") {
    if (activeIdx === null) return;

    const slide = slides[activeIdx];
    const sysPrompt = `You are a TikTok slide content assistant. Return ONLY valid JSON, no markdown.
Tone: ${tone}. Complexity: ${complexity}.`;

    setIsLoading(true);
    setLoadingText(`Rewriting ${field}…`);

    try {
      if (field === "title" || field === "both") {
        const userPrompt = `Rewrite this slide title. Max 6 words, punchy.
Title: "${slide.title}" | Desc: "${slide.description}"
Return: {"title":"..."}`;
        const result = await callGemini(userPrompt, sysPrompt, 200);
        if (result.title) {
          const newSlides = [...slides];
          newSlides[activeIdx].title = result.title;
          setSlides(newSlides);
        }
      }
      if (field === "description" || field === "both") {
        const userPrompt = `Rewrite this description. 1-3 sentences.
Title: "${slides[activeIdx].title}" | Desc: "${slide.description}"
Return: {"description":"..."}`;
        const result = await callGemini(userPrompt, sysPrompt, 400);
        if (result.description) {
          const newSlides = [...slides];
          newSlides[activeIdx].description = result.description;
          setSlides(newSlides);
        }
      }
      showToast("↻ Regenerated", "ok");
    } catch (err) {
      console.error(err);
      showToast("Regen failed", "err");
    } finally {
      setIsLoading(false);
    }
  }

  const exportAll = useCallback((format: 'png' | 'jpg', branding: boolean) => {
    if (slides.length === 0) {
      showToast("No slides to export", "err");
      return;
    }
    
    setExportFormat(format);
    setBrandingEnabled(branding);
    setExportProgress(0);
    setExportStatus(`Preparing ${format.toUpperCase()} export...`);
    setExportIndex(0);
    setIsExporting(true);
  }, [slides.length, showToast]);

  function exportJson() {
    if (slides.length === 0) {
      showToast("No slides to export", "err");
      return;
    }
    
    const data = JSON.stringify(
      {
        slides: slides.map((s, i) => ({
          index: i + 1,
          type: s.type,
          title: s.title,
          description: s.description,
          align: s.align,
          accentColor: s.accentColor,
        })),
      },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "slides.json";
    a.click();
    showToast("JSON exported", "ok");
  }

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        onHide={() => setToastMessage("")}
      />
      <ConfirmModal
        isOpen={pendingDeleteIdx !== null}
        title="Delete this slide?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteSlide}
        onCancel={cancelDeleteSlide}
      />
      <ExportModal
        isOpen={isExporting}
        progress={exportProgress}
        status={exportStatus}
        onClose={() => setIsExporting(false)}
      />
      {slideForExport && <RenderedSlide ref={renderRef} slide={slideForExport} />}

      <Header
        slideCount={slides.length}
        onNewSession={() => {
          setSlides([]);
          setActiveIdx(null);
        }}
      />

      <main className="workspace">
        <SlideList
          slides={slides}
          activeIdx={activeIdx}
          setActiveIdx={setActiveIdx}
          onAddSlide={addSlide}
          onMoveSlide={moveSlide}
          onDeleteSlide={deleteSlide}
        />

        <Preview
          slide={activeIdx !== null ? slides[activeIdx] : null}
          onPrev={prevSlide}
          onNext={nextSlide}
          slideIndex={activeIdx !== null ? activeIdx : -1}
          totalSlides={slides.length}
        />

        <EditorPanel
          slide={activeIdx !== null ? slides[activeIdx] : null}
          updateSlide={updateSlide}
          generateSlides={generateSlides}
          isLoading={isLoading}
          settings={{ rawText, tone, complexity, maxSlides, focus, hook }}
          setRawText={setRawText}
          setTone={setTone}
          setComplexity={setComplexity}
          setMaxSlides={setMaxSlides}
          setFocus={setFocus}
          setHook={setHook}
          regenField={regenField}
          sourceText={sourceText}
          batchOffset={batchOffset}
          slides={slides}
          exportJson={exportJson}
          exportAll={() => exportAll("png", false)}
          applyTextStyleToAll={applyTextStyleToAll}
          applyBgToAll={applyBgToAll}
        />
      </main>
    </>
  );
}