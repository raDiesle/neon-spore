/**
 * A `document` small enough to read, for the one screen worth opening headless.
 *
 * `bun test` carries no DOM — no jsdom, no happy-dom — so the game's screens
 * have been tested against their *source text*: `hello.test.ts` matches a
 * regex over `hello.ts` and holds the wiring by the shape of the line that
 * writes it. That catches a rename and misses a bug, and the bug it was
 * missing is the whole of the first meeting's optional half: a sign-in filling
 * the name field had never once run (`first-meeting.test.ts`).
 *
 * This is the alternative to a devDependency, and the second one in the
 * repository — `tools/director/test/fake-dom.ts` is the director's, built
 * around a tab bar, `querySelector` and a canvas, none of which is wanted
 * here. What is here is what the first meeting touches: a field's value, a
 * button's text and its press, `hidden`, `disabled`, children and `remove`,
 * and a `body` with a dataset on it. **It is deliberately not a DOM.** A
 * screen that needs more than this either grows the file by the one method it
 * wants, or is telling you it reaches further into the browser than a screen
 * in front of the field should.
 */

/** Anything a listener is handed. The two this screen raises carry no payload. */
type Fired = Record<string, unknown>;

export class FakeEl {
  tagName = "";
  className = "";
  textContent = "";
  id = "";
  /** A label's `for`, which is the only reason a label is an element here. */
  htmlFor = "";
  type = "";
  value = "";
  placeholder = "";
  autocomplete = "";
  spellcheck = false;
  maxLength = 0;
  disabled = false;
  hidden = false;
  readonly attrs: Record<string, string> = {};
  readonly children: FakeEl[] = [];
  parent: FakeEl | null = null;
  private readonly on = new Map<string, Array<(e: Fired) => void>>();

  setAttribute(name: string, value: string): void {
    this.attrs[name] = value;
  }

  append(...nodes: FakeEl[]): void {
    for (const node of nodes) {
      node.parent = this;
      this.children.push(node);
    }
  }

  /** Out of the document, the way a screen seen once per device leaves it. */
  remove(): void {
    const siblings = this.parent?.children;
    if (siblings) siblings.splice(siblings.indexOf(this), 1);
    this.parent = null;
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

  click(): void {
    this.fire("click");
  }

  /** Somebody typing into a field: what they typed, and the event that says so. */
  typeIn(text: string): void {
    this.value = text;
    this.fire("input");
  }

  /** Every descendant, self excluded — what an assertion about a screen reads. */
  descendants(): FakeEl[] {
    return this.children.flatMap((child) => [child, ...child.descendants()]);
  }
}

export interface FakeDom {
  body: FakeEl;
  /** The one element whose text is exactly `label` — a button, by what it says. */
  labelled: (label: string) => FakeEl;
  /** The one element with this `id` — a field, by what it is called. */
  byId: (id: string) => FakeEl;
  /**
   * Puts the real globals back. `bun test` shares one process across files, so
   * a fake `document` left on `globalThis` is read by every file after this
   * one — call it in a `finally`.
   */
  restore: () => void;
}

/** Installs a `document` with an empty body, and hands back the undo. */
export function installDom(): FakeDom {
  const had = globalThis.document;
  const body = new FakeEl();
  body.tagName = "BODY";
  const dataset: Record<string, string> = {};
  const doc = {
    body: Object.assign(body, { dataset }),
    createElement: (tag: string): FakeEl => {
      const node = new FakeEl();
      node.tagName = tag.toUpperCase();
      return node;
    },
    addEventListener: (): void => {},
    dispatchEvent: (): boolean => true,
  };
  const global = globalThis as { document?: unknown };
  global.document = doc;

  const one = (what: string, found: FakeEl[]): FakeEl => {
    if (found.length !== 1) throw new Error(`${found.length} of ${what} on the screen, wanted one`);
    return found[0] as FakeEl;
  };
  return {
    body,
    labelled: (label) =>
      one(
        `"${label}"`,
        body.descendants().filter((e) => e.textContent === label),
      ),
    byId: (id) =>
      one(
        `#${id}`,
        body.descendants().filter((e) => e.id === id),
      ),
    restore: () => {
      global.document = had;
    },
  };
}
