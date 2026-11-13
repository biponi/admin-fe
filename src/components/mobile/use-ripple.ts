import { useCallback } from "react";

/**
 * Material-style ripple: stamps the tap point into CSS custom properties and
 * toggles the `.is-rippling` class, which drives the `m3-ripple-out` keyframes
 * defined in index.scss. Attach via `{...getRippleProps()}` on any element
 * carrying the `m3-ripple` class. CSS honors prefers-reduced-motion.
 */
export function useRipple() {
  return useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--ripple-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--ripple-y", `${e.clientY - rect.top}px`);
    el.classList.remove("is-rippling");
    // Force a reflow so a repeated tap restarts the animation.
    void el.offsetWidth;
    el.classList.add("is-rippling");
    window.setTimeout(() => el.classList.remove("is-rippling"), 500);
  }, []);
}

/** Non-hook variant for shared component props (one closure per component). */
export function rippleProps() {
  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--ripple-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--ripple-y", `${e.clientY - rect.top}px`);
    el.classList.remove("is-rippling");
    void el.offsetWidth;
    el.classList.add("is-rippling");
    window.setTimeout(() => el.classList.remove("is-rippling"), 500);
  };
  return { onPointerDown };
}
