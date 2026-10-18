import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { WaveEntry } from "@neon-spore/content";
import { blisterRows } from "../src/cell-config-blister.js";
import {
  blisterByOf,
  blisterGestureOf,
  blisterWayOfEntry,
  hasBlisterFields,
  setBlisterBy,
  setBlisterGesture,
  setBlisterWay,
} from "../src/entry-fields-blister.js";
import { serializeEntry } from "../src/serialize-entry.js";

/**
 * **THE BLISTER's BY and WAY rows, and the gesture its brush sets** (`cell-config-blister.ts`):
 * each default is written as no field, a set one survives a save, and WAY is
 * offered only for a gesture that has one — SWIPE, TAP and HOLD having none.
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

  it("read either hand and a tap when unset", () => {
    expect(blisterByOf(blister())).toBe("either");
    expect(blisterGestureOf(blister())).toBe("tap");
  });

  it("write each default as no field, so an untouched blister saves as it was", () => {
    const e = blister();
    setBlisterBy(e, 1);
    setBlisterBy(e, "either");
    setBlisterGesture(e, "hold");
    setBlisterGesture(e, "tap");
    setBlisterWay(e, "up");
    setBlisterWay(e, "right");
    expect(serializeEntry(e)).toBe(serializeEntry(blister()));
  });

  it("survive a save and a read back, each seat and both", () => {
    for (const by of [1, 2, "both"] as const) {
      const e = blister();
      setBlisterBy(e, by);
      setBlisterGesture(e, "hold");
      const back = reread(e);
      expect(blisterByOf(back)).toBe(by);
      expect(blisterGestureOf(back)).toBe("hold");
    }
  });

  it("keep a SWIPE's way through a save, right when unset", () => {
    expect(blisterWayOfEntry(blister())).toBe("right");
    for (const way of ["left", "up", "down"] as const) {
      const e = blister();
      setBlisterGesture(e, "swipe");
      setBlisterWay(e, way);
      const back = reread(e);
      expect(blisterGestureOf(back)).toBe("swipe");
      expect(blisterWayOfEntry(back)).toBe(way);
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

  // No GESTURE row since 16 October 2026: the brush is the gesture, and a
  // HOLD painted on the map stays a HOLD until another brush paints over it.
  // UP and BLOWS follow BY on every gesture (`blister-numbers-fields.test.ts`).
  it("are BY, UP and BLOWS, and no WAY or LENGTH for a TAP", () => {
    expect(said(blisterRows(blister(), () => {}))).toEqual([
      "BY P1 P2 BOTH EITHER",
      "UP DEFAULT 6 2 3 4 5 6 8 10 12 16",
      "BLOWS DEFAULT 1 1 2 3 4 5 6 8",
    ]);
    const hold = said(blisterRows({ ...blister(), gesture: "hold" } as WaveEntry, () => {}));
    expect(hold.some((r) => r.startsWith("GESTURE"))).toBe(false);
  });

  it("offer a TURN its two ways, clockwise unset, and drop a SWIPE's arrow on the change", () => {
    const e = { ...blister(), gesture: "swipe", way: "up" } as WaveEntry;
    setBlisterGesture(e, "turn");
    expect(e.way).toBeUndefined();
    expect(blisterWayOfEntry(e)).toBe("cw");
    const rows = blisterRows(e, () => {}) as unknown as Node[];
    expect(said(rows)[1]).toBe("WAY ⟳ ⟲");
    rows[1]?.children[2]?.click?.();
    expect(e.way).toBe("ccw");
    expect(blisterWayOfEntry(reread(e))).toBe("ccw");
    setBlisterWay(e, "cw");
    expect(e.way).toBeUndefined();
  });

  it("offer a SWIPE its four ways as arrows, and set the one pressed", () => {
    const e = { ...blister(), gesture: "swipe" } as WaveEntry;
    let edits = 0;
    const rows = blisterRows(e, () => edits++) as unknown as Node[];
    expect(said(rows)[1]).toBe("WAY ← → ↑ ↓");
    rows[1]?.children[4]?.click?.();
    expect(e.way).toBe("down");
    expect(edits).toBe(1);
  });

  it("set the entry when a chip is pressed", () => {
    const e = blister();
    let edits = 0;
    const [by] = blisterRows(e, () => edits++) as unknown as Node[];
    by?.children[3]?.click?.();
    expect(e.by).toBe("both");
    by?.children[4]?.click?.();
    expect(e.by).toBeUndefined();
    expect(e.gesture).toBeUndefined();
    expect(edits).toBe(2);
  });
});
