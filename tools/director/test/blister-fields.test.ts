import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { WaveEntry } from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { blisterRows } from "../src/cell-config-blister.js";
import {
  blisterByOf,
  blisterCountOf,
  blisterGestureOf,
  hasBlisterFields,
  setBlisterBy,
  setBlisterCount,
  setBlisterGesture,
} from "../src/entry-fields-blister.js";
import { serializeEntry } from "../src/serialize-entry.js";

/**
 * **THE BLISTER's BY, GESTURE and COUNT rows** (`cell-config-blister.ts`):
 * each default is written as no field, a set one survives a save, and WAY is
 * offered only for a gesture that has one — none yet, TAP and HOLD having
 * none.
 */

const blister = (): WaveEntry => ({ beat: 4, col: 3, kind: "blister" }) as WaveEntry;

/** A saved entry read back the way the wave file is: as the object literal it is. */
function reread(entry: WaveEntry): WaveEntry {
  return new Function(`return ${serializeEntry(entry)};`)() as WaveEntry;
}

describe("THE BLISTER's fields", () => {
  it("are offered on a blister and on nothing else", () => {
    expect(hasBlisterFields(blister())).toBe(true);
    expect(hasBlisterFields({ beat: 0, col: 0, kind: "mine" } as WaveEntry)).toBe(false);
  });

  it("read the navigator's hand and the simulation's blows when unset", () => {
    expect(blisterByOf(blister())).toBe(2);
    expect(blisterCountOf(blister())).toBe(DEFAULT_CONFIG.blisterBlows);
    expect(blisterGestureOf(blister())).toBe("tap");
  });

  it("write each default as no field, so an untouched blister saves as it was", () => {
    const e = blister();
    setBlisterBy(e, 1);
    setBlisterBy(e, 2);
    setBlisterCount(e, 6);
    setBlisterCount(e, DEFAULT_CONFIG.blisterBlows);
    setBlisterGesture(e, "hold");
    setBlisterGesture(e, "tap");
    expect(serializeEntry(e)).toBe(serializeEntry(blister()));
  });

  it("survive a save and a read back, both seats and either", () => {
    for (const by of [1, "both"] as const) {
      const e = blister();
      setBlisterBy(e, by);
      setBlisterCount(e, 7);
      setBlisterGesture(e, "hold");
      const back = reread(e);
      expect(blisterByOf(back)).toBe(by);
      expect(blisterCountOf(back)).toBe(7);
      expect(blisterGestureOf(back)).toBe("hold");
    }
  });
});

/** Just enough of `document` for `choiceRow` to build a row and say its label and chips. */
interface Node {
  className: string;
  textContent: string;
  children: Node[];
  appendChild(child: Node): void;
  addEventListener(type: string, fn: () => void): void;
  click?: () => void;
}
const saved = (globalThis as { document?: unknown }).document;
beforeAll(() => {
  (globalThis as { document?: unknown }).document = {
    createElement: (): Node => {
      const node: Node = {
        className: "",
        textContent: "",
        children: [],
        appendChild: (c) => node.children.push(c),
        addEventListener: (_t, fn) => {
          node.click = fn;
        },
      };
      return node;
    },
  };
});
afterAll(() => {
  (globalThis as { document?: unknown }).document = saved;
});

describe("THE BLISTER's rows", () => {
  const said = (rows: unknown[]) =>
    (rows as Node[]).map((r) => r.children.map((c) => c.textContent).join(" "));

  it("are BY, GESTURE and COUNT, and no WAY while no gesture has one", () => {
    expect(said(blisterRows(blister(), () => {}))).toEqual([
      "BY P1 P2 BOTH",
      "GESTURE TAP HOLD",
      "COUNT 1 2 3 4 5 6 7 8",
    ]);
  });

  it("set the entry when a chip is pressed", () => {
    const e = blister();
    let edits = 0;
    const [by, gesture, count] = blisterRows(e, () => edits++) as unknown as Node[];
    by?.children[3]?.click?.();
    gesture?.children[2]?.click?.();
    count?.children[5]?.click?.();
    expect(e.by).toBe("both");
    expect(e.gesture).toBe("hold");
    expect(e.count).toBe(5);
    expect(edits).toBe(3);
  });
});
