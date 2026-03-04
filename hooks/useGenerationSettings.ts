/**
 * useGenerationSettings
 *
 * Encapsulates the six generation-settings state variables so HomeContent
 * doesn't grow unboundedly. Each value plus its setter is returned together
 * to keep the consumer's import list small.
 */
"use client";

import { useState } from "react";

export interface GenerationSettings {
  rawText: string;
  tone: string;
  complexity: string;
  maxSlides: number;
  focus: string;
  hook: boolean;
}

export interface GenerationSettingsHandlers {
  setRawText: (v: string) => void;
  setTone: (v: string) => void;
  setComplexity: (v: string) => void;
  setMaxSlides: (v: number) => void;
  setFocus: (v: string) => void;
  setHook: (v: boolean) => void;
}

/** Default generation settings values. */
export const DEFAULT_GENERATION_SETTINGS: GenerationSettings = {
  rawText: "",
  tone: "educational",
  complexity: "intermediate",
  maxSlides: 8,
  focus: "key_points",
  hook: true,
};

export function useGenerationSettings(initial: Partial<GenerationSettings> = {}) {
  const merged = { ...DEFAULT_GENERATION_SETTINGS, ...initial };

  const [rawText, setRawText] = useState(merged.rawText);
  const [tone, setTone] = useState(merged.tone);
  const [complexity, setComplexity] = useState(merged.complexity);
  const [maxSlides, setMaxSlides] = useState(merged.maxSlides);
  const [focus, setFocus] = useState(merged.focus);
  const [hook, setHook] = useState(merged.hook);

  const settings: GenerationSettings = {
    rawText, tone, complexity, maxSlides, focus, hook,
  };

  const handlers: GenerationSettingsHandlers = {
    setRawText, setTone, setComplexity, setMaxSlides, setFocus, setHook,
  };

  return { settings, handlers };
}
