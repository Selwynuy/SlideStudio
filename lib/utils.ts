import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Slide } from "@/types/slide"

/**
 * Merge Tailwind class strings, resolving conflicts intelligently.
 * Primary utility for conditional/variant className composition.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Create a new Slide with sensible defaults.
 * Accepts a partial override object so callers can apply text/bg masters
 * without repeating the full default shape.
 */
export function createDefaultSlide(overrides: Partial<Slide> = {}): Slide {
  return {
    id: Date.now().toString(),
    type: "normal",
    title: "New Slide",
    description: "Tap to edit this description.",
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
    showSlideNumber: true,
    ...overrides,
  }
}

/**
 * Zero-pad a number to two digits for slide numbering, e.g. 1 → "01".
 */
export function formatSlideNum(n: number): string {
  return String(n).padStart(2, "0")
}

/**
 * Sanitize an arbitrary string for safe use as a filename.
 * Replaces non-alphanumeric characters with underscores and lowercases.
 */
export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, "_").toLowerCase()
}

/**
 * Maps a logical font key to a CSS font-family string.
 * Used by both RenderedSlide (preview) and renderSlideHtml (export) to ensure consistency.
 */
export function resolveFontFamily(key: string | undefined, fallback: "display" | "body"): string {
  if (key === "jakarta") return "'Plus Jakarta Sans', sans-serif";
  if (key === "mono") return "'JetBrains Mono', monospace";
  if (key === "bebas") return "'Bebas Neue', sans-serif";
  // Default: bebas for titles, jakarta for body
  return fallback === "display" ? "'Bebas Neue', sans-serif" : "'Plus Jakarta Sans', sans-serif";
}
