"use client";

import { useRef, useState, useCallback, RefObject } from "react";
import { Slide, AspectRatio } from "@/types/slide";
import type { ExportRootHandle } from "@/components/ExportRoot";
import { runExportJob } from "@/lib/export/exportJob";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExportJobStatus =
  | "idle"
  | "running"
  | "completed"
  | "cancelled"
  | "error";

export interface ExportJobState {
  status: ExportJobStatus;
  /** 0–100 */
  progress: number;
  statusText: string;
}

export interface StartExportOptions {
  slides: Slide[];
  originalIndices: number[];
  format: "png" | "jpg";
  asZip: boolean;
  aspectRatio: AspectRatio;
  slideshowTitle: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages the lifecycle of a single export job.
 *
 * Pass the ref you put on <ExportRoot> so the hook can call captureSlide().
 */
export function useExportJob(
  exportRootRef: RefObject<ExportRootHandle | null>
) {
  const [state, setState] = useState<ExportJobState>({
    status: "idle",
    progress: 0,
    statusText: "",
  });

  // Abort controller for cancellation
  const abortRef = useRef<AbortController | null>(null);
  // Mutex ref – prevents two concurrent startExport calls
  const isRunningRef = useRef(false);

  // ── startExport ─────────────────────────────────────────────────────────────
  const startExport = useCallback(
    async (opts: StartExportOptions) => {
      if (isRunningRef.current) return; // already running
      if (!exportRootRef.current) {
        console.error("useExportJob: ExportRoot is not mounted");
        return;
      }
      if (opts.slides.length === 0) return;

      isRunningRef.current = true;
      const controller = new AbortController();
      abortRef.current = controller;

      setState({ status: "running", progress: 0, statusText: "Starting export…" });

      try {
        await runExportJob({
          ...opts,
          exportRoot: exportRootRef.current,
          signal: controller.signal,
          onProgress: (index, total, statusText) => {
            setState({
              status: "running",
              progress: total > 0 ? (index / total) * 100 : 0,
              statusText,
            });
          },
        });

        if (!controller.signal.aborted) {
          const count = opts.slides.length;
          setState({
            status: "completed",
            progress: 100,
            statusText: `✓ ${count} slide${count !== 1 ? "s" : ""} exported${opts.asZip ? " as ZIP" : ""}!`,
          });
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Export job failed:", err);
          setState({
            status: "error",
            progress: 0,
            statusText: "Export failed — check console for details",
          });
        }
      } finally {
        isRunningRef.current = false;
      }
    },
    [exportRootRef]
  );

  // ── cancel ──────────────────────────────────────────────────────────────────
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    // State update will be handled once the running job detects abort
    setState({
      status: "cancelled",
      progress: 0,
      statusText: "Export cancelled",
    });
    isRunningRef.current = false;
  }, []);

  // ── reset – bring modal back to idle (user clicked Close) ───────────────────
  const reset = useCallback(() => {
    setState({ status: "idle", progress: 0, statusText: "" });
  }, []);

  return { state, startExport, cancel, reset };
}
