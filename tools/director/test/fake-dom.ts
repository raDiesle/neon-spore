/**
 * A `document` and a `window` small enough to read, for the director's own
 * wiring.
 *
 * The director is the one part of this repository that talks to a browser, and
 * the test runner carries no DOM — no jsdom, no happy-dom. So its wiring was
 * tested against the *source text* instead: `demo-panel.test.ts` matched a
 * regex over `demo-panel.ts`, `sheet.test.ts` read ids out of `index.html`.
 * That catches a rename and misses a bug, and on 6 September 2026 it missed
 * one — `mountSheet` restored every sheet to its first inner tab, three doc
 * comments described the behaviour it did not have, and every test passed.
 *
 * This is the alternative to a devDependency: about a hundred lines covering
 * exactly the surface the director touches — a class list, a dataset, a text
 * body, a field's value, children, one event type, and a `location`/`history`
 * pair that records the URL. It is deliberately not a DOM. A page that needs more than is here
 * either grows this file by the one method it wants, or is telling you it
 * reaches further into the browser than a director page should.
 */

export class FakeEl {
  readonly classes = new Set<string>();
  readonly dataset: { tab?: string } = {};
  readonly children: FakeEl[] = [];
  tagName = "";
  textContent = "";
  /** A textarea's or input's own content — the vote box reads one. */
  value = "";
  type = "";
  disabled = false;
  private readonly clicks: Array<() => void> = [];

  readonly classList = {
    add: (name: string): void => {
      this.classes.add(name);
    },
    toggle: (name: string, on: boolean): void => {
      if (on) this.classes.add(name);
      else this.classes.delete(name);
    },
    contains: (name: string): boolean => this.classes.has(name),
  };

  get className(): string {
    return [...this.classes].join(" ");
  }
  set className(value: string) {
    this.classes.clear();
    for (const name of value.split(/\s+/).filter(Boolean)) this.classes.add(name);
  }

  addEventListener(type: string, fn: () => void): void {
    if (type === "click") this.clicks.push(fn);
  }

  /** A copy, so a listener that rewires the element mid-click is not iterated into. */
  click(): void {
    for (const fn of [...this.clicks]) fn();
  }

  append(...nodes: FakeEl[]): void {
    this.children.push(...nodes);
  }

  replaceChildren(...nodes: FakeEl[]): void {
    this.children.length = 0;
    this.children.push(...nodes);
  }

  /** Every descendant, self excluded — what an assertion about a rendered list reads. */
  descendants(): FakeEl[] {
    return this.children.flatMap((c) => [c, ...c.descendants()]);
  }
}

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
   * Puts the real globals back. `bun test` shares one process across files, so
   * a fake `document` left on `globalThis` is read by every file after this one
   * — call this in a `finally`.
   */
  restore(): void;
}

export interface DomSpec {
  /** `location.search` at startup, `"?tab=wave&sheet=backlog"` and the like. */
  search?: string;
  /** Tab bars, keyed by the selector they are mounted at — `"#statesTabs"`. */
  bars?: Record<string, FakeEl[]>;
  /** Elements `getElementById` should find, keyed by id. */
  ids?: Record<string, FakeEl>;
}

/** Installs a `window`/`document` pair over `spec` and hands back the undo. */
export function installDom(spec: DomSpec = {}): FakeDom {
  const { search = "", bars = {}, ids = {} } = spec;
  const had = { document: globalThis.document, window: globalThis.window };
  let href = `/${search}`;

  // Two selector shapes, which is every one the director uses: a bar's buttons,
  // optionally narrowed by `.on` or a `data-tab` value.
  const pick = (selector: string): FakeEl[] => {
    const at = selector.indexOf(" button");
    if (at === -1) return [];
    const bar = bars[selector.slice(0, at)] ?? [];
    const filter = selector.slice(at + " button".length);
    if (filter === "" || filter === "[data-tab]") return bar;
    if (filter === ".on") return bar.filter((b) => b.classList.contains("on"));
    const want = /\[data-tab="(.+)"\]/.exec(filter)?.[1];
    return bar.filter((b) => b.dataset.tab === want);
  };

  const doc = {
    querySelector: (selector: string) => pick(selector)[0] ?? null,
    querySelectorAll: (selector: string) => pick(selector),
    getElementById: (id: string) => ids[id] ?? null,
    createElement: (tag: string) => {
      const node = new FakeEl();
      node.tagName = tag.toUpperCase();
      return node;
    },
    addEventListener: () => {},
  };
  const win = {
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
    restore: () => {
      global.document = had.document;
      global.window = had.window;
    },
  };
}
