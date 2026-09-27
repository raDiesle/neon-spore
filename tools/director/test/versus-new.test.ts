import { afterEach, describe, expect, test } from "bun:test";
import { controlsBar } from "../src/versus-controls.js";
import { newNote } from "../src/versus-one.js";
import type { Pair } from "../src/versus-pair.js";
import { FakeEl, installDom } from "./fake-dom.js";

/**
 * A candidate that adds a thing the game does not draw at all
 * (`Variant.brandNew`) is said to be NEW, in words, and is not put beside a
 * CURRENT phone. The owner, 27 September 2026: *"when there is nothing compare
 * but completely new you need to write it clearly down on page and not show
 * with current and candidate"*.
 */

let undo: (() => void) | null = null;

afterEach(() => {
  undo?.();
  undo = null;
});

function dom(): void {
  const d = installDom();
  undo = () => d.restore();
}

const STUB = {
  setRunning() {},
  setRate() {},
  setBlink() {},
  setZoom() {},
} as unknown as Pair;

const texts = (els: readonly FakeEl[]): string[] =>
  els.flatMap((e) => [e, ...e.descendants()]).map((e) => e.textContent);

describe("a brand-new candidate", () => {
  test("says NEW and that there is nothing to compare, before anything else", () => {
    dom();
    const note = newNote("THE SLING's tines have no cord.") as unknown as FakeEl;
    expect(note.textContent).toStartWith("NEW — THE GAME DRAWS NOTHING HERE TODAY.");
    expect(note.textContent).toContain("THE SLING's tines have no cord.");
    expect(note.textContent).toContain("nothing to compare");
  });

  test("has no BLINK, which would flip to a side that is not there", () => {
    dom();
    const stage = new FakeEl() as unknown as HTMLElement;
    const alone = texts(controlsBar(stage, STUB, false) as unknown as FakeEl[]);
    const paired = texts(controlsBar(stage, STUB) as unknown as FakeEl[]);
    expect(alone).not.toContain("BLINK");
    expect(paired).toContain("BLINK");
    expect(alone).toContain("2× — NOT TRUE SIZE");
  });
});
