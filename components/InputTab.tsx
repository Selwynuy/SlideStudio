"use client";

import { cn } from "@/lib/utils";
import { CtrlSection, CtrlLabel, CtrlSelect, Toggle } from "./editor-primitives";

// ── Types ──────────────────────────────────────────────────────────────────────

interface GenerationSettings {
  rawText: string;
  tone: string;
  complexity: string;
  maxSlides: number;
  focus: string;
  hook: boolean;
}

interface InputTabProps {
  generateSlides: (isBatch: boolean) => Promise<void>;
  isLoading: boolean;
  settings: GenerationSettings;
  setRawText: (value: string) => void;
  setTone: (value: string) => void;
  setComplexity: (value: string) => void;
  setMaxSlides: (value: number) => void;
  setFocus: (value: string) => void;
  setHook: (value: boolean) => void;
  sourceText: string;
  batchOffset: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function InputTab({
  generateSlides,
  isLoading,
  settings,
  setRawText,
  setTone,
  setComplexity,
  setMaxSlides,
  setFocus,
  setHook,
  sourceText,
  batchOffset,
}: InputTabProps) {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Raw content */}
      <CtrlSection>
        <CtrlLabel>Raw Content</CtrlLabel>
        <textarea
          className={cn(
            "w-full min-h-[140px] resize-y",
            "bg-secondary border border-border rounded-md",
            "text-foreground font-sans text-[12px] leading-[1.6]",
            "px-3 py-2.5 outline-none transition-colors",
            "placeholder:text-text-subtle",
            "focus:border-primary"
          )}
          placeholder={"Paste blog post, HTB writeup, script, notes, transcript…\n\nAI will intelligently split it into clean term-and-definition slides."}
          rows={7}
          value={settings.rawText}
          onChange={(e) => setRawText(e.target.value)}
        />

        {sourceText && (
          <div className={cn(
            "mt-2 px-3 py-2.5 rounded-md flex items-center justify-between gap-2",
            "bg-secondary border border-border text-[11px] text-muted-foreground"
          )}>
            <span>
              Batch{" "}
              <strong className="text-foreground">
                {Math.ceil(batchOffset / 4000)}
              </strong>{" "}
              ·{" "}
              <strong className="text-foreground">
                {Math.round((batchOffset / sourceText.length) * 100)}%
              </strong>{" "}
              processed
            </span>
          </div>
        )}
      </CtrlSection>

      {/* Generation settings */}
      <CtrlSection>
        <CtrlLabel>Generation Settings</CtrlLabel>
        <div className="grid grid-cols-2 gap-2">
          <CtrlField label="Tone">
            <CtrlSelect value={settings.tone} onChange={(e) => setTone(e.target.value)}>
              <option value="educational">Educational</option>
              <option value="conversational">Conversational</option>
              <option value="motivational">Motivational</option>
              <option value="analytical">Analytical</option>
              <option value="casual">Casual</option>
            </CtrlSelect>
          </CtrlField>
          <CtrlField label="Complexity">
            <CtrlSelect value={settings.complexity} onChange={(e) => setComplexity(e.target.value)}>
              <option value="simple">Simple</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </CtrlSelect>
          </CtrlField>
          <CtrlField label="Slides per Batch">
            <CtrlSelect
              value={settings.maxSlides}
              onChange={(e) => setMaxSlides(parseInt(e.target.value))}
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </CtrlSelect>
          </CtrlField>
          <CtrlField label="Focus">
            <CtrlSelect value={settings.focus} onChange={(e) => setFocus(e.target.value)}>
              <option value="key_points">Key Points</option>
              <option value="tips">Tips &amp; Advice</option>
              <option value="facts">Facts &amp; Stats</option>
              <option value="steps">Steps / How-To</option>
              <option value="terms">Terms &amp; Defs</option>
            </CtrlSelect>
          </CtrlField>
        </div>
      </CtrlSection>

      {/* Hook toggle */}
      <CtrlSection>
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-[12px] text-foreground font-medium">Hook Slide</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Auto-generate attention-grabbing opener
            </div>
          </div>
          <Toggle checked={settings.hook} onChange={setHook} />
        </div>
      </CtrlSection>

      {/* Generate actions */}
      <div className="px-3.5 py-3 flex flex-col gap-2">
        {isLoading && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-2.5 rounded-md",
            "bg-primary/8 border border-primary/20 text-[11px] text-primary font-mono"
          )}>
            <AiDots />
            <span>Generating slides…</span>
          </div>
        )}

        <button
          onClick={() => generateSlides(false)}
          disabled={isLoading}
          className={cn(
            "w-full flex items-center justify-center px-3 py-[11px] rounded-md",
            "text-[12px] font-bold cursor-pointer transition-all",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 hover:-translate-y-px hover:shadow-[0_4px_16px_var(--cyan-glow)]",
            "active:translate-y-0",
            "disabled:opacity-35 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          )}
        >
          {isLoading ? "Generating..." : "✦ Generate Slides"}
        </button>

        <button
          onClick={() => generateSlides(true)}
          disabled={isLoading || !sourceText}
          className={cn(
            "w-full flex items-center justify-center px-3 py-[7px] rounded-md",
            "text-[11px] font-semibold cursor-pointer transition-all",
            "bg-transparent text-muted-foreground border border-border-strong",
            "hover:bg-secondary hover:text-foreground hover:border-border",
            "disabled:opacity-35 disabled:cursor-not-allowed"
          )}
        >
          + Generate More from Same Content
        </button>
      </div>
    </div>
  );
}

// ── Local helper components ───────────────────────────────────────────────────

function CtrlField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-mono text-[9px] tracking-[1px] uppercase text-muted-foreground mb-[5px]">
        {label}
      </label>
      {children}
    </div>
  );
}

function AiDots() {
  return (
    <div className="flex gap-[3px]">
      {[0, 200, 400].map((delay) => (
        <span
          key={delay}
          className="w-[5px] h-[5px] rounded-full bg-primary"
          style={{ animation: `dotpulse 1.2s ${delay}ms infinite ease-in-out` }}
        />
      ))}
    </div>
  );
}
