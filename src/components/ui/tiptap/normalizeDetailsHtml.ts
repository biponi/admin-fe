/**
 * Normalize <details> blocks to the canonical TipTap format.
 * Converts attribute-less <details><summary>Q</summary>BODY</details>
 * into <details><summary>Q</summary><div data-type="detailsContent">BODY</div></details>.
 * Idempotent — safe to run multiple times. Used as a defense in depth
 * so even if the LLM omits the wrapper div, we can still round-trip.
 *
 * @param html - The HTML string to normalize
 * @returns Normalized HTML
 */
export function normalizeDetailsHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  // Match <details>...</details> blocks. If the inner content already contains
  // a div[data-type="detailsContent"], skip. Otherwise, split at </summary>
  // and wrap everything after it in the canonical div.
  return html.replace(/<details([^>]*)>([\s\S]*?)<\/details>/gi, (match, attrs, inner) => {
    // Already in canonical form? Skip.
    if (/<div[^>]+data-type\s*=\s*["']detailsContent["']/i.test(inner)) {
      return match;
    }
    // Split at the closing </summary> tag
    const summaryEnd = inner.match(/^([\s\S]*?<\/summary>)([\s\S]*)$/i);
    if (!summaryEnd) return match; // No <summary> found — leave for tag-dropper
    const [, beforeSummary, afterSummary] = summaryEnd;
    return `<details${attrs}>${beforeSummary}<div data-type="detailsContent">${afterSummary}</div></details>`;
  });
}
