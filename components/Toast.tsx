"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type: "ok" | "err" | "";
  onHide: () => void;
}

export default function Toast({ message, type, onHide }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!message) return;
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      onHide();
    }, 2800);
    return () => clearTimeout(timer);
  }, [message, onHide]);

  if (!message) return null;

  return (
    <div
      className={cn(
        // Positioning & shape
        "fixed bottom-5 left-1/2 z-[999]",
        "px-[18px] py-[9px] rounded-md whitespace-nowrap",
        // Typography
        "font-mono text-[12px]",
        // Background / border
        "bg-bg-panel border",
        // Animation: slide up with spring
        "transition-transform duration-[280ms] cubic-bezier(0.34,1.56,0.64,1)",
        show ? "-translate-x-1/2 translate-y-0" : "-translate-x-1/2 translate-y-[60px]",
        // Variant colours
        type === "ok" && "text-green-400 border-green-400/25",
        type === "err" && "text-destructive border-destructive/25",
        !type && "text-foreground border-border"
      )}
    >
      {message}
    </div>
  );
}
