import { useEffect, useRef } from "react";
import type { RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared Modal/Drawer keyboard behavior (neither is built on the other, so
 * this is the one place both reuse it): traps Tab/Shift+Tab within the
 * dialog, closes on Escape, moves focus into the dialog on open, and
 * restores it to whatever triggered the dialog on close. `onClose` is read
 * from a ref rather than a hook dependency so passing a fresh inline
 * function every render (the common call pattern here) never re-focuses
 * the dialog mid-interaction — only `active` toggling does. `busy` (also
 * ref-read, same reason) suppresses Escape-to-close while an async
 * confirmation action is in flight.
 */
export function useDialogA11y(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onClose: () => void,
  busy = false
) {
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useEffect(() => {
    if (!active) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const node = ref.current;
    const focusables = node ? Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];
    (focusables[0] ?? node)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (busyRef.current) return;
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [active, ref]);
}
