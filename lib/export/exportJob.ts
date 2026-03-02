import JSZip from "jszip";
import { Slide, AspectRatio } from "@/types/slide";
import type { ExportRootHandle } from "@/components/ExportRoot";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExportJobOptions {
  /** Ordered list of slides to export. */
  slides: Slide[];
  /**
   * Parallel array mapping each entry in `slides` to its original index in the
   * full slideshow – used to generate filenames like "01", "02", …
   */
  originalIndices: number[];
  format: "png" | "jpg";
  branding: boolean;
  asZip: boolean;
  aspectRatio: AspectRatio;
  slideshowTitle: string;
  /** Imperative handle provided by <ExportRoot>. */
  exportRoot: ExportRootHandle;
  /** Pass an AbortSignal to support cancellation. */
  signal: AbortSignal;
  /**
   * Called after each slide finishes (or is skipped).
   * `index` = number of slides processed so far (0 → total).
   */
  onProgress: (index: number, total: number, status: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_RETRIES = 3;

// ─── Main pipeline ────────────────────────────────────────────────────────────

/**
 * Pure async pipeline – no React state, no DOM side-effects beyond what
 * ExportRoot manages internally.
 *
 * Returns when all slides have been processed (or the signal is aborted).
 */
export async function runExportJob(opts: ExportJobOptions): Promise<void> {
  const {
    slides,
    originalIndices,
    format,
    branding,
    asZip,
    aspectRatio,
    slideshowTitle,
    exportRoot,
    signal,
    onProgress,
  } = opts;

  const sanitizedTitle = slideshowTitle
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();

  const collectedBlobs: { blob: Blob; filename: string }[] = [];

  for (let i = 0; i < slides.length; i++) {
    if (signal.aborted) return;

    const slide = slides[i];
    const originalIdx = originalIndices[i] ?? i;
    const filename = `${sanitizedTitle || "slide"}_${String(originalIdx + 1).padStart(2, "0")}_${slide.id.slice(-6)}.${format}`;

    onProgress(i, slides.length, `Rendering slide ${i + 1} of ${slides.length}…`);

    // ── Retry loop ────────────────────────────────────────────────────────────
    let blob: Blob | null = null;
    let lastErr: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (signal.aborted) return;

      if (attempt > 0) {
        onProgress(
          i,
          slides.length,
          `Retrying slide ${i + 1} (attempt ${attempt + 1}/${MAX_RETRIES})…`
        );
        // Exponential back-off: 1 s, 2 s
        await delay(1_000 * attempt, signal);
        if (signal.aborted) return;
      }

      try {
        blob = await exportRoot.captureSlide(
          slide,
          aspectRatio,
          i, // slideIndex (0-based position in export queue)
          format,
          branding
        );
        lastErr = null;
        break; // success – exit retry loop
      } catch (err) {
        lastErr = err instanceof Error ? err : new Error(String(err));
        console.error(`Slide ${i + 1} capture attempt ${attempt + 1} failed:`, err);
      }
    }

    if (!blob) {
      console.error(
        `Skipping slide ${i + 1} after ${MAX_RETRIES} failed attempts:`,
        lastErr
      );
      onProgress(i + 1, slides.length, `⚠ Slide ${i + 1} skipped (render failed)`);
      continue;
    }

    collectedBlobs.push({ blob, filename });

    // Download immediately when not bundling as ZIP
    if (!asZip) {
      triggerDownload(blob, filename);
    }

    onProgress(i + 1, slides.length, `Exported slide ${i + 1} of ${slides.length}`);
  }

  if (signal.aborted) return;

  // ── ZIP bundle ────────────────────────────────────────────────────────────
  if (asZip && collectedBlobs.length > 0) {
    onProgress(
      slides.length,
      slides.length,
      `Creating ZIP with ${collectedBlobs.length} slide${collectedBlobs.length !== 1 ? "s" : ""}…`
    );

    const zip = new JSZip();
    for (const { blob, filename } of collectedBlobs) {
      zip.file(filename, blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipFilename = `${sanitizedTitle || "slides"}_export.zip`;
    triggerDownload(zipBlob, zipFilename);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Promise-based setTimeout that respects an AbortSignal.
 * Resolves immediately if signal fires during the wait.
 */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      resolve();
    });
  });
}
