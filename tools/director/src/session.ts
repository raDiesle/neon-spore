/**
 * Where you are in the director, kept in the URL — and nothing else is.
 *
 * A place is not a setting, and the line between them is the whole point of
 * this file: a value belongs here when it changes *what you are looking at*,
 * and belongs nowhere when it changes *what it looks like* or *what would
 * ship*. Which tab is open in the main `#tabs` bar and which wave is loaded
 * are the former — navigation, the same thing `back` and `forward` already
 * mean everywhere else on the web. A dial in TUNING, a picked skin, an edited
 * wave's own fields are the latter, and none of it is this module's business:
 * the director starts from what ships, every load, and a reload that quietly
 * handed settings back would make every judgement made here about the wrong
 * thing. See `docs/queue.md`, "A RELOAD KEEPS THE PLACE AND FORGETS
 * EVERYTHING ELSE" — the owner drew this line by hand, and the next module
 * that wants to remember one more field across a reload should read it
 * before reaching for this one.
 *
 * `history.replaceState`, never `pushState`: a chain of clicks must not grow
 * a history entry per click, only overwrite the one entry a reload restores.
 * The URL is read exactly once, at startup — `bindPlace` below owns that.
 */

/** The main editor's own tab bar — `#tabs` in `index.html`, wired by `bindTabs` in `tabs.ts`. */
const KNOWN_TABS = ["wave", "ship", "tuning", "balance", "interlude"] as const;
export type Tab = (typeof KNOWN_TABS)[number];
const DEFAULT_TAB: Tab = "wave";

function isKnownTab(value: string): value is Tab {
  return (KNOWN_TABS as readonly string[]).includes(value);
}

export interface Place {
  tab: Tab;
  /** A wave index, or null when the URL named none. */
  wave: number | null;
}

/**
 * Parses a `location.search`-shaped string into a `Place`. Pure, so the
 * fallback rule is testable without a `window`: a URL outlives the code that
 * wrote it, so an unknown tab name or a malformed wave number falls back
 * silently rather than throwing — a link from three weeks ago should open
 * the page, not a blank screen.
 */
export function parsePlace(search: string): Place {
  const params = new URLSearchParams(search);

  const rawTab = params.get("tab");
  const tab = rawTab && isKnownTab(rawTab) ? rawTab : DEFAULT_TAB;

  const rawWave = params.get("wave");
  const parsed = rawWave ? Number(rawWave) : Number.NaN;
  const wave = Number.isInteger(parsed) && parsed >= 0 ? parsed : null;

  return { tab, wave };
}

/** The query string a `Place` round-trips to, e.g. `"?tab=shapes&wave=7"` — never a trailing `?` alone. */
export function placeToSearch(place: Place): string {
  const params = new URLSearchParams();
  params.set("tab", place.tab);
  if (place.wave !== null) params.set("wave", String(place.wave));
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Read once, at startup — see the module header. */
export function readPlace(): Place {
  return parsePlace(window.location.search);
}

/**
 * Written on every navigation (a tab click, a wave picked), so the URL is
 * always the place currently on screen without ever growing the history
 * stack. Never touches anything but the query string — the path and any
 * hash a future tool adds are left exactly as they were.
 */
export function writePlace(place: Place): void {
  const url = `${window.location.pathname}${placeToSearch(place)}${window.location.hash}`;
  window.history.replaceState(null, "", url);
}

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
  let currentTab: Tab = place.tab;
  let lastWave = Math.min(Math.max(place.wave ?? 0, 0), Math.max(waveCount - 1, 0));

  for (const tab of document.querySelectorAll<HTMLButtonElement>(
    `${tabsSelector} button[data-tab]`,
  )) {
    // `data-tab` here is written by hand in `index.html` and is exactly
    // `KNOWN_TABS` above — the cast is that agreement, not a guess.
    const name = tab.dataset.tab as Tab;
    tab.addEventListener("click", () => {
      currentTab = name;
      writePlace({ tab: currentTab, wave: lastWave });
    });
  }

  return {
    initialTab: place.tab,
    initialWave: lastWave,
    persist(wave: number): void {
      lastWave = wave;
      writePlace({ tab: currentTab, wave });
    },
  };
}
