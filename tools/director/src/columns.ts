/**
 * Every top-level column in the director's `<main>` can be put away as one
 * unit — a whole `<section data-column>`, not a heading inside it. That used
 * to be per-`<h2 data-panel>` (`panels.ts`, `docs/queue.md`'s
 * `claude/burn-director-minimize` entry, landed as c230bc0): a heading and
 * the content that followed it collapsed on its own, so putting away
 * everything under WAVES still left BRIEFING and WHAT THIS WAVE ADDS TO THE
 * SHIP each taking their own strip of the column beside it. The owner's
 * actual want was coarser — click a column, get its space back for the
 * others — a `<section>`, not a heading inside one, so this module replaces
 * `panels.ts` rather than sitting beside it.
 *
 * The mechanism is the same shape as the panel version it replaces: a stored
 * choice per id, a `?closed=` override for a session driving the page with
 * no mouse. That half of the old design was never the complaint; only what
 * counts as the collapsible unit moved.
 *
 * A collapsed column also gives its grid track back: `main`'s four columns
 * are sized in CSS (`186px 320px minmax(320px, 1fr) minmax(480px,
 * max-content)`), fixed widths a hidden body cannot shrink on its own, so
 * this module rewrites `main.style.gridTemplateColumns` on every toggle,
 * substituting a narrow collapsed track for whichever column just closed.
 * Phone width is untouched: the media query drops `main` to one column
 * regardless, so the desktop-only inline style this module writes is simply
 * irrelevant there — see `mobile-menu.ts` for how a phone gets its space
 * back instead.
 */

const STORE_PREFIX = "director-column:";

/** Exported so a test can check the key without duplicating the prefix. */
export function storageKey(id: string): string {
  return STORE_PREFIX + id;
}

function readStored(id: string): boolean | null {
  try {
    const v = localStorage.getItem(storageKey(id));
    if (v === "closed") return false;
    if (v === "open") return true;
    return null;
  } catch {
    // Storage can be unavailable (private mode, a headless run with no
    // origin) — collapsing still works for this load, it just does not
    // survive a reload.
    return null;
  }
}

function writeStored(id: string, open: boolean): void {
  try {
    localStorage.setItem(storageKey(id), open ? "open" : "closed");
  } catch {
    // See readStored — nothing to persist to, nothing to do about it.
  }
}

export type Forced = ReadonlySet<string> | "all" | null;

/** Pure: parses `?closed=id,id` (or `?closed=all`) out of a search string. */
export function forcedClosedFromUrl(search: string): Forced {
  const raw = new URLSearchParams(search).get("closed");
  if (raw === null) return null;
  if (raw === "all") return "all";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/**
 * Pure: the whole priority order in one place, so a test can check it without
 * a DOM. The URL always wins over storage — it is a one-load override, not a
 * replacement for the human's own choice, so it never gets written back
 * (`wrapOne` only persists in response to the toggle button's own click,
 * which a forced initial value never fires).
 */
export function decideOpen(id: string, forced: Forced, stored: boolean | null): boolean {
  const isForcedClosed = forced === "all" || forced?.has(id) === true;
  if (isForcedClosed) return false;
  return stored ?? true;
}

/** One `<main> > section>`'s own track, open and collapsed. */
const COLLAPSED_TRACK = "36px";
const OPEN_TRACKS: Readonly<Record<string, string>> = {
  waves: "186px",
  editor: "320px",
  game: "minmax(320px, 1fr)",
  map: "minmax(400px, max-content)",
};

/**
 * Rebuilds `main`'s grid-template-columns from the current collapsed set, in
 * DOM order — so a column that closes gives its track back to its
 * neighbours instead of leaving a fixed-width gap nothing can use.
 */
function relayout(main: HTMLElement): void {
  // Below the phone breakpoint `main` is a single column by CSS (see
  // index.html's `@media (max-width: 700px)`), and only one section shows
  // at a time regardless — see mobile-menu.ts. Writing an inline
  // grid-template-columns there would only have to be fought by !important
  // for no benefit, so this is desktop-only.
  if (!matchMedia("(min-width: 701px)").matches) return;
  const columns = Array.from(main.querySelectorAll<HTMLElement>("section[data-column]"));
  main.style.gridTemplateColumns = columns
    .map((s) => {
      const id = s.dataset.column as string;
      return s.classList.contains("collapsed") ? COLLAPSED_TRACK : (OPEN_TRACKS[id] ?? "auto");
    })
    .join(" ");
}

/**
 * Wraps one `<main> > section>`'s children in a `<div class="column-body">`
 * and inserts a clickable head bar in front of it, carrying the column's own
 * title (`data-column-title`) rather than reusing an `<h2>` inside it — the
 * stage column has no heading of its own, and the brush column has two.
 */
function wrapOne(section: HTMLElement, forced: Forced, main: HTMLElement): void {
  const id = section.dataset.column;
  if (!id) return;
  const title = section.dataset.columnTitle ?? id.toUpperCase();

  const head = document.createElement("div");
  head.className = "column-head";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "column-toggle";
  toggle.textContent = title;
  head.appendChild(toggle);

  const body = document.createElement("div");
  body.className = "column-body";
  while (section.firstChild) body.appendChild(section.firstChild);

  section.appendChild(head);
  section.appendChild(body);

  const open = decideOpen(id, forced, readStored(id));
  section.classList.toggle("collapsed", !open);

  toggle.addEventListener("click", () => {
    const nowOpen = section.classList.contains("collapsed");
    section.classList.toggle("collapsed", !nowOpen);
    writeStored(id, nowOpen);
    relayout(main);
  });
}

/**
 * Finds every `<main> > section[data-column]>` and makes it collapsible as a
 * whole. Call once, before anything else queries the elements a column's
 * content lives in — moving nodes into `.column-body` preserves their ids,
 * so `document.getElementById(...)` keeps working regardless of which
 * column now contains it.
 */
export function initColumns(root: ParentNode = document, search: string = location.search): void {
  const main = root.querySelector("main");
  if (!main) return;
  const forced = forcedClosedFromUrl(search);
  const columns = Array.from(main.querySelectorAll<HTMLElement>(":scope > section[data-column]"));
  for (const section of columns) wrapOne(section, forced, main);
  relayout(main);
}
