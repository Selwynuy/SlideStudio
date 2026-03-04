"use client";

import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Slide, AspectRatio } from "@/types/slide";

// ─── Public handle exposed via ref ──────────────────────────────────────────

export interface ExportRootHandle {
  /** Render `slide` off-screen and return it as a Blob. */
  captureSlide(
    slide: Slide,
    aspectRatio: AspectRatio,
    slideIndex: number,
    format: "png" | "jpg"
  ): Promise<Blob>;
}

// ─── Internal capture-request shape ─────────────────────────────────────────

interface CaptureRequest {
  slide: Slide;
  aspectRatio: AspectRatio;
  slideIndex: number;
  format: "png" | "jpg";
  resolve: (blob: Blob) => void;
  reject: (err: Error) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Call the Puppeteer export API to render and screenshot the slide.
 * This uses Chrome's native rendering engine, so it matches the preview exactly.
 */
async function captureSlideViaPuppeteer(
  slide: Slide,
  aspectRatio: AspectRatio,
  slideIndex: number,
  format: "png" | "jpg"
): Promise<Blob> {
  const response = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slide, aspectRatio, slideIndex, format }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Export failed" }));
    throw new Error(error.error || `Export failed: ${response.status}`);
  }

  return response.blob();
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Always-mounted, off-screen container.
 * Expose `captureSlide` imperatively via a ref so the export job can
 * render + screenshot each slide without any appendChild/insertBefore dance.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const ExportRoot = forwardRef<ExportRootHandle, {}>(
  (_, ref) => {
    const [request, setRequest] = useState<CaptureRequest | null>(null);

    // Expose captureSlide to callers
    useImperativeHandle(
      ref,
      () => ({
        captureSlide(slide, aspectRatio, slideIndex, format) {
          return new Promise<Blob>((resolve, reject) => {
            setRequest({
              slide,
              aspectRatio,
              slideIndex,
              format,
              resolve,
              reject,
            });
          });
        },
      }),
      []
    );

    // Fire whenever a new capture request arrives
    useEffect(() => {
      if (!request) return;

      const capture = async () => {
        try {
          // Call Puppeteer API to render and screenshot the slide
          // This uses Chrome's native rendering engine, matching the preview exactly
          const blob = await captureSlideViaPuppeteer(
            request.slide,
            request.aspectRatio,
            request.slideIndex,
            request.format
          );
          request.resolve(blob);
        } catch (err) {
          request.reject(err instanceof Error ? err : new Error(String(err)));
        } finally {
          setRequest(null);
        }
      };

      capture();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [request]);

    // No DOM needed - Puppeteer renders server-side
    return null;
  }
);

ExportRoot.displayName = "ExportRoot";

export default ExportRoot;
