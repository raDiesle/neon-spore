import { afterEach, describe, expect, test } from "bun:test";
import type { Wave } from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { faultConfig } from "../src/fault-config.js";
import { bindRowActs, type RowActs } from "../src/grid-row-acts.js";
import { faultMarks, paintFault } from "../src/paint-fault.js";
import type { Selection } from "../src/selection.js";
import { FakeEl, installDom } from "./fake-dom.js";

/**
 * **A malfunction is authored on the row it is placed on, and nowhere else.**
 *
 * The owner settled it on 18 September 2026: *malfunction should be removed as
 * a global wave setting of the wave section, and whenever I assign a brush
 * malfunction to a row in the map editor it should be active at that point in
 * time, and I can configure for how many rows the malfunction will last.* The
 * picker that used to sit under the control set is gone; what replaces it is
 * the block under the map, and the number in it is the whole reason it exists.
 */

let undo: (() => void) | null = null;
afterEach(() => {
  undo?.();
  undo = null;
});

function dom(): void {
  const installed = installDom();
  undo = () => installed.restore();
}

const wave = (): Wave => ({
  id: "t",
  name: "TEST",
  sentence: "The one where a test paints on it.",
  entries: [],
});

/** Every element under this one, the panel included — the fake document has no
 * selectors, and what a test asks about is two levels down. */
function all(el: FakeEl): FakeEl[] {
  return [el, ...el.children.flatMap(all)];
}

const beatsBox = (panel: FakeEl): FakeEl => {
  const found = all(panel).find((e) => e.classes.has("fault-beats"));
  if (!found) throw new Error("no HELD FOR box was built");
  return found;
};

const render = (w: Wave, beat: number): FakeEl | null =>
  faultConfig({ wave: w, beat, onEdit: () => {} }) as unknown as FakeEl | null;

describe("the malfunction block under the map", () => {
  test("is nothing at all on a row no fault enters on", () => {
    dom();
    const w = wave();
    expect(render(w, 4)).toBeNull();
    paintFault(w, 9, "codex");
    // The row it is on, not a row it merely holds over: the panel edits the
    // placement, and a placement belongs to the beat it was painted on.
    expect(render(w, 10)).toBeNull();
    expect(render(w, 9)).not.toBeNull();
  });

  test("writes how many rows it lasts, and an empty box is to the end", () => {
    dom();
    const w = wave();
    paintFault(w, 3, "steer");
    const panel = render(w, 3);
    if (!panel) throw new Error("no panel");
    const box = beatsBox(panel);
    box.value = "6";
    box.fire("change");
    expect(w.faults).toEqual([{ kind: "steer", at: 3, beats: 6 }]);
    box.value = "";
    box.fire("change");
    expect(w.faults).toEqual([{ kind: "steer", at: 3, beats: undefined }]);
  });

  test("gives a cleared HANDOVER the game's own hold rather than no end", () => {
    dom();
    const w = wave();
    paintFault(w, 2, "handover");
    // The pencil places it with one: two panels that change screens and never
    // come home is not a long fault, it is a broken one.
    expect(w.faults?.[0]?.beats).toBe(DEFAULT_CONFIG.handoverHoldBeats);
    const panel = render(w, 2);
    if (!panel) throw new Error("no panel");
    const box = beatsBox(panel);
    box.value = "";
    box.fire("change");
    expect(w.faults?.[0]?.beats).toBe(DEFAULT_CONFIG.handoverHoldBeats);
  });

  test("offers the ammunition on a cannon and the screen on a flip, and neither on a codex", () => {
    dom();
    const w = wave();
    paintFault(w, 0, "cannon");
    paintFault(w, 1, "flip");
    paintFault(w, 2, "codex");
    const labels = (beat: number): string[] =>
      all(render(w, beat) as FakeEl)
        .filter((e) => e.classes.has("cell-row-label"))
        .map((e) => e.textContent);
    expect(labels(0)).toEqual(["HELD FOR", "AMMUNITION"]);
    expect(labels(1)).toEqual(["HELD FOR", "TURNED SCREEN"]);
    expect(labels(2)).toEqual(["HELD FOR"]);
  });

  test("picks the seat THE FLIP turns", () => {
    dom();
    const w = wave();
    paintFault(w, 5, "flip");
    const panel = render(w, 5);
    if (!panel) throw new Error("no panel");
    const p2 = all(panel).find((e) => e.textContent === "P2 NAVIGATOR");
    p2?.click();
    expect(w.faults).toEqual([{ kind: "flip", at: 5, seat: 2 }]);
  });

  test("lifts a placement off the row", () => {
    dom();
    const w = wave();
    paintFault(w, 7, "leech");
    const panel = render(w, 7);
    if (!panel) throw new Error("no panel");
    all(panel)
      .find((e) => e.textContent === "✕ LIFT")
      ?.click();
    expect(w.faults).toBeUndefined();
  });
});

/**
 * What the map says about a fault: the stripe down the beat column
 * (`grid-rows.ts`) and the name at the end of the row it enters on
 * (`grid-row-acts.ts`). A length typed in a box with nothing on the map
 * agreeing with it is a pencil an author can put down and then not find, so
 * the window is drawn as what it is — a run of rows with its kind written at
 * the top of it.
 */
describe("what the map marks", () => {
  test("names the row a fault enters on and every row it holds", () => {
    const w: Wave = { ...wave(), faults: [{ kind: "steer", at: 2, beats: 3 }] };
    const marks = faultMarks(w, 6);
    expect(marks.map((m) => m.holds)).toEqual([false, false, true, true, true, false]);
    expect(marks.map((m) => m.enters.length)).toEqual([0, 0, 1, 0, 0, 0]);
    expect(marks[2]?.enters).toEqual(["STEER"]);
  });

  test("holds to the last row when no length was written", () => {
    const w = wave();
    paintFault(w, 1, "codex");
    expect(faultMarks(w, 4).map((m) => m.holds)).toEqual([false, true, true, true]);
  });

  test("names every kind entering on one row", () => {
    const w = wave();
    paintFault(w, 3, "steer");
    paintFault(w, 3, "codex");
    expect(faultMarks(w, 4)[3]?.enters).toEqual(["STEER", "CODEX"]);
  });
});

/**
 * The strip at the end of the row, which is where that name is written. The
 * owner asked for it on 18 September 2026 — the stripe said *a fault holds
 * here* and nothing said *which* — and it goes beside the trash rather than
 * over the map: a label laid across the cells would hide the arrival the
 * author is looking at.
 */
describe("the end of a row", () => {
  const acts = (): RowActs => {
    dom();
    const grid = new FakeEl();
    return bindRowActs(
      grid as unknown as HTMLElement,
      { insertRow: () => {}, removeRow: () => {} },
      { at: () => null, set: () => {}, watch: () => {} } as unknown as Selection,
    );
  };

  test("writes the fault's kind beside the trash", () => {
    const strip = acts().end(4, ["HANDOVER"]) as unknown as FakeEl;
    const tag = strip.children.find((c) => c.classes.has("rowtag"));
    expect(tag?.textContent).toBe("HANDOVER");
    expect(tag?.title).toBe("HANDOVER — enters on beat 4");
    expect(strip.children.some((c) => c.classes.has("rowdel"))).toBe(true);
  });

  test("writes nothing at all on a row no fault enters on", () => {
    const strip = acts().end(4, []) as unknown as FakeEl;
    expect(strip.children.map((c) => c.className)).toEqual(["rowdel"]);
  });
});
