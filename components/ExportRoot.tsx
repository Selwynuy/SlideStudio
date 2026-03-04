"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import html2canvas from "html2canvas";
import { Slide, AspectRatio, ASPECT_RATIO_DIMENSIONS } from "@/types/slide";
import RenderedSlide from "./RenderedSlide";

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

// ─── Helpers (self-contained so this file has no external deps) ──────────────

function waitForFonts(timeout = 5000): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  return Promise.race([
    document.fonts.ready,
    new Promise<void>((res) => setTimeout(res, timeout)),
  ]).then(() => undefined);
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (!url || url === "null" || url === "undefined") return resolve();
    const img = new Image();
    img.crossOrigin = "anonymous";
    const t = setTimeout(resolve, 10_000);
    img.onload = () => {
      clearTimeout(t);
      resolve();
    };
    img.onerror = () => {
      clearTimeout(t);
      resolve(); // don't block export on a failed image
    };
    img.src = url;
  });
}

function raf2(): Promise<void> {
  return new Promise((res) =>
    requestAnimationFrame(() => requestAnimationFrame(() => res()))
  );
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
    const slideRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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

      const container = containerRef.current;
      const element = slideRef.current;
      if (!element || !container) {
        request.reject(new Error("ExportRoot: slide element not mounted"));
        setRequest(null);
        return;
      }

      const dims = ASPECT_RATIO_DIMENSIONS[request.aspectRatio];

      const capture = async () => {
        try {
          // ① Move container into viewport so html2canvas gets accurate layout
          container.style.left = "0px";
          container.style.top = "0px";

          // ② Wait for two animation frames so the browser finishes layout
          await raf2();

          // ③ Pre-load background image (if any)
          if (request.slide.bgImage) {
            await preloadImage(request.slide.bgImage);
          }

          // ④ Wait for web fonts
          await waitForFonts(5_000);

          // ⑤ Force reflow
          void element.offsetHeight;

          // ⑥ Also preload any background-image that ended up in the DOM
          const bgLayer = element.querySelector(
            "[data-layer='bg']"
          ) as HTMLElement | null;
          if (bgLayer) {
            const bgCss = window.getComputedStyle(bgLayer).backgroundImage;
            const m = bgCss.match(/url\(["']?([^"']+)["']?\)/);
            if (m?.[1]) await preloadImage(m[1]);
          }

          // ⑦ Short settle (let any CSS transitions finish)
          await new Promise<void>((res) =>
            requestAnimationFrame(() => setTimeout(res, 100))
          );

          // ⑧ Compute viewport dimensions so html2canvas doesn't clip
          const rect = element.getBoundingClientRect();
          const elW = rect.width || dims.width;
          const elH = rect.height || dims.height;
          const vpW = Math.max(elW + 100, window.innerWidth);
          const vpH = Math.max(elH + 100, window.innerHeight);

          const bgColor = request.slide.bgImage
            ? null
            : request.slide.overlayColor || "#000000";

          // ⑨ Capture
          const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: bgColor,
            useCORS: true,
            allowTaint: false,
            foreignObjectRendering: false,
            windowWidth: vpW,
            windowHeight: vpH,
            logging: false,
          });

          // ⑩ canvas → Blob (direct, no dataURL round-trip)
          const mimeType =
            request.format === "jpg" ? "image/jpeg" : "image/png";
          const quality = request.format === "jpg" ? 0.9 : 1;

          const blob = await new Promise<Blob>((res, rej) =>
            canvas.toBlob(
              (b) =>
                b ? res(b) : rej(new Error("canvas.toBlob returned null")),
              mimeType,
              quality
            )
          );

          request.resolve(blob);
        } catch (err) {
          request.reject(err instanceof Error ? err : new Error(String(err)));
        } finally {
          // Return container off-screen
          if (container) {
            container.style.left = "-9999px";
            container.style.top = "0px";
          }
          setRequest(null);
        }
      };

      capture();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [request]);

    return (
      <div
        ref={containerRef}
        id="export-root"
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          zIndex: -9999,
          pointerEvents: "none",
        }}
      >
        {request && (
          <RenderedSlide
            ref={slideRef}
            slide={request.slide}
            aspectRatio={request.aspectRatio}
            slideIndex={request.slideIndex}
          />
        )}
      </div>
    );
  }
);

ExportRoot.displayName = "ExportRoot";

export default ExportRoot;
