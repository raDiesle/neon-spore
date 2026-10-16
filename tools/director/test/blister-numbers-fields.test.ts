import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { WaveEntry } from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { blisterRows } from "../src/cell-config-blister.js";
import { setBlisterGesture } from "../src/entry-fields-blister.js";
import { serializeEntry } from "../src/serialize-entry.js";
import { BLISTER_SLIDERS } from "../src/tuning-blister.js";

/**
 * **A blister's UP, BLOWS and LENGTH rows** (`cell-config-blister.ts`,
 * `entry-fields-blister-numbers.ts`) and the TUNING sliders behind their
 * DEFAULT (`tuning-blister.ts`): the owner, 16 October 2026, *let me able to
 * configure the timings/length/number of action required for each control*.
 */

const blister = (gesture?: WaveEntry["gesture"]): WaveEntry =>
  ({ beat: 4, col: 3, kind: "blister", ...(gesture ? { gesture } : {}) }) as WaveEntry;

function reread(entry: WaveEntry): WaveEntry {
  return new Function(`return ${serializeEntry(entry)};`)() as WaveEntry;
}

interface Node {
  textContent: string;
  children: Node[];
  click?: () => void;
}

const said = (rows: unknown[]) =>
  (rows as Node[]).map((r) => r.children.map((c) => c.textContent).join(" "));

const rowNamed = (rows: unknown[], label: string): Node | undefined =>
  (rows as Node[]).find((r) => r.children[0]?.textContent === label);

describe("a blister's numbers on its cell", () => {
  let restore: () => void = () => {};
  beforeAll(() => {
    restore = installDom();
  });
  afterAll(() => restore());

  it("offers a LENGTH in the gesture's own unit, and none for TAP or RUB", () => {
    expect(said(blisterRows(blister("swipe"), () => {})).at(-1)).toBe(
      "LENGTH DEFAULT 2 TILES 1 TILE 1.5 TILES 2 TILES 2.5 TILES 3 TILES 4 TILES",
    );
    expect(said(blisterRows(blister("turn"), () => {})).at(-1)).toStartWith(
      "LENGTH DEFAULT 1 TURN",
    );
    expect(said(blisterRows(blister("hold"), () => {})).at(-1)).toStartWith(
      "LENGTH DEFAULT 1 BEAT",
    );
    for (const g of [undefined, "rub"] as const) {
      expect(
        rowNamed(
          blisterRows(blister(g), () => {}),
          "LENGTH",
        ),
      ).toBeUndefined();
    }
  });

  it("sets a number when a chip is pressed, survives a save, and DEFAULT writes no field", () => {
    const e = blister("swipe");
    let edits = 0;
    const rows = blisterRows(e, () => edits++);
    rowNamed(rows, "UP")?.children[3]?.click?.();
    rowNamed(rows, "BLOWS")?.children[4]?.click?.();
    rowNamed(rows, "LENGTH")?.children[6]?.click?.();
    expect(edits).toBe(3);
    expect([e.upBeats, e.blows, e.lengthMilli]).toEqual([3, 3, 3000]);
    const back = reread(e);
    expect([back.upBeats, back.blows, back.lengthMilli]).toEqual([3, 3, 3000]);
    rowNamed(
      blisterRows(e, () => {}),
      "UP",
    )?.children[1]?.click?.();
    expect(e.upBeats).toBeUndefined();
    expect(serializeEntry(e)).not.toContain("upBeats");
  });

  it("drops a length when the brush paints a gesture that measures in another unit", () => {
    const e = { ...blister("swipe"), lengthMilli: 3000 } as WaveEntry;
    setBlisterGesture(e, "combo");
    expect(e.lengthMilli).toBe(3000);
    setBlisterGesture(e, "hold");
    expect(e.lengthMilli).toBeUndefined();
  });
});

describe("TUNING's blister sliders", () => {
  it("move a real number of the game's, three a gesture and two for TAP and RUB", () => {
    expect(BLISTER_SLIDERS).toHaveLength(7 * 3 - 2);
    for (const s of BLISTER_SLIDERS) {
      expect(typeof DEFAULT_CONFIG[s.key]).toBe("number");
      const v = DEFAULT_CONFIG[s.key] as number;
      expect(v).toBeGreaterThanOrEqual(s.min);
      expect(v).toBeLessThanOrEqual(s.max);
    }
  });
});

/** The handful of `document` the rows build with, as `blister-fields.test.ts` stubs it. */
function installDom(): () => void {
  const g = globalThis as { document?: unknown };
  const had = g.document;
  const make = (): Node & { className: string; type: string; appendChild(n: Node): void } => {
    const node = {
      textContent: "",
      className: "",
      type: "",
      children: [] as Node[],
      listeners: [] as (() => void)[],
      appendChild(n: Node) {
        node.children.push(n);
      },
      addEventListener(_: string, f: () => void) {
        node.listeners.push(f);
      },
      click() {
        for (const f of node.listeners) f();
      },
    };
    return node;
  };
  g.document = { createElement: make };
  return () => {
    g.document = had;
  };
}
