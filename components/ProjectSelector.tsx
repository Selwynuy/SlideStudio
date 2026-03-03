"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSlideshow, updateSlideshow } from "@/lib/slideshows";
import { useProjects } from "@/contexts/ProjectsContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil, Trash2, Check, X } from "lucide-react";

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
  const { projects: slideshows, isLoading, error, removeProject, renameProject } = useProjects();

  // Inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isSavingRename, setIsSavingRename] = useState(false);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this slideshow?")) {
      return;
    }
    try {
      await deleteSlideshow(id);
      removeProject(id);
      if (id === currentSlideshowId) {
        onCreateNew();
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete slideshow");
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
    } catch (err: any) {
      alert(err.message || "Failed to rename slideshow");
    } finally {
      setIsSavingRename(false);
    }
  }

  function handleSelect(id: string) {
    if (editingId) return; // don't navigate while editing
    onSelect(id);
    router.push(`/?id=${id}`);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="modal-bg open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card style={{ maxWidth: "600px", width: "90vw", maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>Select a slideshow to open or create a new one</CardDescription>
        </CardHeader>
        <CardContent style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {isLoading && <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>Loading...</div>}
          {error && <div style={{ color: "var(--red)", padding: "10px", marginBottom: "10px" }}>{error}</div>}

          {!isLoading && !error && (
            <>
              <Button
                onClick={() => {
                  onCreateNew();
                  onClose();
                }}
                className="w-full mb-4"
              >
                + New Project
              </Button>

              {slideshows.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No projects yet. Create your first one!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {slideshows.map((slideshow) => (
                    <div
                      key={slideshow.id}
                      onClick={() => handleSelect(slideshow.id)}
                      style={{
                        padding: "12px",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        cursor: editingId === slideshow.id ? "default" : "pointer",
                        background: slideshow.id === currentSlideshowId ? "var(--cyan-dim)" : "var(--bg3)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (slideshow.id !== currentSlideshowId && editingId !== slideshow.id) {
                          e.currentTarget.style.background = "var(--bg4)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (slideshow.id !== currentSlideshowId) {
                          e.currentTarget.style.background =
                            slideshow.id === currentSlideshowId ? "var(--cyan-dim)" : "var(--bg3)";
                        }
                      }}
                    >
                      {/* Title / inline edit */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {editingId === slideshow.id ? (
                          <input
                            autoFocus
                            className="ctrl-select"
                            style={{ width: "100%", padding: "4px 8px", fontSize: "13px" }}
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(slideshow.id, e as any);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            maxLength={100}
                          />
                        ) : (
                          <>
                            <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {slideshow.title}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              {new Date(slideshow.updated_at).toLocaleDateString()}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        {editingId === slideshow.id ? (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Save"
                              onClick={(e) => saveEdit(slideshow.id, e)}
                              disabled={isSavingRename || !editingTitle.trim()}
                            >
                              <Check className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Cancel"
                              onClick={(e) => cancelEdit(e)}
                            >
                              <X className="size-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Rename"
                              onClick={(e) => startEdit(slideshow.id, slideshow.title, e)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Delete"
                              onClick={(e) => handleDelete(slideshow.id, e)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
