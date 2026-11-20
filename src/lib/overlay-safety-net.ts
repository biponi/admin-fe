// Safety net for leaked scroll-locks. While a Radix/vaul modal overlay is open,
// react-remove-scroll holds `body { pointer-events: none }` (attribute
// `data-scroll-locked`); it is released when the overlay's React component
// unmounts. Several legacy cleanup hacks in this app rip portals out of the DOM
// behind React's back (`el.remove()`), so that unmount never happens and the
// lock leaks — the whole page stays unclickable until refresh.
//
// If a lock leaks (body stuck with NO overlay actually open), the first tap
// unfreezes the app and re-delivers that tap as a click. It never fights a
// legitimate lock: it bails whenever any portaled overlay is genuinely open.
import { useEffect } from "react";

// NOTE: Radix's Portal primitive adds NO attribute in the installed versions
// (verified: zero hits for `data-radix-portal` in node_modules), so portal
// membership is detected via the popper wrapper that all floating content
// (popover/select/dropdown) renders inside. Dialogs/Sheets/Drawers are
// detected via role="dialog" + data-state (set by react-dialog and vaul).
const PORTAL_ROOT_SELECTOR = "[data-radix-popper-content-wrapper], [data-vaul-drawer], [data-vaul-overlay]";

const OPEN_OVERLAY_SELECTOR = [
  "[data-radix-popper-content-wrapper]",
  "[role='dialog'][data-state='open']",
  "[data-vaul-drawer][data-state='open']",
  "[data-vaul-overlay][data-state='open']",
].join(",");

export function useOverlaySafetyNet() {
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      // A tap inside a portal is overlay interaction — never touch the lock.
      const target = e.target as Element | null;
      if (target?.closest?.(PORTAL_ROOT_SELECTOR)) return;

      const stuck =
        document.body.style.pointerEvents === "none" ||
        document.body.hasAttribute("data-scroll-locked");
      if (!stuck) return;

      // Body is locked but no overlay is visibly open — the lock leaked.
      if (document.querySelector(OPEN_OVERLAY_SELECTOR)) return;

      document.body.style.removeProperty("pointer-events");
      document.body.style.removeProperty("overflow");
      document.body.removeAttribute("data-scroll-locked");

      // Re-deliver the tap the user just lost (click only — re-dispatching
      // pointer/mouse events would double-trigger Radix outside-dismiss).
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el && el !== target) {
        el.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            clientX: e.clientX,
            clientY: e.clientY,
          })
        );
      }
    };
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);
}
