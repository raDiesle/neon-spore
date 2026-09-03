/**
 * Where you are in the director, kept in the URL — and nothing else is.
 *
 * A value belongs here when it changes *what you are looking at*, and
 * belongs nowhere when it changes *what it looks like* or *what would ship*.
 * Which tab is open in the main `#tabs` bar, which wave is loaded, which
 * full-screen sheet covers the editor and which of that sheet's own inner
 * tabs is showing — all four are the former: navigation, the same thing
 * `back` and `forward` already mean everywhere else on the web. A dial in
 * TUNING, a picked skin, an edited wave's own fields are the latter, and none
 * of it is this module's business: the director starts from what ships,
 * every load, and a reload that quietly handed settings back would make every
 * judgement made here about the wrong thing. The next module that wants to
 * remember one more field across a reload should weigh it against that
 * sentence, not against how long the list above has grown — a sheet is a
 * place because opening one is a click same as a tab, not because several of
 * them already fit the pattern.
 *
 * `history.replaceState`, never `pushState`: a chain of clicks must not grow
 * a history entry per click, only overwrite the one entry a reload restores.
 * The URL is read exactly once, at startup — `bindPlace` below owns that.
 *
 * At most one sheet is open at a time, so `sheet` is a single opaque name
 * rather than a boolean per sheet — this module does not know what sheets
 * exist. `mountSheet` below is how every overlay page (`backlog-page.ts`,
 * `checks-page.ts`, `states-page.ts`, `sound-page.ts`, `controlsets-page.ts`)
 * joins in: one call wires its open button, close button, Escape key and
 * optional inner tab bar to a place the same way `bindPlace` already wires
 * the main tab bar, and drives the restoring click on startup. `guide-page.ts`
 * needs no call of its own — its CARDS tab lives inside the backlog's own
 * inner bar and rides that sheet's `mountSheet` call. A name nothing
 * recognises opens nothing, the same fallback a stale top-level `tab` value
 * already gets, because a URL outlives the code that wrote it. `inner` rides
 * beside `sheet` and is cleared whenever it is, so a sheet closed and
 * reloaded comes back closed rather than remembering a tab nobody can see.
 */

/** The main editor's own tab bar — `#tabs` in `index.html`, wired by `bindTabs` in `tabs.ts`. */
const KNOWN_TABS = ["wave", "ship", "tuning", "balance"] as const;
export type Tab = (typeof KNOWN_TABS)[number];
const DEFAULT_TAB: Tab = "wave";

function isKnownTab(value: string): value is Tab {
  return (KNOWN_TABS as readonly string[]).includes(value);
}

export interface Place {
  tab: Tab;
  /** A wave index, or null when the URL named none. */
  wave: number | null;
  /** The overlay sheet open over the editor, by its own opaque name, or null for none. */
  sheet: string | null;
  /** The open sheet's own inner tab, by name, or null when it has none open. Always null when `sheet` is. */
  inner: string | null;
}

/**
 * Parses a `location.search`-shaped string into a `Place`. Pure, so the
 * fallback rule is testable without a `window`: a URL outlives the code that
 * wrote it, so an unknown tab name, a malformed wave number, or an `inner`
 * with no `sheet` beside it falls back silently rather than throwing — a link
 * from three weeks ago should open the page, not a blank screen.
 */
export function parsePlace(search: string): Place {
  const params = new URLSearchParams(search);

  const rawTab = params.get("tab");
  const tab = rawTab && isKnownTab(rawTab) ? rawTab : DEFAULT_TAB;

  const rawWave = params.get("wave");
  const parsed = rawWave ? Number(rawWave) : Number.NaN;
  const wave = Number.isInteger(parsed) && parsed >= 0 ? parsed : null;

  const sheet = params.get("sheet") || null;
  // An `inner` with no `sheet` is a malformed or hand-edited URL, not a
  // sheet the reader meant to reopen — dropped the same way a wave with no
  // digits is.
  const inner = sheet ? params.get("inner") || null : null;

  return { tab, wave, sheet, inner };
}

/** The query string a `Place` round-trips to, e.g. `"?tab=wave&sheet=backlog&inner=spec"` — never a trailing `?` alone. */
export function placeToSearch(place: Place): string {
  const params = new URLSearchParams();
  params.set("tab", place.tab);
  if (place.wave !== null) params.set("wave", String(place.wave));
  if (place.sheet !== null) {
    params.set("sheet", place.sheet);
    if (place.inner !== null) params.set("inner", place.inner);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Read once, at startup — see the module header. */
function readPlace(): Place {
  return parsePlace(window.location.search);
}

/**
 * Written on every navigation (a tab click, a wave picked, a sheet opened or
 * closed), so the URL is always the place currently on screen without ever
 * growing the history stack. Never touches anything but the query string —
 * the path and any hash a future tool adds are left exactly as they were.
 */
function writePlace(place: Place): void {
  const url = `${window.location.pathname}${placeToSearch(place)}${window.location.hash}`;
  window.history.replaceState(null, "", url);
}

/**
 * The one `Place` in memory, shared by every function below. `bindPlace`
 * seeds it from the URL at startup; the main tab bar's click handler and
 * `mountSheet`'s wiring are the only things that ever change it, and every
 * change goes straight to `writePlace`.
 */
let current: Place = { tab: DEFAULT_TAB, wave: null, sheet: null, inner: null };

export interface PlaceSession {
  /** The tab named by the URL at startup — `main.ts` clicks its button once `bindTabs` has wired it. */
  initialTab: Tab;
  /** The wave index named by the URL at startup, already clamped to `[0, waveCount)`. */
  initialWave: number;
  /** Call whenever `store.index` changes, from the one place — `refreshAll` — every mover already runs through. */
  persist(wave: number): void;
}

/**
 * Wires the main `#tabs` bar's buttons to the URL: a click updates it, and
 * `persist` keeps the wave index in step. Does not touch which tab is shown
 * on screen — `bindTabs` in `tabs.ts` already owns that, and the caller
 * clicks `initialTab`'s button through that same path so a restored tab is
 * indistinguishable from a clicked one. `waveCount` clamps a URL wave index
 * that no longer exists, the same fallback rule as an unknown tab name.
 */
export function bindPlace(tabsSelector: string, waveCount: number): PlaceSession {
  const place = readPlace();
  current = { ...place, wave: Math.min(Math.max(place.wave ?? 0, 0), Math.max(waveCount - 1, 0)) };

  for (const tab of document.querySelectorAll<HTMLButtonElement>(
    `${tabsSelector} button[data-tab]`,
  )) {
    // `data-tab` here is written by hand in `index.html` and is exactly
    // `KNOWN_TABS` above — the cast is that agreement, not a guess.
    const name = tab.dataset.tab as Tab;
    tab.addEventListener("click", () => {
      current = { ...current, tab: name };
      writePlace(current);
    });
  }

  return {
    initialTab: current.tab,
    initialWave: current.wave ?? 0,
    persist(wave: number): void {
      current = { ...current, wave };
      writePlace(current);
    },
  };
}

function initialSheet(name: string): boolean {
  return current.sheet === name;
}

function initialInner(name: string): string | null {
  return current.sheet === name ? current.inner : null;
}

function openSheet(name: string, inner: string | null): void {
  current = { ...current, sheet: name, inner };
  writePlace(current);
}

function closeSheet(): void {
  current = { ...current, sheet: null, inner: null };
  writePlace(current);
}

/** The `data-tab` of whichever button in `barSelector` currently carries `.on` — `bindTabs` puts it there, so this reads a bar's own idea of its current inner tab without a second copy of that state. */
function currentInnerTab(barSelector: string): string | null {
  return document.querySelector<HTMLElement>(`${barSelector} button.on`)?.dataset.tab ?? null;
}

export interface SheetSpec {
  /** The opaque name this sheet is known by in the URL. */
  name: string;
  sheet: HTMLElement;
  open: HTMLElement;
  close: HTMLElement;
  /** Selector for this sheet's own inner tab bar, if it has one — `bindTabs` must already be wired to it, so a click here can read the `.on` class it just set. */
  innerBar?: string;
  /** Run every time the sheet opens — a lazy `load()`/render, or unlocking audio. */
  onOpen?: () => void;
  /** Run every time the sheet closes, after the place is cleared — a running player to hush, say. */
  onClose?: () => void;
}

/**
 * Wires one full-screen overlay sheet's open button, close button and Escape
 * key to both its own `.on` class and to this module's place — the shape
 * every such sheet in the director shares, so this is one function rather
 * than five near-identical copies of `show(on)`. Also wires `innerBar`'s
 * buttons, if given, to record the sheet's current inner tab, and drives the
 * restoring click for both on startup: `open.click()` runs every listener
 * wired here in the order a real click would, rather than a class toggle
 * that would skip `onOpen` and leave the sheet blank; the inner tab is
 * clicked after, and one the bar does not have is simply never found, the
 * same fallback an unknown top-level `tab` gets.
 */
export function mountSheet(spec: SheetSpec): void {
  const { name, sheet, open, close, innerBar, onOpen, onClose } = spec;

  const show = (on: boolean): void => {
    sheet.classList.toggle("on", on);
    if (!on) {
      closeSheet();
      onClose?.();
      return;
    }
    openSheet(name, innerBar ? currentInnerTab(innerBar) : null);
    onOpen?.();
  };

  open.addEventListener("click", () => show(true));
  close.addEventListener("click", () => show(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheet.classList.contains("on")) show(false);
  });

  if (innerBar) {
    for (const tab of document.querySelectorAll<HTMLElement>(`${innerBar} button`)) {
      tab.addEventListener("click", () => openSheet(name, tab.dataset.tab ?? null));
    }
  }

  if (initialSheet(name)) {
    open.click();
    const wantInner = innerBar ? initialInner(name) : null;
    if (wantInner) {
      document
        .querySelector<HTMLButtonElement>(`${innerBar} button[data-tab="${wantInner}"]`)
        ?.click();
    }
  }
}
