"use client";

import { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  type: "ok" | "err" | "";
  onHide: () => void;
}

export default function Toast({ message, type, onHide }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onHide();
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [message, onHide]);

  if (!message) return null;

  return (
    <div className={`toast ${type} ${show ? "show" : ""}`}>{message}</div>
  );
}
