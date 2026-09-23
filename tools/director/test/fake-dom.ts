/**
 * A `document` and a `window` small enough to read, for the director's own
 * wiring.
 *
 * The director is the one part of this repository that talks to a browser, and
 * the test runner carries no DOM. **Why that is answered with a hundred lines
 * rather than a devDependency is written once, in `tools/test/fake-dom.ts`**,
 * along with the element both callers build a page out of.
 *
 * What is here is the director's own document: tab bars found by selector, a
 * few elements found by id, a key pressed on the window, and a
 * `location`/`history` pair that records the URL. The game's screens want none
 * of it and have their own installer (`apps/game/test/fake-dom.ts`).
 */

import { createElement, FakeEl } from "../../test/fake-dom.js";

export { FakeEl };

/**
 * One `<button data-tab>` per name, the first carrying `.on` the way the markup
 * ships it, and all of them wired the way `bindTabs` wires a real bar — a click
 * moves `.on` to itself, which is what `session.ts`'s `currentInnerTab` reads.
 */
export function makeBar(names: readonly string[]): FakeEl[] {
  const buttons = names.map((name, i) => {
    const button = new FakeEl();
    button.tagName = "BUTTON";
    button.dataset.tab = name;
    if (i === 0) button.classes.add("on");
    return button;
  });
  for (const button of buttons) {
    button.addEventListener("click", () => {
      for (const other of buttons) other.classList.toggle("on", other === button);
    });
  }
  return buttons;
}

export interface FakeDom {
  /** The URL as `history.replaceState` last left it. */
  url(): string;
  /**
   * A key pressed on the window, for the three panels that listen there rather
   * than on an element — a selection, and a wave, outlive the node a press
   * arrives on (`grid.ts`, `rail.ts`). The event carries both a `key` and the
   * `code` that key sits at, because two bindings read the latter: the seat
   * keys (`desk-seat.ts`) and `3` (`stage-cue-key.ts`).
   */
  press(key: string, target?: unknown): void;
  /**
   * The same key let go. A binding that holds a thumb down for as long as the
   * key is down (`stage-cue-key.ts`) is only half tested by a press, and a
   * `keyup` nobody fires is a thumb nobody lifts.
   */
  lift(key: string, target?: unknown): void;
  /**
   * Puts the real globals back. `bun test` shares one process across files, so
   * a fake `document` left on `globalThis` is read by every file after this one
   * — call this in a `finally`.
   */
  restore(): void;
  /** `document.body`, which the phone's menu and its views write a class on. */
  body: FakeEl;
  /** What was put in `localStorage`, for a test about what is remembered. */
  stored(key: string): string | null;
  /**
   * Tells every `MutationObserver` watching `el` that its children changed —
   * `FakeEl` does not notice its own appends, so a test that draws a page
   * says so here, the way the browser would on the next frame.
   */
  mutated(el: FakeEl): void;
  /**
   * Tells every `IntersectionObserver` watching `el` that it has scrolled
   * into view — a room's own lazy section (`states-section.ts`) asks this
   * rather than being clicked, and a test says so here instead of faking
   * scroll geometry no `FakeEl` carries.
   */
  intersect(el: FakeEl): void;
}

export interface DomSpec {
  /** `location.search` at startup, `"?tab=wave&sheet=backlog"` and the like. */
  search?: string;
  /**
   * Elements a selector should find, keyed by the selector: a tab bar by the
   * bar it is mounted at — `"#statesTabs"` — or any whole selector written
   * out, which is what a binder that sweeps the document rather than one bar
   * needs (`bindContents` and its `nav[data-contents]`).
   */
  bars?: Record<string, FakeEl[]>;
  /** Elements `getElementById` should find, keyed by id. */
  ids?: Record<string, FakeEl>;
  /**
   * What `matchMedia` answers — whether this is a narrow screen. The director
   * asks exactly one question of it, *is this a phone*, and three files act on
   * the answer (`phone-view.ts`, `rail-open.ts`, `columns.ts`).
   */
  phone?: boolean;
}

/** What a listener on the window is handed. `code` is the physical key and
 * `key` the letter on it; a test says the letter and this file supplies the
 * other, because no caller wants to write `Digit3` twice. */
interface KeyPress {
  key: string;
  code: string;
  target: unknown;
  preventDefault(): void;
}

/** The `code` a `key` sits at, for the two shapes any director binding uses:
 * a digit on the number row and a letter. Anything else — `Escape`, an
 * arrow — is its own code already, which is what the browser says too. */
function codeOf(key: string): string {
  if (/^[0-9]$/.test(key)) return `Digit${key}`;
  if (/^[a-zA-Z]$/.test(key)) return `Key${key.toUpperCase()}`;
  return key;
}

/** Installs a `window`/`document` pair over `spec` and hands back the undo. */
export function installDom(spec: DomSpec = {}): FakeDom {
  const { search = "", bars = {}, ids = {}, phone = false } = spec;
  const had = {
    document: globalThis.document,
    window: globalThis.window,
    matchMedia: globalThis.matchMedia,
    localStorage: globalThis.localStorage,
    MutationObserver: globalThis.MutationObserver,
    IntersectionObserver: globalThis.IntersectionObserver,
    requestAnimationFrame: globalThis.requestAnimationFrame,
  };
  let href = `/${search}`;
  const body = new FakeEl();
  body.tagName = "BODY";
  const store = new Map<string, string>();

  // A selector written out whole, answered from `bars` as given; failing that,
  // a bar's buttons, optionally narrowed by `.on` or a `data-tab` value.
  const pick = (selector: string): FakeEl[] => {
    const whole = bars[selector];
    if (whole) return whole;
    const at = selector.indexOf(" button");
    if (at === -1) return [];
    const bar = bars[selector.slice(0, at)] ?? [];
    const filter = selector.slice(at + " button".length);
    if (filter === "" || filter === "[data-tab]") return bar;
    if (filter === ".on") return bar.filter((b) => b.classList.contains("on"));
    const want = /\[data-tab="(.+)"\]/.exec(filter)?.[1];
    return bar.filter((b) => b.dataset.tab === want);
  };

  const doc: { activeElement: unknown } & Record<string, unknown> = {
    /** What has focus, which is how a global listener asks whether somebody is
     * typing (`src/typing.ts`). Nothing, until a press says otherwise. */
    activeElement: null,
    /** The one element the phone's menu and its three views write on. */
    body,
    querySelector: (selector: string) => pick(selector)[0] ?? null,
    querySelectorAll: (selector: string) => pick(selector),
    getElementById: (id: string) => ids[id] ?? null,
    createElement,
    /** A text node, which this file has no separate class for: a `FakeEl`
     * whose whole content is its text reads the same way to an assertion
     * about what a rendered row says (`rail-list.test.ts`). */
    createTextNode: (text: string) => {
      const node = new FakeEl();
      node.tagName = "#text";
      node.textContent = text;
      return node;
    },
    addEventListener: () => {},
  };
  const keys: Record<"keydown" | "keyup", Array<(e: KeyPress) => void>> = {
    keydown: [],
    keyup: [],
  };
  const win = {
    addEventListener: (type: string, fn: (e: KeyPress) => void): void => {
      if (type === "keydown" || type === "keyup") keys[type].push(fn);
    },
    location: {
      get search(): string {
        const at = href.indexOf("?");
        return at === -1 ? "" : href.slice(at);
      },
      pathname: "/",
      hash: "",
    },
    history: {
      replaceState: (_state: unknown, _title: string, url: string): void => {
        href = url;
      },
    },
  };

  // Both of these are read bare — `matchMedia(...)`, `localStorage.getItem` —
  // so they go on the global rather than on `win`, and come off it again in
  // `restore`: `bun test` shares one process across files.
  const global = globalThis as {
    document?: unknown;
    window?: unknown;
    matchMedia?: unknown;
    localStorage?: unknown;
    MutationObserver?: unknown;
    IntersectionObserver?: unknown;
    requestAnimationFrame?: unknown;
  };
  global.document = doc;
  global.window = win;
  global.matchMedia = (query: string) => ({ matches: phone && query.includes("700px") });
  // An observer that fires when the test says its target changed (`mutated`),
  // and a frame that runs at once: what is under test is what the callback
  // does, not when the browser would schedule it.
  const watchers: Array<{ target: FakeEl; fn: () => void }> = [];
  global.MutationObserver = class {
    constructor(private readonly fn: () => void) {}
    observe(target: FakeEl): void {
      watchers.push({ target, fn: this.fn });
    }
    disconnect(): void {}
  };
  // A room's own lazy sections (`states-section.ts`'s `watchSection`) ask
  // whether a target has scrolled into view; a test says so with `intersect`
  // rather than this file guessing at real scroll geometry.
  const seers: Array<{
    target: FakeEl;
    fn: (entries: { isIntersecting: boolean; target: FakeEl }[]) => void;
  }> = [];
  global.IntersectionObserver = class {
    constructor(
      private readonly fn: (entries: { isIntersecting: boolean; target: FakeEl }[]) => void,
    ) {}
    observe(target: FakeEl): void {
      seers.push({ target, fn: this.fn });
    }
    unobserve(target: FakeEl): void {
      for (let i = seers.length - 1; i >= 0; i--)
        if (seers[i]?.target === target) seers.splice(i, 1);
    }
    disconnect(): void {}
  };
  global.requestAnimationFrame = (fn: (t: number) => void): number => {
    fn(0);
    return 0;
  };
  global.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
  };
  const fire = (type: "keydown" | "keyup", key: string, target: unknown): void => {
    const e = { key, code: codeOf(key), target, preventDefault: () => {} };
    for (const fn of [...keys[type]]) fn(e);
  };

  return {
    body,
    stored: (key: string) => store.get(key) ?? null,
    url: () => href,
    mutated: (el: FakeEl) => {
      for (const w of watchers) if (w.target === el) w.fn();
    },
    intersect: (el: FakeEl) => {
      for (const s of [...seers]) if (s.target === el) s.fn([{ isIntersecting: true, target: el }]);
    },
    press: (key: string, target: unknown = null) => {
      doc.activeElement = target;
      fire("keydown", key, target);
    },
    lift: (key: string, target: unknown = null) => {
      fire("keyup", key, target);
    },
    restore: () => {
      global.document = had.document;
      global.window = had.window;
      global.matchMedia = had.matchMedia;
      global.localStorage = had.localStorage;
      global.MutationObserver = had.MutationObserver;
      global.IntersectionObserver = had.IntersectionObserver;
      global.requestAnimationFrame = had.requestAnimationFrame;
    },
  };
}
