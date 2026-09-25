/**
 * One element, for the two places in this repository that open a browser page
 * with no browser under it.
 *
 * **This is the alternative to a devDependency, and the argument for it lives
 * here rather than twice.** `bun test` carries no DOM — no jsdom, no
 * happy-dom — so a page's wiring was tested against its *source text*: the
 * director's `demo-panel.test.ts` matched a regex over `demo-panel.ts`, the
 * game's `hello.test.ts` held the first meeting by the shape of the line that
 * writes it. That catches a rename and misses a bug, and it has missed two.
 * On 6 September 2026 `mountSheet` restored every sheet to its first inner
 * tab, three doc comments described behaviour it did not have, and every test
 * passed; the first meeting's optional half — a sign-in filling the name
 * field — had never once run.
 *
 * A full DOM would answer both, and would also be a dependency the whole
 * repository carries so that two files can be read. What is here instead is
 * the union of what those two files touch, and nothing else: a class list, a
 * dataset, a text body, a field's value, attributes, children, listeners by
 * type, and a canvas that hands back no context. **It is deliberately not a
 * DOM.** A page that needs more than is here either grows this file by the one
 * method it wants, or is telling you it reaches further into the browser than
 * a page of ours should.
 *
 * **The installers are not here.** The two callers want different documents —
 * the director's has tab bars, ids and a `location`/`history` pair, the game's
 * has a body and nothing else — and a single `installDom` taking both shapes
 * would be a larger thing to read than the two it replaced. What they share is
 * the element and the `createElement` that makes one, which is exactly what
 * this file is: `tools/director/test/fake-dom.ts` and `apps/game/test/fake-dom.ts`.
 */

/** Anything a listener is handed. Most of what is raised here carries no payload. */
export type Fired = Record<string, unknown>;

export class FakeEl {
  readonly classes = new Set<string>();
  /** `data-*`, which is where both callers keep a page's own state: a tab's
   * name on a button, and whether a screen is up on the body. */
  readonly dataset: Record<string, string> = {};
  readonly attrs: Record<string, string> = {};
  /** Inline style, as the plain record a page writes a grid placement into. */
  readonly style: Record<string, string> = {};
  readonly children: FakeEl[] = [];
  parent: FakeEl | null = null;
  tagName = "";
  textContent = "";
  /** A textarea's or input's own content — the vote box reads one, and so does
   * the name field. */
  value = "";
  /** A canvas's own two, set before anything is drawn on it. */
  width = 0;
  height = 0;
  type = "";
  disabled = false;
  hidden = false;
  /** What hovering says, which is where a button explains itself. */
  title = "";
  id = "";
  /** A label's `for`, which is the only reason a label is an element here. */
  htmlFor = "";
  placeholder = "";
  autocomplete = "";
  spellcheck = false;
  maxLength = 0;
  private readonly on = new Map<string, Array<(e: Fired) => void>>();

  readonly classList = {
    add: (name: string): void => {
      this.classes.add(name);
    },
    remove: (name: string): void => {
      this.classes.delete(name);
    },
    toggle: (name: string, on: boolean): void => {
      if (on) this.classes.add(name);
      else this.classes.delete(name);
    },
    contains: (name: string): boolean => this.classes.has(name),
  };

  /** Backed by the class list rather than kept beside it, so a page may write
   * the string and a test may ask the set, which is what the two callers do. */
  get className(): string {
    return [...this.classes].join(" ");
  }
  set className(value: string) {
    this.classes.clear();
    for (const name of value.split(/\s+/).filter(Boolean)) this.classes.add(name);
  }

  setAttribute(name: string, value: string): void {
    this.attrs[name] = value;
  }

  getAttribute(name: string): string | null {
    return this.attrs[name] ?? null;
  }

  addEventListener(type: string, fn: (e: Fired) => void): void {
    const held = this.on.get(type) ?? [];
    held.push(fn);
    this.on.set(type, held);
  }

  /** A copy, so a listener that rewires this element mid-event is not iterated into. */
  fire(type: string, event: Fired = {}): void {
    for (const fn of [...(this.on.get(type) ?? [])]) fn(event);
  }

  /** A press, carrying the one method a listener on a nested control calls —
   * a button inside a row that is itself a button stops the press there
   * (`director/src/rail-open.ts`). Nothing here propagates, so the method has
   * nothing to do; what matters is that it exists to be called. */
  click(): void {
    this.fire("click", { stopPropagation: () => {} });
  }

  /** Somebody typing into a field: what they typed, and the event that says so. */
  typeIn(text: string): void {
    this.value = text;
    this.fire("input");
  }

  append(...nodes: FakeEl[]): void {
    for (const node of nodes) {
      node.parent = this;
      this.children.push(node);
    }
  }

  /** One node, which is what a list built row by row calls. */
  appendChild(node: FakeEl): FakeEl {
    this.append(node);
    return node;
  }

  replaceChildren(...nodes: FakeEl[]): void {
    for (const child of this.children) child.parent = null;
    this.children.length = 0;
    this.append(...nodes);
  }

  /**
   * Where a jump landed — the director's contents menu does this and nothing
   * else, so it is the whole of what a test of it can read (`tabs.ts`).
   */
  scrolledIntoView = false;
  scrollIntoView(): void {
    this.scrolledIntoView = true;
  }

  /** Out of the document, the way a screen seen once per device leaves it. */
  remove(): void {
    const siblings = this.parent?.children;
    if (siblings) siblings.splice(siblings.indexOf(this), 1);
    this.parent = null;
  }

  /**
   * No drawing context, which is what a runner with no canvas has and what
   * every panel here already handles: each one checks for `null` and hands
   * back the bare element. So a panel's *wiring* — which stage is marked, what
   * a click calls — is testable, and its picture is not, which is the right
   * split: a picture is judged by an eye (`tools/shape-sheet`).
   */
  getContext(): null {
    return null;
  }

  /** Every descendant, self excluded — what an assertion about a rendered list
   * or a screen reads. */
  descendants(): FakeEl[] {
    return this.children.flatMap((child) => [child, ...child.descendants()]);
  }
}

/** `document.createElement`, uppercasing the tag the way a browser does — both
 * installers hand this out under that name. */
export function createElement(tag: string): FakeEl {
  const node = new FakeEl();
  node.tagName = tag.toUpperCase();
  return node;
}
