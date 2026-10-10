/**
 * A link to one section of a sheet page, to paste somewhere else.
 *
 * The owner asked on 10 October 2026 for the URL of every section of
 * DOCUMENTATION and NOT BUILT YET, to paste into a chat instead of writing
 * out which heading he meant. `session.ts` already keeps the sheet and its
 * inner tab in the query string; this adds the one thing a query string
 * cannot say, *where on the page*, as a `#slug` after it — the heading's own
 * words, lower-cased, so the link reads as what it points at
 * (`?sheet=backlog&inner=bosses#the-queen`).
 *
 * A link is offered in two places: beside every row of a page's contents menu
 * (`tabs.ts`) and on every named card of NOT BUILT YET (`backlog-entry.ts`).
 *
 * Opening such a link is `section-follow.ts`, which needs `tabs.ts` while
 * `tabs.ts` needs this — two files rather than an import cycle.
 */

/** A heading's words as a URL fragment: lower-case, runs of anything else as one `-`. */
export function sectionSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The link to paste: the page as it stands, without the wave and with the
 * section's slug as its hash. The wave is dropped because a section of a
 * sheet is the same section over every wave, and a link carrying one would
 * open the editor on a wave nobody asked about.
 */
export function sectionUrl(href: string, slug: string): string {
  const url = new URL(href);
  url.searchParams.delete("wave");
  url.hash = slug;
  return url.toString();
}

/** A small 🔗 that copies `sectionUrl` for `text` and says so for a moment. */
export function linkButton(text: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "section-link";
  button.textContent = "🔗";
  button.title = "copy a link to this section";
  button.addEventListener("click", (e) => {
    // Inside a contents row or a card head, either of which may be clickable
    // itself: a copy is not a jump.
    e.stopPropagation();
    const link = sectionUrl(window.location.href, sectionSlug(text));
    void navigator.clipboard?.writeText(link).then(() => {
      button.textContent = "✓";
      setTimeout(() => {
        button.textContent = "🔗";
      }, 1200);
    });
  });
  return button;
}

/** The first target whose slug is `slug`, or null. */
export function findSection<T extends { text: string }>(list: T[], slug: string): T | null {
  return list.find((t) => sectionSlug(t.text) === slug) ?? null;
}
