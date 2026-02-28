"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CurrentUserAvatar } from "./current-user-avatar";
import ProjectSelector from "./ProjectSelector";
import { useUser } from "@/contexts/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Folder, RotateCcw, LogOut, Sparkles, Check } from "lucide-react";
import { AspectRatio, ASPECT_RATIO_DIMENSIONS } from "@/types/slide";

interface HeaderProps {
  slideCount: number;
  onNewSession: () => void;
  saveStatus?: "saved" | "saving" | "error" | null;
  isLoadingSlideshow?: boolean;
  currentSlideshowId?: string | null;
  onSelectProject?: (id: string) => void;
  aspectRatio?: AspectRatio;
}

export default function Header({
  slideCount,
  onNewSession,
  saveStatus,
  isLoadingSlideshow,
  currentSlideshowId,
  onSelectProject,
  aspectRatio = "9:16",
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  return (
    <>
      <header className={menuOpen ? "nav-open" : ""}>
        <div className="logo">
          SLIDE<em>STUDIO</em>
        </div>

        <div className="hdr-center">
          <span id="slideCountBadge">{slideCount} SLIDES</span>
          <span>·</span>
          <span>{ASPECT_RATIO_DIMENSIONS[aspectRatio].label.toUpperCase()}</span>
          <span>·</span>
          <span>{aspectRatio === "9:16" ? "TIKTOK OPTIMIZED" : aspectRatio === "1:1" ? "INSTAGRAM / SQUARE" : "CLASSIC / PRESENTATION"}</span>
        </div>

        {/* Desktop-only right section */}
        <div className="hdr-right hdr-right-desktop">
          <span className="hdr-badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles className="size-3" />
            GEMINI AI
          </span>
          {saveStatus === "saving" && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span style={{ fontSize: '11px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check className="size-3" />
              Saved
            </span>
          )}
          {saveStatus === "error" && (
            <span style={{ fontSize: '11px', color: 'var(--red)' }}>Save failed</span>
          )}
          {isLoadingSlideshow && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Loading...</span>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{ cursor: 'pointer', border: 'none', background: 'transparent', padding: 0 }}
                  aria-label="User menu"
                >
                  <CurrentUserAvatar />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <DropdownMenuLabel style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                    {user.email}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setProjectSelectorOpen(true);
                  }}
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.5px' }}
                >
                  <Folder className="size-4" />
                  Projects
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onNewSession();
                  }}
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.5px' }}
                >
                  <RotateCcw className="size-4" />
                  New Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    router.push('/auth/login');
                    router.refresh();
                  }}
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.5px' }}
                >
                  <LogOut className="size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push('/auth/login')}
              title="Sign in"
            >
              Sign In
            </button>
          )}
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
          {user && (
            <>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '8px 0', 
                borderBottom: '1px solid var(--border)', 
                marginBottom: '8px'
              }}>
                <CurrentUserAvatar />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.5px' }}>
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm hdr-menu-item"
                onClick={() => {
                  setProjectSelectorOpen(true);
                  setMenuOpen(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.5px' }}
              >
                <Folder className="size-4" />
                Projects
              </button>
              <button
                className="btn btn-ghost btn-sm hdr-menu-item"
                onClick={() => {
                  onNewSession();
                  setMenuOpen(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.5px' }}
              >
                <RotateCcw className="size-4" />
                New Project
              </button>
              <button
                className="btn btn-ghost btn-sm hdr-menu-item"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.push('/auth/login');
                  router.refresh();
                  setMenuOpen(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.5px', color: 'var(--red)' }}
              >
                <LogOut className="size-4" />
                Sign Out
              </button>
            </>
          )}
          {!user && (
            <button
              className="btn btn-ghost btn-sm hdr-menu-item"
              onClick={() => {
                router.push('/auth/login');
                setMenuOpen(false);
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
      
      <ProjectSelector
        isOpen={projectSelectorOpen}
        onClose={() => setProjectSelectorOpen(false)}
        onSelect={(id) => {
          if (onSelectProject) onSelectProject(id);
        }}
        onCreateNew={onNewSession}
        currentSlideshowId={currentSlideshowId || null}
      />
    </>
  );
}