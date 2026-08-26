/** Shared by ScrollToTop.tsx (route-to-route navigation) and any nav link
 * that needs to reset scroll on a same-route click (pathname doesn't change
 * in that case, so ScrollToTop's own pathname-keyed effect never fires). */
export function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}
