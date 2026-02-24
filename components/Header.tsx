"use client";

interface HeaderProps {
  slideCount: number;
  onNewSession: () => void;
  onToggleTheme: () => void;
}

export default function Header({
  slideCount,
  onNewSession,
  onToggleTheme,
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
          id="themeToggleBtn"
          onClick={onToggleTheme}
          title="Toggle light/dark mode"
          style={{ padding: "5px 10px", fontSize: "16px", lineHeight: "1" }}
        >
          🌙
        </button>
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