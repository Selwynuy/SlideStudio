"use client";

import { Slide } from "@/types/slide";
import React from "react";

interface SlideListProps {
  slides: Slide[];
  activeIdx: number | null;
  setActiveIdx: (idx: number) => void;
  onAddSlide: () => void;
  onMoveSlide: (index: number, direction: "up" | "down") => void;
  onDeleteSlide: (index: number) => void;
}

export default function SlideList({
  slides,
  activeIdx,
  setActiveIdx,
  onAddSlide,
  onMoveSlide,
  onDeleteSlide,
}: SlideListProps) {
  return (
    <div className="panel-left">
      <div className="panel-left-header">
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--text-muted)",
            letterSpacing: "1px",
          }}
        >
          SLIDES
        </span>
      </div>
      <div className="slide-list-scroll" id="slideListScroll">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`slide-thumb ${s.type === "hook" ? "hook-thumb" : ""} ${
              i === activeIdx ? "active" : ""
            }`}
            onClick={() => setActiveIdx(i)}
          >
            <div className="slide-thumb-num">
              {String(i + 1).padStart(2, "0")}
              {s.type === "hook" && <span className="hook-badge">HOOK</span>}
            </div>
            <div className="slide-thumb-title">{s.title || "(untitled)"}</div>
            <div className="slide-thumb-desc">{s.description}</div>
            <div className="thumb-actions">
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveSlide(i, "up");
                }}
                title="Up"
              >
                ↑
              </button>
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveSlide(i, "down");
                }}
                title="Down"
              >
                ↓
              </button>
              <button
                className="icon-btn del"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSlide(i);
                }}
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        <button className="add-slide-btn-list" onClick={onAddSlide}>
          + Add Slide
        </button>
      </div>
    </div>
  );
}