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
   * arrives on (`grid.ts`, `rail.ts`).
   */
  press(key: string, target?: unknown): void;
  /**
   * Puts the real globals back. `bun test` shares one process across files, so
   * a fake `document` left on `globalThis` is read by every file after this one
   * — call this in a `finally`.
   */
  restore(): void;
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
}

/** Installs a `window`/`document` pair over `spec` and hands back the undo. */
export function installDom(spec: DomSpec = {}): FakeDom {
  const { search = "", bars = {}, ids = {} } = spec;
  const had = { document: globalThis.document, window: globalThis.window };
  let href = `/${search}`;

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
  const keys: Array<(e: { key: string; target: unknown; preventDefault(): void }) => void> = [];
  const win = {
    addEventListener: (
      type: string,
      fn: (e: { key: string; target: unknown; preventDefault(): void }) => void,
    ): void => {
      if (type === "keydown") keys.push(fn);
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

  const global = globalThis as { document?: unknown; window?: unknown };
  global.document = doc;
  global.window = win;
  return {
    url: () => href,
    press: (key: string, target: unknown = null) => {
      doc.activeElement = target;
      for (const fn of [...keys]) fn({ key, target, preventDefault: () => {} });
    },
    restore: () => {
      global.document = had.document;
      global.window = had.window;
    },
  };
}
