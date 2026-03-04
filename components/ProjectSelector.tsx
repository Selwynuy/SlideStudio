"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSlideshow, updateSlideshow } from "@/lib/slideshows";
import { useProjects } from "@/contexts/ProjectsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModalBackdrop } from "./ConfirmModal";

interface ProjectSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  currentSlideshowId: string | null;
}

export default function ProjectSelector({
  isOpen,
  onClose,
  onSelect,
  onCreateNew,
  currentSlideshowId,
}: ProjectSelectorProps) {
  const router = useRouter();
  const { projects, isLoading, error, removeProject, renameProject } = useProjects();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isSavingRename, setIsSavingRename] = useState(false);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this slideshow?")) return;
    try {
      await deleteSlideshow(id);
      removeProject(id);
      if (id === currentSlideshowId) onCreateNew();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete slideshow");
    }
  }

  function startEdit(id: string, currentTitle: string, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(currentTitle);
  }

  function cancelEdit(e?: React.MouseEvent) {
    e?.stopPropagation();
    setEditingId(null);
    setEditingTitle("");
  }

  async function saveEdit(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const trimmed = editingTitle.trim();
    if (!trimmed) return;
    setIsSavingRename(true);
    try {
      await updateSlideshow(id, { title: trimmed });
      renameProject(id, trimmed);
      setEditingId(null);
      setEditingTitle("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to rename slideshow");
    } finally {
      setIsSavingRename(false);
    }
  }

  function handleSelect(id: string) {
    if (editingId) return;
    onSelect(id);
    router.push(`/?id=${id}`);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <ModalBackdrop onClickOutside={onClose}>
      <Card className="max-w-[600px] w-[90vw] max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>Select a slideshow to open or create a new one</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <p className="text-center py-5 text-muted-foreground text-[13px]">Loading...</p>
          )}
          {error && (
            <p className="text-destructive text-[12px] p-2.5 mb-2.5 rounded-md bg-destructive/10 border border-destructive/25">
              {error}
            </p>
          )}

          {!isLoading && !error && (
            <>
              <Button
                onClick={() => { onCreateNew(); onClose(); }}
                className="w-full mb-4"
              >
                + New Project
              </Button>

              {projects.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground text-[13px]">
                  No projects yet. Create your first one!
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {projects.map((slideshow) => (
                    <SlideshowRow
                      key={slideshow.id}
                      slideshow={slideshow}
                      isCurrent={slideshow.id === currentSlideshowId}
                      isEditing={editingId === slideshow.id}
                      editingTitle={editingTitle}
                      isSavingRename={isSavingRename}
                      onSelect={() => handleSelect(slideshow.id)}
                      onStartEdit={(e) => startEdit(slideshow.id, slideshow.title, e)}
                      onCancelEdit={cancelEdit}
                      onSaveEdit={(e) => saveEdit(slideshow.id, e)}
                      onDelete={(e) => handleDelete(slideshow.id, e)}
                      onEditTitleChange={setEditingTitle}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </ModalBackdrop>
  );
}

// ── Row component ─────────────────────────────────────────────────────────────

interface SlideshowRowProps {
  slideshow: { id: string; title: string; updated_at: string };
  isCurrent: boolean;
  isEditing: boolean;
  editingTitle: string;
  isSavingRename: boolean;
  onSelect: () => void;
  onStartEdit: (e: React.MouseEvent) => void;
  onCancelEdit: (e?: React.MouseEvent) => void;
  onSaveEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onEditTitleChange: (v: string) => void;
}

function SlideshowRow({
  slideshow,
  isCurrent,
  isEditing,
  editingTitle,
  isSavingRename,
  onSelect,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onEditTitleChange,
}: SlideshowRowProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 p-3 rounded-md border transition-all",
        isEditing ? "cursor-default" : "cursor-pointer",
        isCurrent
          ? "border-primary bg-cyan-tint"
          : "border-border bg-secondary hover:border-border-strong hover:bg-surface-raised"
      )}
    >
      {/* Title / inline edit */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            autoFocus
            className={cn(
              "w-full bg-card border border-primary rounded-md",
              "text-foreground font-sans text-[13px] px-2 py-1",
              "outline-none"
            )}
            value={editingTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit(e as unknown as React.MouseEvent);
              if (e.key === "Escape") onCancelEdit();
            }}
            onClick={(e) => e.stopPropagation()}
            maxLength={100}
          />
        ) : (
          <>
            <div className="font-semibold text-[13px] text-foreground truncate">
              {slideshow.title}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {new Date(slideshow.updated_at).toLocaleDateString()}
            </div>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-1 shrink-0">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              size="icon"
              title="Save rename"
              onClick={onSaveEdit}
              disabled={isSavingRename || !editingTitle.trim()}
            >
              <Check className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Cancel rename"
              onClick={(e) => onCancelEdit(e)}
            >
              <X className="size-4" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="icon" title="Rename" onClick={onStartEdit}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="outline" size="icon" title="Delete" onClick={onDelete}>
              <Trash2 className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
