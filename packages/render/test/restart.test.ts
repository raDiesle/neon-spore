import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, type SimEvent } from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { computeLayout } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The bug this guards, once: the director restarts a wave by building a whole
 * new `World` — beat, tick and `nextId` all back to 0 — while the renderer's
 * `Effects` lives on across the swap. Anything it had cached against a beat
 * number or a creature id was then read by the new run as its own, and a
 * scar's crack drew before the rock that made it had visibly landed.
 *
 * `Effects.reset()` is the answer, and this is the part that keeps being the
 * answer: state added later is caught by the same test rather than by someone
 * noticing a ghost weeks afterwards. It compares structurally against a fresh
 * instance, so a new field costs nothing here as long as `reset` clears it —
 * and fails loudly the moment one does not.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
const BEAT_SECONDS = 60 / CFG.bpm;

/** One of everything that leaves a mark: a miss, a deflect, a swallow, a
 * blocked shot, the queen. Enough that every collection has something in it. */
const BUSY: SimEvent[] = [
  { type: "breach", col: 3, damage: 5, span: 1, kind: "meteor", fromRow: 12, beat: 7 },
  { type: "breach", col: 5, damage: 9, span: 2, kind: "torch", fromRow: 13, beat: 8 },
  { type: "deflect", col: 2, span: 1, kind: "meteorFast", fromRow: 11 },
  { type: "podTaken", col: 4, kind: "mend" },
  { type: "reject", col: 1, row: 4 },
  { type: "fire", col: 3, color: "cyan", lance: false },
  { type: "petal", col: 5, row: 2, left: 3 },
  { type: "tether", col: 4, color: "red" },
  { type: "plate", col: 6, row: 2, left: 2, color: "cyan" },
  // A lure folding to a point. It outlives its own frame — half a second of
  // it — so it is state, and state is what this file is for.
  { type: "lureVanished", col: 2, row: 10, color: "cyan" },
];

beforeAll(installCanvasGlobals);

describe("a wave restart", () => {
  it("leaves Effects indistinguishable from a fresh one", () => {
    const { ctx } = stubCanvas();
    const used = new Effects();

    used.ingest(BUSY, L, 0, () => 42, CFG);
    // Draw as well as ingest: the impacts only reach their `onArrive` — and so
    // the arrival latch — from inside `draw`, so ingesting alone would leave
    // the one collection this whole guard exists for empty.
    let t = 0;
    for (let i = 0; i < 240; i++) {
      t += 1 / 60;
      used.update(1 / 60, L);
      used.drawRockImpact(ctx as unknown as CanvasRenderingContext2D, L, t, () => L.hullY);
    }
    // It really did accumulate something, or the comparison below proves nothing.
    expect(used).not.toEqual(new Effects());

    used.reset();
    expect(used).toEqual(new Effects());
  });
});
