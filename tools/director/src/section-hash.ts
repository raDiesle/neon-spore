/**
 * The section being read, kept in the URL's hash as it changes.
 *
 * The owner, 14 October 2026, on CONTROLS › ON THE FIELD: a reload should
 * come back to PULL PAST A DISTANCE, not to the top of the page. A copied
 * section link (`section-link.ts`) already opens on its `#slug`
 * (`section-follow.ts`); this writes the same slug while the page is read, so
 * the URL in the address bar is always that link. The bar under the contents
 * menu already knows the section being read (`contents-here.ts`), and it is
 * the one writer.
 *
 * **Nothing is written until the hash the page opened on has been followed.**
 * The pages draw late, and a page measured before its section exists would
 * read as the top and wipe the hash a reload is about to need. So the hash
 * is held from startup until `followHash` has jumped or given up, and then
 * let go.
 */

let held = true;

/** The hash the page opened on has been followed, or there was none: the
 * section being read may be written from now on. */
export function releaseHash(): void {
  held = false;
}

/** Back to startup's hold — for a test, which shares one module across many. */
export function holdHash(): void {
  held = true;
}

/** Whether the hash may be written or dropped yet. */
export function hashReleased(): boolean {
  return !held;
}

/**
 * The URL with `slug` as its hash, or with no hash for `null` — the top of
 * the page. `replaceState`, as `session.ts` writes the query string: reading
 * down a page must not grow the history by a section at a time.
 */
export function writeSectionHash(slug: string | null): void {
  if (held) return;
  const hash = slug ? `#${slug}` : "";
  if (window.location.hash === hash) return;
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", `${pathname}${search}${hash}`);
}
