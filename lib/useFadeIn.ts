"use client";
import { useEffect, useRef } from "react";

/**
 * Adds 'visible' class to the returned ref element when it enters the viewport.
 * Works with the .fade-in CSS class defined in globals.css.
 */
export function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll(".fade-in").forEach((child) =>
            child.classList.add("visible")
          );
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
