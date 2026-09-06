import type { Variant } from "../../versus/variant.js";

/**
 * Where a look opens, and how a page links to it.
 *
 * **Nothing on the VERSUS tab draws a candidate any more.** Every open
 * candidate used to animate two 380 × 820 renderers at once, all of them on
 * one page, and nine candidates meant eighteen live phones stepping eighteen
 * worlds before anybody had decided which one they came to look at. That is
 * the owner's complaint the whole split answers: the tab is a list of doors,
 * and a look costs a browser something only once somebody opens it.
 *
 * One extra page carries both kinds of door — `versus.html`, routed by its
 * query string in `versus-app.ts` — rather than one HTML file per kind. It is
 * the same page furniture either way, and a second entrypoint is a second
 * route in `server.ts` and a second line in `build.ts` forever.
 *
 * The link is written `versus.html?…`, relative and with the extension on it,
 * because the director ships two ways: `server.ts` answers `/versus` and
 * `/versus.html` from the working tree, and `build.ts` writes a plain
 * `dist/versus.html` a static host serves under its own name and nothing
 * else. A bare `/versus` would work in development and 404 in the build.
 */
export const VERSUS_PAGE = "versus.html";

/** One candidate, alone, live, at phone size. */
export function candidateUrl(variant: Variant): string {
  const query = new URLSearchParams({ slot: variant.slot, name: variant.name });
  return `${VERSUS_PAGE}?${query.toString()}`;
}

/** The baked animations — every PNG, APNG and WebP example, and the field
 * they are judged on. */
export function animationsUrl(): string {
  return `${VERSUS_PAGE}?page=animations`;
}

/**
 * A new tab, never this one. `noopener` because the opened page has no
 * business reaching back into the editor that opened it, and a director with
 * unsaved waves in it is exactly the tab you do not want navigated away.
 */
export function openInNewTab(url: string): void {
  window.open(url, "_blank", "noopener");
}
