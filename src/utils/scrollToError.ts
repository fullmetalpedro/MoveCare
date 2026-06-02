/**
 * Smoothly scrolls the first invalid field (marked with `.has-error`) to the
 * vertical center of the viewport — or as close to the center as possible.
 * Runs after the next paint so the error classes are already in the DOM.
 */
export function scrollToFirstError() {
  requestAnimationFrame(() => {
    const el = document.querySelector(".has-error");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}
