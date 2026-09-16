/**
 * A `document` small enough to read, for the one screen worth opening headless.
 *
 * `bun test` carries no DOM, so the game's screens have been tested against
 * their *source text* — and the bug that was missing is the whole of the first
 * meeting's optional half (`first-meeting.test.ts`). **Why that is answered
 * with a hundred lines rather than a devDependency is written once, in
 * `tools/test/fake-dom.ts`**, along with the element both callers build a page
 * out of.
 *
 * What is here is the game's own document: a body, and the two ways a test
 * asks it for something — a button by what it says, a field by what it is
 * called. The director's pages want tab bars, a `location` and a canvas, none
 * of which is wanted here, and they have their own installer
 * (`tools/director/test/fake-dom.ts`).
 */

import { createElement, FakeEl } from "../../../tools/test/fake-dom.js";

export { FakeEl };

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
  const body = createElement("body");
  const doc = {
    body,
    createElement,
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
