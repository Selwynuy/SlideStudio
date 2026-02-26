"use client";

import { useState } from "react";
import { Slide } from "@/types/slide";
import SlideList from "./SlideList";

interface HeaderProps {
  slideCount: number;
  onNewSession: () => void;
  slides: Slide[];
  activeIdx: number | null;
  setActiveIdx: (idx: number) => void;
  onAddSlide: () => void;
  onMoveSlide: (index: number, direction: "up" | "down") => void;
  onDeleteSlide: (index: number) => void;
}

export default function Header({
  slideCount,
  onNewSession,
  slides,
  activeIdx,
  setActiveIdx,
  onAddSlide,
  onMoveSlide,
  onDeleteSlide,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className={menuOpen ? "nav-open" : ""}>
        <div className="logo">
          SLIDE<em>STUDIO</em>
        </div>

        <div className="hdr-center">
          <span id="slideCountBadge">{slideCount} SLIDES</span>
          <span>·</span>
          <span>9:16 VERTICAL</span>
          <span>·</span>
          <span>TIKTOK OPTIMIZED</span>
        </div>

        {/* Desktop-only right section */}
        <div className="hdr-right hdr-right-desktop">
          <span className="hdr-badge badge-cyan">✦ GEMINI AI</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onNewSession}
            title="Clear all slides and reset the workspace"
          >
            ↺ New Session
          </button>
        </div>

        <button
          type="button"
          className="hdr-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="hdr-toggle-lines" />
        </button>
      </header>

      {/* Mobile full-vertical overlay menu (only New Session) */}
      <div
        className={`hdr-menu-overlay${menuOpen ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setMenuOpen(false);
          }
        }}
      >
        <div className="hdr-menu">
          <button
            type="button"
            className="hdr-menu-close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            ×
          </button>
          <button
            className="btn btn-ghost btn-sm hdr-menu-item"
            onClick={() => {
              onNewSession();
              setMenuOpen(false);
            }}
          >
            ↺ New Session
          </button>
          <div className="hdr-menu-section-label">Slides</div>
          <SlideList
            slides={slides}
            activeIdx={activeIdx}
            setActiveIdx={(idx) => {
              setActiveIdx(idx);
              setMenuOpen(false);
            }}
            onAddSlide={onAddSlide}
            onMoveSlide={onMoveSlide}
            onDeleteSlide={onDeleteSlide}
          />
        </div>
      </div>
    </>
  );
}