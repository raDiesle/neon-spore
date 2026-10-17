import { describe, expect, test } from "bun:test";
import { controlSet, isRegularWave, WAVES, type Wave, waveTalk } from "@neon-spore/content";
import { BLOCK_STEPS } from "../src/compose-steps.js";
import {
  splitCurriculum,
  teachingList,
  teachingOrder,
  type Unit,
  type UnitKind,
} from "../src/curriculum-order.js";

/**
 * The order new things are taught in (`docs/spec/wave-curriculum.md` §4.1,
 * decision 9): rising cost, bodies and levers taking turns, each after what
 * it carries — and the list ships in that order, so `waves:order` would move
 * nothing.
 */

const unit = (id: string, kind: UnitKind, cost: number, needs: string[] = []): Unit => ({
  head: { id, name: id, entries: [] },
  waves: [],
  kind,
  cost,
  needs: new Set(needs),
});
const ids = (units: readonly Unit[]) => units.map((u) => u.head.id);

describe("the teaching order", () => {
  test("is cheapest first, ties in the order they came", () => {
    const units = [unit("b", "body", 3), unit("a", "body", 2), unit("c", "body", 3)];
    expect(ids(teachingOrder(units))).toEqual(["a", "b", "c"]);
  });

  test("never puts a lever after a lever while a body is ready", () => {
    const units = [unit("f1", "fault", 1), unit("f2", "fault", 1), unit("b", "body", 5)];
    expect(ids(teachingOrder(units))).toEqual(["f1", "b", "f2"]);
  });

  test("brings a lever once enough bodies have come to spread the rest", () => {
    // Four bodies and one lever: the lever is due after two.
    const units = [
      ...["b1", "b2", "b3", "b4"].map((id) => unit(id, "body", 1)),
      unit("p", "panel", 9),
    ];
    expect(ids(teachingOrder(units))).toEqual(["b1", "b2", "p", "b3", "b4"]);
  });

  test("puts a unit after every unit it needs", () => {
    const units = [unit("jam", "fault", 1, ["lure"]), unit("lure", "body", 5)];
    expect(ids(teachingOrder(units))).toEqual(["lure", "jam"]);
  });
});

describe("the game's list", () => {
  const cur = splitCurriculum(WAVES);
  const order = teachingOrder(cur.units);

  // A block the composer cannot fill where the rule puts it waits for the
  // next place (`waves:order` says so as it runs). None waits today: THE
  // HUSK, which found no ramp behind THE BLISTER, is first after FINALE
  // since 16 October 2026 (`FIRST_AFTER_ARC`).
  const WAITED: string[] = [];

  test("teaches its new things in the rule's order, but for the blocks that waited", () => {
    const rest = (us: readonly Unit[]) => ids(us).filter((id) => !WAITED.includes(id));
    expect(rest(cur.units)).toEqual(rest(order));
    for (const id of WAITED) {
      const at = (us: readonly Unit[]) => ids(us).indexOf(id);
      expect(at(cur.units)).toBeGreaterThan(at(order));
    }
  });

  test("teaches each unit after every unit it needs", () => {
    const seen = new Set<string>();
    for (const u of cur.units) {
      expect({ unit: u.head.id, missing: [...u.needs].filter((n) => !seen.has(n)) }).toEqual({
        unit: u.head.id,
        missing: [],
      });
      seen.add(u.head.id);
    }
  });

  test("has no lever after a lever: the arc ends on a body", () => {
    const after = cur.units.flatMap((u, i) =>
      u.kind === "body" ? [] : [`${u.head.id} after ${cur.units[i - 1]?.kind ?? "the arc"}`],
    );
    expect(after.filter((s) => !s.endsWith("body") && !s.endsWith("the arc"))).toEqual([]);
  });

  test("is the teaching list once the composed waves and bosses are out", () => {
    const heads = new Set(cur.units.map((u) => u.head.id));
    const kept = teachingList(cur, cur.units).map((w) => w.id);
    const shipped = WAVES.filter((w) => kept.includes(w.id)).map((w) => w.id);
    expect(shipped).toEqual(kept);
    expect(kept.filter((id) => heads.has(id))).toEqual(ids(cur.units));
  });

  test("never takes the hold away once THE LANCE has taught it", () => {
    const lance = WAVES.findIndex((w) => w.id === "theLance");
    // THE LEAK's rehearsal fills nothing under a hold, on purpose.
    WAVES.forEach((w, i) => {
      if (i > lance && !w.boss && w.id !== "theLeak")
        expect({ id: w.id, panel: controlSet(w.controls).id }).not.toEqual({
          id: w.id,
          panel: "standard5",
        });
    });
  });

  test("rises in talk from the first blocks after the arc to the last", () => {
    // The gentlest talk of each block's regular waves, block by block.
    const floors: number[] = [];
    let block: number[] = [];
    const finale = WAVES.findIndex((w) => w.id === "finale");
    const heads = new Set(cur.units.map((u) => u.head.id));
    WAVES.forEach((w: Wave, i) => {
      if (i <= finale) return;
      if (heads.has(w.id) && block.length) {
        floors.push(Math.min(...block));
        block = [];
      }
      const t = isRegularWave(WAVES, i) ? waveTalk(w) : undefined;
      if (t !== undefined) block.push(t);
    });
    const third = Math.floor(floors.length / 3);
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    expect(mean(floors.slice(-third))).toBeGreaterThan(mean(floors.slice(0, third)));
  });
});

describe("the units the owner put first", () => {
  test("THE HUSK is taught straight after FINALE, on the arc's own panel", () => {
    // The owner, 16 October 2026: the hollow pod after the real pods' exam.
    const finale = WAVES.findIndex((w) => w.id === "finale");
    expect(WAVES[finale + 1]?.id).toBe("theHusk");
    const block = WAVES.slice(finale + 1).filter((w) => w.id.startsWith("theHusk"));
    expect(block.length).toBe(1 + BLOCK_STEPS.length);
    for (const w of block) expect(controlSet(w.controls).id).toBe("standard5");
  });
});
