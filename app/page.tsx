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
import { callGemini } from "@/lib/gemini";
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

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isUserLoading } = useUser();
  const { refreshProjects } = useProjects();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "slide" | "bg" | "export" | "slides">("input");
  const [isLoading, setIsLoading] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [batchOffset, setBatchOffset] = useState(0);

  // Database state
  const [currentSlideshowId, setCurrentSlideshowId] = useState<string | null>(null);
  const [currentSlideshowTitle, setCurrentSlideshowTitle] = useState<string>("Untitled Slideshow");
  const [isLoadingSlideshow, setIsLoadingSlideshow] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"ok" | "err" | "">(""); 

  // Editor / aspect-ratio state
  const [pendingDeleteIdx, setPendingDeleteIdx] = useState<number | null>(null);
  const [textStyleMasterId, setTextStyleMasterId] = useState<string | null>(null);
  const [bgStyleMasterId, setBgStyleMasterId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");

  // Export – imperative job system
  const exportRootRef = useRef<ExportRootHandle>(null);
  const { state: exportState, startExport, cancel: cancelExport, reset: resetExport } = useExportJob(exportRootRef);

  // Track if we've already initialized to prevent double-loading
  const hasInitialized = useRef(false);
  // Skip saving aspectRatio on the initial set from loadSlideshowFromDb
  const skipAspectRatioSave = useRef(false);

  // Project Settings Modal state
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  // ── Auth / initialisation ───────────────────────────────────────────────────
  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const slideshowId = searchParams.get("id");
    if (slideshowId) {
      loadSlideshowFromDb(slideshowId);
    } else {
      // Load latest project instead of creating a new one every visit
      loadLatestOrCreate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUserLoading]);

  useEffect(() => {
    if (!user) {
      hasInitialized.current = false;
    }
  }, [user]);

  // ── Auto-save ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentSlideshowId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (slides.length === 0) return;

    setSaveStatus("saving");
    saveTimeoutRef.current = setTimeout(async () => {
      await saveSlidesToDb();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, currentSlideshowId]);

  // ── Persist aspect ratio ────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentSlideshowId) return;
    if (skipAspectRatioSave.current) {
      skipAspectRatioSave.current = false;
      return;
    }
    updateSlideshow(currentSlideshowId, { settings: { tone, complexity, maxSlides, focus, hook, aspectRatio } })
      .catch((err) => console.error("Failed to save aspect ratio:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspectRatio]);

  // ── Keyboard shortcut ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editorOpen) setEditorOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [editorOpen]);

  // ── DB helpers ──────────────────────────────────────────────────────────────
  async function loadSlideshowFromDb(id: string) {
    setIsLoadingSlideshow(true);
    try {
      const data = await loadSlideshow(id);
      setCurrentSlideshowId(data.id);
      setCurrentSlideshowTitle(data.title || "Untitled Slideshow");
      // Restore generation settings saved with the project
      if (data.settings) {
        if (data.settings.tone) setTone(data.settings.tone);
        if (data.settings.complexity) setComplexity(data.settings.complexity);
        if (data.settings.maxSlides) setMaxSlides(data.settings.maxSlides);
        if (data.settings.focus) setFocus(data.settings.focus);
        if (data.settings.hook !== undefined) setHook(data.settings.hook);
        if (data.settings.aspectRatio) {
          skipAspectRatioSave.current = true;
          setAspectRatio(data.settings.aspectRatio as AspectRatio);
        }
      }
      const loadedSlides = slidesFromRecords(data.slides);
      setSlides(loadedSlides);
      if (loadedSlides.length > 0) setActiveIdx(0);
      showToast("Slideshow loaded", "ok");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to load slideshow";
      console.error("Failed to load slideshow:", error);
      showToast(msg, "err");
    } finally {
      setIsLoadingSlideshow(false);
    }
  }

  async function loadLatestOrCreate() {
    try {
      const slideshows = await listSlideshows();
      if (slideshows.length > 0) {
        // listSlideshows is already ordered by updated_at DESC
        await loadSlideshowFromDb(slideshows[0].id);
        window.history.replaceState({}, "", `/?id=${slideshows[0].id}`);
      } else {
        // No projects yet — open create wizard
        setProjectModalOpen(true);
      }
    } catch {
      // Fallback: open create wizard
      setProjectModalOpen(true);
    }
  }

  // Generation Settings
  const [rawText, setRawText] = useState("");
  const [tone, setTone] = useState("educational");
  const [complexity, setComplexity] = useState("intermediate");
  const [maxSlides, setMaxSlides] = useState(8);
  const [focus, setFocus] = useState("key_points");
  const [hook, setHook] = useState(true);

  async function saveSlidesToDb() {
    if (!currentSlideshowId) return;
    setIsSaving(true);
    try {
      await saveSlides(currentSlideshowId, slides);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error: unknown) {
      console.error("Failed to save slides:", error);
      setSaveStatus("error");
      showToast("Failed to save", "err");
    } finally {
      setIsSaving(false);
    }
  }

  async function createNewSlideshow(values?: ProjectSettingsValues) {
    const title = values?.title || "Untitled Slideshow";
    const settings = values
      ? { tone: values.tone, complexity: values.complexity, maxSlides: values.maxSlides, focus: values.focus, hook: values.hook, aspectRatio }
      : { tone, complexity, maxSlides, focus, hook, aspectRatio };
    try {
      const slideshow = await createSlideshow(title, settings);
      setCurrentSlideshowId(slideshow.id);
      setCurrentSlideshowTitle(slideshow.title || "Untitled Slideshow");
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create slideshow";
      console.error("Failed to create slideshow:", error);
      showToast(msg, "err");
    }
  }

  function openCreateModal() {
    setProjectModalOpen(true);
  }

  async function handleProjectModalSubmit(values: ProjectSettingsValues) {
    setProjectModalOpen(false);
    await createNewSlideshow(values);
  }

  // ── Toast ───────────────────────────────────────────────────────────────────
  function showToast(message: string, type: "ok" | "err" | "") {
    setToastMessage(message);
    setToastType(type);
    if (type) setTimeout(() => setToastMessage(""), 3000);
  }

  // ── Slide manipulation ──────────────────────────────────────────────────────
  function addSlide() {
    const textMaster = textStyleMasterId
      ? slides.find((s) => s.id === textStyleMasterId)
      : null;
    const bgMaster = bgStyleMasterId
      ? slides.find((s) => s.id === bgStyleMasterId)
      : null;

    const newSlide: Slide = {
      id: Date.now().toString(),
      type: "normal",
      title: "New Slide",
      description: "Tap to edit this description.",
      align: textMaster?.align ?? "center",
      bgPresetIdx: bgMaster?.bgPresetIdx ?? 0,
      bgImage: bgMaster?.bgImage ?? null,
      imageOpacity: bgMaster?.imageOpacity ?? 100,
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
      if (textStyleMasterId === deletedId) setTextStyleMasterId(null);
      if (bgStyleMasterId === deletedId) setBgStyleMasterId(null);
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

    if (bgStyleMasterId && updated.id === bgStyleMasterId) {
      newSlides = newSlides.map((s) =>
        s.id === updated.id
          ? updated
          : {
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
        imageOpacity: source.imageOpacity,
        overlayColor: source.overlayColor,
        overlayOpacity: source.overlayOpacity,
        accentColor: source.accentColor,
        dividerEnabled: source.dividerEnabled ?? true,
      }))
    );
    showToast("Applied background to all slides", "ok");
  }

  function prevSlide() {
    if (activeIdx !== null && activeIdx > 0) setActiveIdx(activeIdx - 1);
  }

  function nextSlide() {
    if (activeIdx !== null && activeIdx < slides.length - 1)
      setActiveIdx(activeIdx + 1);
  }

  // ── AI generation ────────────────────────────────────────────────────────────
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
    const chunkSize = 4000;
    const textChunk = (isBatch ? sourceText : rawText).substring(
      batchOffset,
      batchOffset + chunkSize
    );

    const systemPrompt = `You are a TikTok content strategist who converts raw text into vertical slide content.
Return ONLY valid JSON — no markdown, no backticks, no explanation.
Rules:
- titles: max 6 words, punchy, scroll-stopping. Bebas Neue style thinking.
- descriptions: 1-3 sentences, ${settings.complexity} level, ${settings.tone} tone
- focus on: ${settings.focus.replace(/_/g, " ")}
- generate up to ${settings.maxSlides} slides from the provided chunk
- if hook=true, first slide is a hook: attention-grabbing question or bold statement, type="hook"
- other slides: type="normal"
- JSON: {"slides":[{"id":"1","type":"normal|hook","title":"...","description":"..."}, ...]}`;

    const userPrompt = `${
      settings.hook && !isBatch ? "Include a hook slide as first slide.\n" : ""
    }Convert this content chunk into slides (batch starting at char offset ${batchOffset}):\n\n${textChunk}`;

    try {
      const result = await callGemini(userPrompt, systemPrompt);
      if (result.slides?.length) {
        const newSlidesData = result.slides.map((s: Record<string, unknown>, i: number) => ({
          id: (Date.now() + i).toString(),
          type: s.type || "normal",
          title: s.title || "",
          description: s.description || "",
          align: "center",
          bgPresetIdx: 0,
          bgImage: null,
          imageOpacity: 100,
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

  // ── Export helpers ───────────────────────────────────────────────────────────
  function validateSlidesForExport(
    slidesToValidate: Slide[]
  ): { valid: boolean; error?: string } {
    if (slidesToValidate.length === 0)
      return { valid: false, error: "No slides to export" };
    for (let i = 0; i < slidesToValidate.length; i++) {
      const slide = slidesToValidate[i];
      if (!slide.id || !slide.title)
        return { valid: false, error: `Slide ${i + 1} is missing required data` };
    }
    return { valid: true };
  }

  const exportAll = useCallback(
    (format: "png" | "jpg", asZip: boolean = false) => {
      const validation = validateSlidesForExport(slides);
      if (!validation.valid) {
        showToast(validation.error || "No slides to export", "err");
        return;
      }
      if (exportState.status === "running") {
        showToast("Export already in progress", "err");
        return;
      }
      startExport({
        slides,
        originalIndices: slides.map((_, i) => i),
        format,
        asZip,
        aspectRatio,
        slideshowTitle: currentSlideshowTitle,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slides, aspectRatio, currentSlideshowTitle, exportState.status, startExport]
  );

  const exportSelected = useCallback(
    (
      indices: number[],
      format: "png" | "jpg",
      asZip: boolean = false
    ) => {
      const validIndices = indices.filter((i) => i >= 0 && i < slides.length);
      if (validIndices.length === 0) {
        showToast("No valid slides selected", "err");
        return;
      }
      const selectedSlides = validIndices.map((i) => slides[i]);
      const validation = validateSlidesForExport(selectedSlides);
      if (!validation.valid) {
        showToast(validation.error || "Invalid slides selected", "err");
        return;
      }
      if (exportState.status === "running") {
        showToast("Export already in progress", "err");
        return;
      }
      startExport({
        slides: selectedSlides,
        originalIndices: validIndices,
        format,
        asZip,
        aspectRatio,
        slideshowTitle: currentSlideshowTitle,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slides, aspectRatio, currentSlideshowTitle, exportState.status, startExport]
  );

  function exportJson() {
    if (slides.length === 0) {
      showToast("No slides to export", "err");
      return;
    }
    const data = JSON.stringify(
      {
        metadata: {
          slideshowTitle: currentSlideshowTitle,
          slideshowId: currentSlideshowId,
          exportDate: new Date().toISOString(),
          version: "2.0",
          aspectRatio,
          totalSlides: slides.length,
        },
        slides: slides.map((s, i) => ({
          index: i + 1,
          id: s.id,
          type: s.type,
          title: s.title,
          description: s.description,
          align: s.align,
          bgPresetIdx: s.bgPresetIdx,
          bgImage: s.bgImage,
          imageOpacity: s.imageOpacity ?? 100,
          overlayColor: s.overlayColor,
          overlayOpacity: s.overlayOpacity,
          accentColor: s.accentColor,
          titleColor: s.titleColor,
          descColor: s.descColor,
          titleFontSize: s.titleFontSize ?? 30,
          descFontSize: s.descFontSize ?? 10,
          titleFontFamily: s.titleFontFamily ?? "bebas",
          descFontFamily: s.descFontFamily ?? "jakarta",
          dividerEnabled: s.dividerEnabled ?? true,
          eyebrow: s.eyebrow,
        })),
      },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const sanitizedTitle = currentSlideshowTitle
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    a.download = `${sanitizedTitle || "slides"}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
    showToast("JSON exported", "ok");
  }

  // ── Derived export UI state ──────────────────────────────────────────────────
  const showExportModal = exportState.status !== "idle";
  const exportCanCancel = exportState.status === "running";

  // ── Unused variable suppression ──────────────────────────────────────────────
  void isSaving; // referenced only by saveSlidesToDb internals

  // ── Render ───────────────────────────────────────────────────────────────────
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
        isOpen={showExportModal}
        progress={exportState.progress}
        status={exportState.statusText}
        onClose={resetExport}
        onCancel={cancelExport}
        canCancel={exportCanCancel}
      />

      {/* Always-mounted off-screen renderer – no append/remove dance */}
      <ExportRoot ref={exportRootRef} />

      <ProjectSettingsModal
        isOpen={projectModalOpen}
        mode="create"
        initialValues={{
          title: currentSlideshowTitle,
          tone,
          complexity,
          maxSlides,
          focus,
          hook,
        }}
        onSubmit={handleProjectModalSubmit}
        onCancel={() => setProjectModalOpen(false)}
      />

      <Header
        slideCount={slides.length}
        onNewSession={openCreateModal}
        saveStatus={saveStatus}
        isLoadingSlideshow={isLoadingSlideshow}
        currentSlideshowId={currentSlideshowId}
        onSelectProject={loadSlideshowFromDb}
        aspectRatio={aspectRatio}
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
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
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

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
