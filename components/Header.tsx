"use client";

interface HeaderProps {
  slideCount: number;
  onNewSession: () => void;
}

export default function Header({
  slideCount,
  onNewSession,
}: HeaderProps) {
  return (
    <header>
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

      <div className="hdr-right">
        <span className="hdr-badge badge-cyan">✦ GEMINI AI</span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onNewSession}
          title="Clear all slides and reset the workspace"
        >
          ↺ New Session
        </button>
      </div>
    </header>
  );
}