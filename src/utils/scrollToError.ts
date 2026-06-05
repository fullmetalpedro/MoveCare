/**
 * Smoothly scrolls the first invalid field (marked with `.has-error`) to the
 * vertical center of the viewport — or as close to center as possible.
 *
 * Deferred to the next animation frame so that error class updates applied
 * during `setState` are already flushed to the DOM before the query runs.
 *
 * @returns `void` — the scroll is a side effect.
 *
 * @example
 * const errors = validatePatientForm(form);
 * if (Object.keys(errors).length > 0) {
 *   setErrors(errors);
 *   scrollToFirstError();
 * }
 */
export function scrollToFirstError() {
  requestAnimationFrame(() => {
    const el = document.querySelector(".has-error");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}
