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
import { cn } from "@/lib/utils";

interface HeaderProps {
  slideCount: number;
  onNewSession: () => void;
  saveStatus?: "saved" | "saving" | "error" | null;
  isLoadingSlideshow?: boolean;
  currentSlideshowId?: string | null;
  onSelectProject?: (id: string) => void;
  aspectRatio?: AspectRatio;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function HeaderLogo() {
  return (
    <span className="font-display text-2xl tracking-[2px] shrink-0">
      SLIDE<em className="text-primary not-italic">STUDIO</em>
    </span>
  );
}

interface HeaderCenterMetaProps {
  slideCount: number;
  aspectRatio: AspectRatio;
}

function HeaderCenterMeta({ slideCount, aspectRatio }: HeaderCenterMetaProps) {
  const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];
  const platformLabel =
    aspectRatio === "9:16"
      ? "TIKTOK OPTIMIZED"
      : aspectRatio === "1:1"
      ? "INSTAGRAM / SQUARE"
      : "CLASSIC / PRESENTATION";

  return (
    <div className="hidden lg:flex items-center gap-4 font-mono text-[10px] text-muted-foreground tracking-[1.5px]">
      <span>{slideCount} SLIDES</span>
      <span>·</span>
      <span>{dims.label.toUpperCase()}</span>
      <span>·</span>
      <span>{platformLabel}</span>
    </div>
  );
}

interface SaveStatusBadgeProps {
  saveStatus?: "saved" | "saving" | "error" | null;
  isLoadingSlideshow?: boolean;
}

function SaveStatusBadge({ saveStatus, isLoadingSlideshow }: SaveStatusBadgeProps) {
  if (isLoadingSlideshow) {
    return (
      <span className="text-[11px] text-muted-foreground">Loading...</span>
    );
  }
  if (saveStatus === "saving") {
    return (
      <span className="text-[11px] text-muted-foreground">Saving...</span>
    );
  }
  if (saveStatus === "saved") {
    return (
      <span className="flex items-center gap-1 text-[11px] text-success">
        <Check className="size-3" />
        Saved
      </span>
    );
  }
  if (saveStatus === "error") {
    return (
      <span className="text-[11px] text-destructive">Save failed</span>
    );
  }
  return null;
}

// ── Main component ─────────────────────────────────────────────────────────────

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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <>
      {/* ── App bar ─────────────────────────────────────────────────────────── */}
      <header
        className={cn(
          "h-12 flex items-center justify-between px-5 border-b border-border",
          "shrink-0 bg-background z-50",
          menuOpen && "nav-open"
        )}
      >
        <HeaderLogo />

        <HeaderCenterMeta slideCount={slideCount} aspectRatio={aspectRatio} />

        {/* Desktop right section */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-[3px] text-[9px] font-mono tracking-[1px] bg-cyan-tint text-primary border border-primary/20">
            <Sparkles className="size-3" />
            GEMINI AI
          </span>

          <SaveStatusBadge
            saveStatus={saveStatus}
            isLoadingSlideshow={isLoadingSlideshow}
          />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="cursor-pointer border-none bg-transparent p-0"
                  aria-label="User menu"
                >
                  <CurrentUserAvatar />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 font-mono">
                <DropdownMenuLabel className="font-mono">
                  <span className="text-[11px] text-muted-foreground tracking-[0.5px]">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setProjectSelectorOpen(true)}
                  className="font-mono text-[11px] tracking-[0.5px]"
                >
                  <Folder className="size-4" />
                  Projects
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onNewSession}
                  className="font-mono text-[11px] tracking-[0.5px]"
                >
                  <RotateCcw className="size-4" />
                  New Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleSignOut}
                  className="font-mono text-[11px] tracking-[0.5px]"
                >
                  <LogOut className="size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => router.push("/auth/login")}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-[5px] rounded-[5px]",
                "text-[11px] font-semibold cursor-pointer transition-all",
                "bg-transparent text-muted-foreground border border-border-strong",
                "hover:bg-secondary hover:text-foreground hover:border-border"
              )}
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile / tablet hamburger button */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className={cn(
            "lg:hidden inline-flex items-center justify-center",
            "ml-auto w-8 h-8 rounded-md border border-border-strong",
            "bg-transparent text-muted-foreground cursor-pointer",
            "hover:bg-secondary hover:text-foreground"
          )}
        >
          {/* Animated hamburger lines */}
          <span className="relative flex flex-col items-center justify-center w-4 h-4 gap-[4px]">
            <span
              className={cn(
                "block w-4 h-[2px] rounded-full bg-current transition-all duration-200",
                menuOpen && "translate-y-[6px] rotate-45"
              )}
            />
            <span
              className={cn(
                "block w-4 h-[2px] rounded-full bg-current transition-all duration-200",
                menuOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block w-4 h-[2px] rounded-full bg-current transition-all duration-200",
                menuOpen && "-translate-y-[6px] -rotate-45"
              )}
            />
          </span>
        </button>
      </header>

      {/* ── Mobile drawer overlay ────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-[200] lg:hidden",
          "flex items-stretch justify-end",
          "bg-black/88 transition-opacity duration-[280ms]",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMenuOpen(false);
        }}
      >
        <div
          className={cn(
            "w-[75vw] max-w-[340px] h-full flex flex-col gap-3",
            "bg-card rounded-l-2xl px-[18px] py-5 pb-6",
            "transition-[transform,opacity] duration-300",
            menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          )}
        >
          {/* Close button */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="self-end bg-transparent border-none text-foreground text-[22px] cursor-pointer pb-2"
          >
            ×
          </button>

          {user ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 pb-2 border-b border-border mb-1">
                <CurrentUserAvatar />
                <span className="text-[11px] text-muted-foreground font-mono tracking-[0.5px] flex-1 truncate">
                    {user.email}
                  </span>
              </div>

              {/* Menu items */}
              {[
                { icon: <Folder className="size-4" />, label: "Projects", action: () => { setProjectSelectorOpen(true); setMenuOpen(false); } },
                { icon: <RotateCcw className="size-4" />, label: "New Project", action: () => { onNewSession(); setMenuOpen(false); } },
              ].map(({ icon, label, action }) => (
              <button
                  key={label}
                  onClick={action}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-3 py-[5px] rounded-[5px]",
                    "text-[11px] font-semibold font-mono tracking-[0.5px] cursor-pointer transition-all",
                    "bg-transparent text-muted-foreground border border-border-strong",
                    "hover:bg-secondary hover:text-foreground hover:border-border"
                  )}
                >
                  {icon}
                  {label}
              </button>
              ))}

              <button
                onClick={async () => {
                  await handleSignOut();
                  setMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-3 py-[5px] rounded-[5px]",
                  "text-[11px] font-semibold font-mono tracking-[0.5px] cursor-pointer transition-all",
                  "bg-transparent text-destructive border border-destructive/30",
                  "hover:bg-destructive/10"
                )}
              >
                <LogOut className="size-4" />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => { router.push("/auth/login"); setMenuOpen(false); }}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-3 py-[5px] rounded-[5px]",
                "text-[11px] font-semibold cursor-pointer transition-all",
                "bg-transparent text-muted-foreground border border-border-strong",
                "hover:bg-secondary hover:text-foreground"
              )}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
      
      <ProjectSelector
        isOpen={projectSelectorOpen}
        onClose={() => setProjectSelectorOpen(false)}
        onSelect={(id) => onSelectProject?.(id)}
        onCreateNew={onNewSession}
        currentSlideshowId={currentSlideshowId ?? null}
      />
    </>
  );
}
