"use client";

import { useRouter } from "next/navigation";
import { deleteSlideshow } from "@/lib/slideshows";
import { useProjects } from "@/contexts/ProjectsContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const { projects: slideshows, isLoading, error, refreshProjects } = useProjects();

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this slideshow?")) {
      return;
    }

    try {
      await deleteSlideshow(id);
      // Refresh projects list after deletion
      await refreshProjects();
      if (id === currentSlideshowId) {
        onCreateNew();
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete slideshow");
    }
  }

  function handleSelect(id: string) {
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
                        cursor: "pointer",
                        background: slideshow.id === currentSlideshowId ? "var(--cyan-dim)" : "var(--bg3)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (slideshow.id !== currentSlideshowId) {
                          e.currentTarget.style.background = "var(--bg4)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (slideshow.id !== currentSlideshowId) {
                          e.currentTarget.style.background = "var(--bg3)";
                        }
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
                          {slideshow.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {new Date(slideshow.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDelete(slideshow.id, e)}
                        style={{ marginLeft: "8px" }}
                      >
                        Delete
                      </Button>
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
