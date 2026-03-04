"use client";

import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Slide, AspectRatio } from "@/types/slide";
import Header from "@/components/Header";
import SlideList from "@/components/SlideList";
import Preview from "@/components/Preview";
import EditorPanel from "@/components/EditorPanel";
import Toast from "@/components/Toast";
import ExportModal from "@/components/ExportModal";
import ConfirmModal from "@/components/ConfirmModal";
import { callGemini, callGeminiField, type GeminiRawSlide } from "@/lib/gemini";
import ExportRoot from "@/components/ExportRoot";
import type { ExportRootHandle } from "@/components/ExportRoot";
import { useExportJob } from "@/hooks/useExportJob";
import {
  loadSlideshow,
  createSlideshow,
  updateSlideshow,
  listSlideshows,
  saveSlides,
  slidesFromRecords,
} from "@/lib/slideshows";
import { useUser } from "@/contexts/UserContext";
import { useProjects } from "@/contexts/ProjectsContext";
import ProjectSettingsModal, {
  type ProjectSettingsValues,
} from "@/components/ProjectSettingsModal";
import { createDefaultSlide, sanitizeFilename } from "@/lib/utils";
import { useGenerationSettings } from "@/hooks/useGenerationSettings";
import type { EditorTabId } from "@/components/EditorPanel";

// ── Main page content ─────────────────────────────────────────────────────────

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isUserLoading } = useUser();
  const { refreshProjects } = useProjects();

  // ── Slides state ─────────────────────────────────────────────────────────────
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTabId>("input");
  const [textStyleMasterId, setTextStyleMasterId] = useState<string | null>(null);
  const [bgStyleMasterId, setBgStyleMasterId] = useState<string | null>(null);
  const [pendingDeleteIdx, setPendingDeleteIdx] = useState<number | null>(null);

  // ── Generation settings (extracted hook) ─────────────────────────────────────
  const { settings, handlers } = useGenerationSettings();
  const { rawText, tone, complexity, maxSlides, focus, hook } = settings;
  const { setRawText, setTone, setComplexity, setMaxSlides, setFocus, setHook } = handlers;

  // ── Batch generation state ────────────────────────────────────────────────────
  const [sourceText, setSourceText] = useState("");
  const [batchOffset, setBatchOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ── Project / DB state ────────────────────────────────────────────────────────
  const [currentSlideshowId, setCurrentSlideshowId] = useState<string | null>(null);
  const [currentSlideshowTitle, setCurrentSlideshowTitle] = useState("Untitled Slideshow");
  const [isLoadingSlideshow, setIsLoadingSlideshow] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── UI state ──────────────────────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"ok" | "err" | "">("ok");
  const [editorOpen, setEditorOpen] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  // ── Export (imperative job system) ────────────────────────────────────────────
  const exportRootRef = useRef<ExportRootHandle>(null);
  const { state: exportState, startExport, cancel: cancelExport, reset: resetExport } = useExportJob(exportRootRef);

  // Guard against double-initialization across React strict-mode double-invocations
  const hasInitialized = useRef(false);
  // Skip persisting the aspectRatio immediately after loading it from a project
  const skipAspectRatioSave = useRef(false);

  // ── Auth + initial load ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isUserLoading) return;
    if (!user) { router.push("/auth/login"); return; }
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const slideshowId = searchParams.get("id");
    if (slideshowId) {
      loadSlideshowFromDb(slideshowId);
    } else {
      loadLatestOrCreate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUserLoading]);

  // Reset init guard when user logs out
  useEffect(() => {
    if (!user) hasInitialized.current = false;
  }, [user]);

  // ── Auto-save ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentSlideshowId || slides.length === 0) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus("saving");
    saveTimeoutRef.current = setTimeout(saveSlidesToDb, 2000);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, currentSlideshowId]);

  // ── Persist aspect ratio ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentSlideshowId) return;
    if (skipAspectRatioSave.current) { skipAspectRatioSave.current = false; return; }
    updateSlideshow(currentSlideshowId, {
      settings: { tone, complexity, maxSlides, focus, hook, aspectRatio },
    }).catch((err) => console.error("Failed to save aspect ratio:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspectRatio]);

  // ── Keyboard shortcut (Escape closes editor) ──────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editorOpen) setEditorOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editorOpen]);

  // ── Toast helper ──────────────────────────────────────────────────────────────
  function showToast(message: string, type: "ok" | "err" | "") {
    setToastMessage(message);
    setToastType(type);
    if (type) setTimeout(() => setToastMessage(""), 3000);
  }

  // ── DB helpers ────────────────────────────────────────────────────────────────
  async function loadSlideshowFromDb(id: string) {
    setIsLoadingSlideshow(true);
    try {
      const data = await loadSlideshow(id);
      setCurrentSlideshowId(data.id);
      setCurrentSlideshowTitle(data.title ?? "Untitled Slideshow");

      // Restore settings saved with the project
      if (data.settings) {
        if (data.settings.tone) setTone(data.settings.tone);
        if (data.settings.complexity) setComplexity(data.settings.complexity);
        if (data.settings.maxSlides) setMaxSlides(data.settings.maxSlides);
        if (data.settings.focus) setFocus(data.settings.focus);
        if (data.settings.hook !== undefined) setHook(data.settings.hook);
        if (data.settings.aspectRatio) {
          skipAspectRatioSave.current = true;
          setAspectRatio(data.settings.aspectRatio);
        }
      }

      const loadedSlides = slidesFromRecords(data.slides);
      setSlides(loadedSlides);
      if (loadedSlides.length > 0) setActiveIdx(0);
      showToast("Slideshow loaded", "ok");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load slideshow";
      console.error("Failed to load slideshow:", err);
      showToast(msg, "err");
    } finally {
      setIsLoadingSlideshow(false);
    }
  }

  async function loadLatestOrCreate() {
    try {
      const all = await listSlideshows();
      if (all.length > 0) {
        await loadSlideshowFromDb(all[0].id);
        window.history.replaceState({}, "", `/?id=${all[0].id}`);
      } else {
        setProjectModalOpen(true);
      }
    } catch {
      setProjectModalOpen(true);
    }
  }

  async function saveSlidesToDb() {
    if (!currentSlideshowId) return;
    try {
      await saveSlides(currentSlideshowId, slides);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err: unknown) {
      console.error("Failed to save slides:", err);
      setSaveStatus("error");
      showToast("Failed to save", "err");
    }
  }

  async function createNewSlideshow(values?: ProjectSettingsValues) {
    const title = values?.title ?? "Untitled Slideshow";
    const projectSettings = values
      ? { tone: values.tone, complexity: values.complexity, maxSlides: values.maxSlides, focus: values.focus, hook: values.hook, aspectRatio }
      : { tone, complexity, maxSlides, focus, hook, aspectRatio };
    try {
      const slideshow = await createSlideshow(title, projectSettings);
      setCurrentSlideshowId(slideshow.id);
      setCurrentSlideshowTitle(slideshow.title ?? "Untitled Slideshow");
      if (values) {
        setTone(values.tone);
        setComplexity(values.complexity);
        setMaxSlides(values.maxSlides);
        setFocus(values.focus);
        setHook(values.hook);
      }
      setSlides([]);
      setActiveIdx(null);
      window.history.replaceState({}, "", `/?id=${slideshow.id}`);
      await refreshProjects();
      showToast("New slideshow created", "ok");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create slideshow";
      console.error("Failed to create slideshow:", err);
      showToast(msg, "err");
    }
  }

  async function handleProjectModalSubmit(values: ProjectSettingsValues) {
    setProjectModalOpen(false);
    await createNewSlideshow(values);
  }

  // ── Slide manipulation ────────────────────────────────────────────────────────

  function addSlide() {
    const textMaster = textStyleMasterId ? slides.find((s) => s.id === textStyleMasterId) : null;
    const bgMaster   = bgStyleMasterId   ? slides.find((s) => s.id === bgStyleMasterId)   : null;

    const newSlide = createDefaultSlide({
      align:           textMaster?.align          ?? "center",
      titleColor:      textMaster?.titleColor      ?? "#ffffff",
      descColor:       textMaster?.descColor       ?? "#d4d4d4",
      titleFontSize:   textMaster?.titleFontSize   ?? 30,
      descFontSize:    textMaster?.descFontSize    ?? 10,
      titleFontFamily: textMaster?.titleFontFamily ?? "bebas",
      descFontFamily:  textMaster?.descFontFamily  ?? "jakarta",
      bgPresetIdx:     bgMaster?.bgPresetIdx       ?? 0,
      bgImage:         bgMaster?.bgImage           ?? null,
      imageOpacity:    bgMaster?.imageOpacity      ?? 100,
      overlayColor:    bgMaster?.overlayColor      ?? "#000000",
      overlayOpacity:  bgMaster?.overlayOpacity    ?? 55,
      accentColor:     bgMaster?.accentColor       ?? "#00d4ff",
      dividerEnabled:  bgMaster?.dividerEnabled    ?? true,
    });

    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setActiveIdx(newSlides.length - 1);
    showToast("+ Slide added", "ok");
  }

  function moveSlide(index: number, direction: "up" | "down") {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= slides.length) return;
    const next = [...slides];
    [next[index], next[newIdx]] = [next[newIdx], next[index]];
    setSlides(next);
    setActiveIdx(newIdx);
  }

  /** Request confirmation before deleting */
  const deleteSlide = (index: number) => setPendingDeleteIdx(index);

  function confirmDeleteSlide() {
    if (pendingDeleteIdx === null) return;
    const idx = pendingDeleteIdx;
    const deletedId = slides[idx]?.id;
    const next = slides.filter((_, i) => i !== idx);
    setSlides(next);
    setActiveIdx(activeIdx === idx ? Math.max(0, Math.min(idx, next.length - 1)) : activeIdx);
    if (deletedId) {
      if (textStyleMasterId === deletedId) setTextStyleMasterId(null);
      if (bgStyleMasterId   === deletedId) setBgStyleMasterId(null);
    }
    setPendingDeleteIdx(null);
    showToast("Slide deleted", "err");
  }

  function updateSlide(updated: Slide) {
    if (activeIdx === null) return;
    let next = [...slides];
    next[activeIdx] = updated;

    // Propagate text master overrides
    if (textStyleMasterId && updated.id === textStyleMasterId) {
      next = next.map((s) =>
        s.id === updated.id ? updated : {
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

    // Propagate bg master overrides
    if (bgStyleMasterId && updated.id === bgStyleMasterId) {
      next = next.map((s) =>
        s.id === updated.id ? updated : {
          ...s,
          bgPresetIdx: updated.bgPresetIdx,
          bgImage: updated.bgImage,
          imageOpacity: updated.imageOpacity,
          overlayColor: updated.overlayColor,
          overlayOpacity: updated.overlayOpacity,
          accentColor: updated.accentColor,
          dividerEnabled: updated.dividerEnabled ?? true,
        }
      );
    }

    setSlides(next);
  }

  function applyTextStyleToAll() {
    if (activeIdx === null || slides.length === 0) return;
    const src = slides[activeIdx];
    setSlides(slides.map((s) => ({
      ...s,
      align: src.align,
      titleColor: src.titleColor,
      descColor: src.descColor,
      titleFontSize: src.titleFontSize,
      descFontSize: src.descFontSize,
      titleFontFamily: src.titleFontFamily,
      descFontFamily: src.descFontFamily,
    })));
    showToast("Applied text styles to all slides", "ok");
  }

  function applyBgToAll() {
    if (activeIdx === null || slides.length === 0) return;
    const src = slides[activeIdx];
    setSlides(slides.map((s) => ({
      ...s,
      bgPresetIdx: src.bgPresetIdx,
      bgImage: src.bgImage,
      imageOpacity: src.imageOpacity,
      overlayColor: src.overlayColor,
      overlayOpacity: src.overlayOpacity,
      accentColor: src.accentColor,
      dividerEnabled: src.dividerEnabled ?? true,
    })));
    showToast("Applied background to all slides", "ok");
  }

  // ── AI generation ─────────────────────────────────────────────────────────────

  async function generateSlides(isBatch: boolean) {
    if (!rawText) { showToast("Paste content first", "err"); return; }

    setIsLoading(true);
    if (!isBatch) { setSourceText(rawText); setBatchOffset(0); }

    const chunkSize = 4000;
    const textChunk = (isBatch ? sourceText : rawText).substring(batchOffset, batchOffset + chunkSize);

    const systemPrompt = `You are a TikTok content strategist who converts raw text into vertical slide content.
Return ONLY valid JSON — no markdown, no backticks, no explanation.
Rules:
- titles: max 6 words, punchy, scroll-stopping. Bebas Neue style thinking.
- descriptions: 1-3 sentences, ${complexity} level, ${tone} tone
- focus on: ${focus.replace(/_/g, " ")}
- generate up to ${maxSlides} slides from the provided chunk
- if hook=true, first slide is a hook: attention-grabbing question or bold statement, type="hook"
- other slides: type="normal"
- JSON: {"slides":[{"id":"1","type":"normal|hook","title":"...","description":"..."}, ...]}`;

    const userPrompt = `${hook && !isBatch ? "Include a hook slide as first slide.\n" : ""}Convert this content chunk into slides (batch starting at char offset ${batchOffset}):\n\n${textChunk}`;

    try {
      const result = await callGemini(userPrompt, systemPrompt);
      if (result.slides?.length) {
        const textMaster = textStyleMasterId ? slides.find((s) => s.id === textStyleMasterId) : null;
        const bgMaster   = bgStyleMasterId   ? slides.find((s) => s.id === bgStyleMasterId)   : null;

        const newSlides: Slide[] = result.slides.map((s: GeminiRawSlide, i: number) =>
          createDefaultSlide({
            id: (Date.now() + i).toString(),
            type: s.type ?? "normal",
            title: s.title ?? "",
            description: s.description ?? "",
            // Inherit master styles if set
            ...(textMaster && {
              align: textMaster.align,
              titleColor: textMaster.titleColor,
              descColor: textMaster.descColor,
              titleFontSize: textMaster.titleFontSize,
              descFontSize: textMaster.descFontSize,
              titleFontFamily: textMaster.titleFontFamily,
              descFontFamily: textMaster.descFontFamily,
            }),
            ...(bgMaster && {
              bgPresetIdx: bgMaster.bgPresetIdx,
              bgImage: bgMaster.bgImage,
              imageOpacity: bgMaster.imageOpacity,
              overlayColor: bgMaster.overlayColor,
              overlayOpacity: bgMaster.overlayOpacity,
              accentColor: bgMaster.accentColor,
              dividerEnabled: bgMaster.dividerEnabled,
            }),
          })
        );

        if (isBatch) {
          setSlides((prev) => [...prev, ...newSlides]);
          setBatchOffset(Math.min(batchOffset + chunkSize, sourceText.length));
          showToast(`+ ${newSlides.length} slides added`, "ok");
        } else {
          setSlides(newSlides);
          setActiveIdx(0);
          setBatchOffset(Math.min(chunkSize, rawText.length));
          showToast(`✦ ${newSlides.length} slides generated`, "ok");
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
    const sysPrompt = `You are a TikTok slide content assistant. Return ONLY valid JSON, no markdown.\nTone: ${tone}. Complexity: ${complexity}.`;

    setIsLoading(true);
    try {
      if (field === "title" || field === "both") {
        const prompt = `Rewrite this slide title. Max 6 words, punchy.\nTitle: "${slide.title}" | Desc: "${slide.description}"\nReturn: {"title":"..."}`;
        const result = await callGeminiField(prompt, sysPrompt, 200);
        if (result.title) {
          const next = [...slides];
          next[activeIdx] = { ...next[activeIdx], title: result.title };
          setSlides(next);
        }
      }
      if (field === "description" || field === "both") {
        const prompt = `Rewrite this description. 1-3 sentences.\nTitle: "${slides[activeIdx].title}" | Desc: "${slide.description}"\nReturn: {"description":"..."}`;
        const result = await callGeminiField(prompt, sysPrompt, 400);
        if (result.description) {
          const next = [...slides];
          next[activeIdx] = { ...next[activeIdx], description: result.description };
          setSlides(next);
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

  // ── Export helpers ────────────────────────────────────────────────────────────

  function validateSlidesForExport(toValidate: Slide[]): { valid: boolean; error?: string } {
    if (toValidate.length === 0) return { valid: false, error: "No slides to export" };
    for (let i = 0; i < toValidate.length; i++) {
      if (!toValidate[i].id || !toValidate[i].title)
        return { valid: false, error: `Slide ${i + 1} is missing required data` };
    }
    return { valid: true };
  }

  const exportAll = useCallback(
    (format: "png" | "jpg", asZip = false) => {
      const { valid, error } = validateSlidesForExport(slides);
      if (!valid) { showToast(error ?? "No slides to export", "err"); return; }
      if (exportState.status === "running") { showToast("Export already in progress", "err"); return; }
      startExport({ slides, originalIndices: slides.map((_, i) => i), format, asZip, aspectRatio, slideshowTitle: currentSlideshowTitle });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slides, aspectRatio, currentSlideshowTitle, exportState.status, startExport]
  );

  const exportSelected = useCallback(
    (indices: number[], format: "png" | "jpg", asZip = false) => {
      const valid = indices.filter((i) => i >= 0 && i < slides.length);
      if (valid.length === 0) { showToast("No valid slides selected", "err"); return; }
      const selected = valid.map((i) => slides[i]);
      const { valid: ok, error } = validateSlidesForExport(selected);
      if (!ok) { showToast(error ?? "Invalid slides selected", "err"); return; }
      if (exportState.status === "running") { showToast("Export already in progress", "err"); return; }
      startExport({ slides: selected, originalIndices: valid, format, asZip, aspectRatio, slideshowTitle: currentSlideshowTitle });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slides, aspectRatio, currentSlideshowTitle, exportState.status, startExport]
  );

  function exportJson() {
    if (slides.length === 0) { showToast("No slides to export", "err"); return; }
    const payload = JSON.stringify({
      metadata: {
        slideshowTitle: currentSlideshowTitle,
        slideshowId: currentSlideshowId,
        exportDate: new Date().toISOString(),
        version: "2.0",
        aspectRatio,
        totalSlides: slides.length,
      },
      slides: slides.map((s, i) => ({ index: i + 1, ...s })),
    }, null, 2);

    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(currentSlideshowTitle) || "slides"}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
    showToast("JSON exported", "ok");
  }

  // ── Derived state ─────────────────────────────────────────────────────────────
  const activeSlide = activeIdx !== null ? slides[activeIdx] ?? null : null;
  const showExportModal = exportState.status !== "idle";

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Global overlays */}
      <Toast message={toastMessage} type={toastType} onHide={() => setToastMessage("")} />
      <ConfirmModal
        isOpen={pendingDeleteIdx !== null}
        title="Delete this slide?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteSlide}
        onCancel={() => setPendingDeleteIdx(null)}
      />
      <ExportModal
        isOpen={showExportModal}
        progress={exportState.progress}
        status={exportState.statusText}
        onClose={resetExport}
        onCancel={cancelExport}
        canCancel={exportState.status === "running"}
      />
      <ExportRoot ref={exportRootRef} />
      <ProjectSettingsModal
        isOpen={projectModalOpen}
        mode="create"
        initialValues={{ title: currentSlideshowTitle, tone, complexity, maxSlides, focus, hook }}
        onSubmit={handleProjectModalSubmit}
        onCancel={() => setProjectModalOpen(false)}
      />

      {/* App bar */}
      <Header
        slideCount={slides.length}
        onNewSession={() => setProjectModalOpen(true)}
        saveStatus={saveStatus}
        isLoadingSlideshow={isLoadingSlideshow}
        currentSlideshowId={currentSlideshowId}
        onSelectProject={loadSlideshowFromDb}
        aspectRatio={aspectRatio}
      />

      {/* Main workspace — three-column on desktop, single-column on mobile */}
      <main className="flex-1 overflow-hidden flex flex-col lg:grid lg:grid-cols-[280px_1fr_340px]">
        {/* Slide list — desktop only; tablet/mobile uses the SLIDES editor tab */}
        <div className="hidden lg:flex flex-col overflow-hidden">
          <SlideList
            slides={slides}
            activeIdx={activeIdx}
            setActiveIdx={(idx) => { setActiveIdx(idx); setActiveTab("slide"); }}
            onAddSlide={addSlide}
            onMoveSlide={moveSlide}
            onDeleteSlide={deleteSlide}
          />
        </div>

        {/* Preview */}
        <Preview
          slide={activeSlide}
          onPrev={() => activeIdx !== null && activeIdx > 0 && setActiveIdx(activeIdx - 1)}
          onNext={() => activeIdx !== null && activeIdx < slides.length - 1 && setActiveIdx(activeIdx + 1)}
          slideIndex={activeIdx ?? -1}
          totalSlides={slides.length}
          editorOpen={editorOpen}
          setEditorOpen={setEditorOpen}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
        />

        {/* Editor panel */}
        <EditorPanel
          slide={activeSlide}
          updateSlide={updateSlide}
          generateSlides={generateSlides}
          isLoading={isLoading}
          settings={settings}
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
          setActiveIdx={(idx) => { setActiveIdx(idx); setActiveTab("slide"); }}
          onAddSlide={addSlide}
          onMoveSlide={moveSlide}
          onDeleteSlide={deleteSlide}
          exportJson={exportJson}
          exportAll={exportAll}
          exportSelected={exportSelected}
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
          aspectRatio={aspectRatio}
        />
      </main>
    </>
  );
}

// ── Root export (wrapped in Suspense for useSearchParams) ─────────────────────

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen text-muted-foreground font-mono text-sm">
        Loading...
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
