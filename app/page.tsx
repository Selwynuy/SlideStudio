"use client";

import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  loadSlideshow,
  createSlideshow,
  saveSlides,
  slidesFromRecords,
  type Slideshow,
} from "@/lib/slideshows";
import { useUser } from "@/contexts/UserContext";
import { useProjects } from "@/contexts/ProjectsContext";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isUserLoading } = useUser();
  const { refreshProjects } = useProjects();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "slide" | "bg" | "export" | "slides">("input");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Generating slides…");
  const [sourceText, setSourceText] = useState("");
  const [batchOffset, setBatchOffset] = useState(0);
  
  // Database state
  const [currentSlideshowId, setCurrentSlideshowId] = useState<string | null>(null);
  const [isLoadingSlideshow, setIsLoadingSlideshow] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  const [textStyleMasterId, setTextStyleMasterId] = useState<string | null>(null);
  const [bgStyleMasterId, setBgStyleMasterId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(true);
  const renderRef = React.useRef<HTMLDivElement>(null);

  // Track if we've already initialized to prevent double-loading
  const hasInitialized = useRef(false);

  // Check authentication and load slideshow on mount
  useEffect(() => {
    if (isUserLoading) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    // Only initialize once per user session
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Check for slideshow ID in URL
    const slideshowId = searchParams.get('id');
    if (slideshowId) {
      loadSlideshowFromDb(slideshowId);
    } else {
      // If no slideshow ID, create a new one
      createNewSlideshow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUserLoading]);

  // Reset initialization flag when user changes
  useEffect(() => {
    if (!user) {
      hasInitialized.current = false;
    }
  }, [user]);

  // Auto-save slides when they change
  useEffect(() => {
    if (!currentSlideshowId) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Don't auto-save on initial load
    if (slides.length === 0) return;
    
    // Set save status to saving
    setSaveStatus("saving");
    
    // Debounce save by 2 seconds
    saveTimeoutRef.current = setTimeout(async () => {
      await saveSlidesToDb();
    }, 2000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, currentSlideshowId]);

  // Close editor on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editorOpen) {
        setEditorOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [editorOpen]);

  // Load slideshow from database
  async function loadSlideshowFromDb(id: string) {
    setIsLoadingSlideshow(true);
    try {
      const data = await loadSlideshow(id);
      setCurrentSlideshowId(data.id);
      const loadedSlides = slidesFromRecords(data.slides);
      setSlides(loadedSlides);
      if (loadedSlides.length > 0) {
        setActiveIdx(0);
      }
      showToast("Slideshow loaded", "ok");
    } catch (error: any) {
      console.error("Failed to load slideshow:", error);
      showToast(error.message || "Failed to load slideshow", "err");
    } finally {
      setIsLoadingSlideshow(false);
    }
  }

  // Save slides to database
  async function saveSlidesToDb() {
    if (!currentSlideshowId) return;
    
    setIsSaving(true);
    try {
      await saveSlides(currentSlideshowId, slides);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error: any) {
      console.error("Failed to save slides:", error);
      setSaveStatus("error");
      showToast("Failed to save", "err");
    } finally {
      setIsSaving(false);
    }
  }

  // Create new slideshow
  async function createNewSlideshow() {
    try {
      const slideshow = await createSlideshow("Untitled Slideshow", {
        tone,
        complexity,
        maxSlides,
        focus,
        hook,
      });
      setCurrentSlideshowId(slideshow.id);
      setSlides([]);
      setActiveIdx(null);
      // Update URL without reload
      window.history.replaceState({}, '', `/?id=${slideshow.id}`);
      // Refresh projects list to include the new one
      await refreshProjects();
      showToast("New slideshow created", "ok");
    } catch (error: any) {
      console.error("Failed to create slideshow:", error);
      showToast(error.message || "Failed to create slideshow", "err");
    }
  }

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
    const textMaster = textStyleMasterId
      ? slides.find((s) => s.id === textStyleMasterId)
      : null;
    const bgMaster = bgStyleMasterId
      ? slides.find((s) => s.id === bgStyleMasterId)
      : null;

    let newSlide: Slide = {
      id: Date.now().toString(),
      type: "normal",
      title: "New Slide",
      description: "Tap to edit this description.",
      align: textMaster?.align ?? "center",
      bgPresetIdx: bgMaster?.bgPresetIdx ?? 0,
      bgImage: bgMaster?.bgImage ?? null,
      overlayColor: bgMaster?.overlayColor ?? "#000000",
      overlayOpacity: bgMaster?.overlayOpacity ?? 55,
      accentColor: bgMaster?.accentColor ?? "#00d4ff",
      titleColor: textMaster?.titleColor ?? "#ffffff",
      descColor: textMaster?.descColor ?? "#d4d4d4",
      titleFontSize: textMaster?.titleFontSize ?? 30,
      descFontSize: textMaster?.descFontSize ?? 10,
      titleFontFamily: textMaster?.titleFontFamily ?? "bebas",
      descFontFamily: textMaster?.descFontFamily ?? "jakarta",
      dividerEnabled: bgMaster?.dividerEnabled ?? true,
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
    const deletedId = slides[index]?.id;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    setActiveIdx(
      activeIdx === index ? Math.min(index, newSlides.length - 1) : activeIdx
    );
    if (deletedId) {
      if (textStyleMasterId === deletedId) {
        setTextStyleMasterId(null);
      }
      if (bgStyleMasterId === deletedId) {
        setBgStyleMasterId(null);
      }
    }
    setPendingDeleteIdx(null);
    showToast("Slide deleted", "err");
  }

  function cancelDeleteSlide() {
    setPendingDeleteIdx(null);
  }

  function updateSlide(updated: Slide) {
    if (activeIdx === null) return;

    let newSlides = [...slides];
    newSlides[activeIdx] = updated;

    // If this slide is the text style master, propagate text styles to all
    if (textStyleMasterId && updated.id === textStyleMasterId) {
      newSlides = newSlides.map((s) =>
        s.id === updated.id
          ? updated
          : {
              ...s,
              align: updated.align,
              titleColor: updated.titleColor,
              descColor: updated.descColor,
              titleFontSize: updated.titleFontSize,
              descFontSize: updated.descFontSize,
              titleFontFamily: updated.titleFontFamily,
              descFontFamily: updated.descFontFamily,
            }
      );
    }

    // If this slide is the background style master, propagate bg styles to all
    if (bgStyleMasterId && updated.id === bgStyleMasterId) {
      newSlides = newSlides.map((s) =>
        s.id === updated.id
          ? updated
          : {
              ...s,
              bgPresetIdx: updated.bgPresetIdx,
              bgImage: updated.bgImage,
              overlayColor: updated.overlayColor,
              overlayOpacity: updated.overlayOpacity,
              accentColor: updated.accentColor,
              dividerEnabled: updated.dividerEnabled ?? true,
            }
      );
    }

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
        titleFontSize: source.titleFontSize,
        descFontSize: source.descFontSize,
        titleFontFamily: source.titleFontFamily,
        descFontFamily: source.descFontFamily,
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
        dividerEnabled: source.dividerEnabled ?? true,
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
          titleFontSize: 30,
          descFontSize: 10,
          titleFontFamily: "bebas",
          descFontFamily: "jakarta",
          dividerEnabled: true,
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
        onNewSession={createNewSlideshow}
        saveStatus={saveStatus}
        isLoadingSlideshow={isLoadingSlideshow}
        currentSlideshowId={currentSlideshowId}
        onSelectProject={loadSlideshowFromDb}
      />

      <main className="workspace">
        <SlideList
          slides={slides}
          activeIdx={activeIdx}
          setActiveIdx={(idx) => {
            setActiveIdx(idx);
            setActiveTab("slide");
          }}
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
          editorOpen={editorOpen}
          setEditorOpen={setEditorOpen}
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
          activeIdx={activeIdx}
          setActiveIdx={(idx) => {
            setActiveIdx(idx);
            setActiveTab("slide");
          }}
          onAddSlide={addSlide}
          onMoveSlide={moveSlide}
          onDeleteSlide={deleteSlide}
          exportJson={exportJson}
          exportAll={() => exportAll("png", false)}
          applyTextStyleToAll={applyTextStyleToAll}
          applyBgToAll={applyBgToAll}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          textStyleMasterId={textStyleMasterId}
          setTextStyleMasterId={setTextStyleMasterId}
          bgStyleMasterId={bgStyleMasterId}
          setBgStyleMasterId={setBgStyleMasterId}
          editorOpen={editorOpen}
          setEditorOpen={setEditorOpen}
        />
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}