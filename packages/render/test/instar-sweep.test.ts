import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { instarMarkUnder } from "../src/instar-mark-grip.js";
import { instarMarkPoint } from "../src/instar-place.js";
import { instarFigure, instarThreat } from "../src/instar-shape.js";
import { instarBody } from "../src/instar-sway.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";
import { acting, field, hung } from "./instar-kit.js";

/**
 * **A swept mark is found where it has swept to** (`sweepMilli`): the ring,
 * the grip and the fork all read the one place. A thumb that keeps tapping
 * where the blade stood when the window opened taps nothing by the end of
 * it, and the fork's blades are under the rings the whole way.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const L = computeLayout(VIEWPORT, CFG, "test");

describe("a swept mark", () => {
  it("is found where it has swept to late in the window, and not where it started", () => {
    const world = hung();
    const cursor = world.boss?.kind === "instar" ? world.boss.steps.findIndex(isSwept) : -1;
    expect(cursor).toBeGreaterThanOrEqual(0);
    const s = acting(world, cursor);
    const id = s.steps[cursor]?.marks.findIndex((m) => (m.sweepMilli ?? 0) !== 0) ?? -1;
    const mark = s.steps[cursor]?.marks[id];
    if (mark === undefined) throw new Error("the swept step has no swept mark");
    const beat = world.beat + (s.steps[cursor]?.windowBeats ?? 0) - 1;
    const { sway } = instarBody(s, CFG, beat, 0);
    const start = instarMarkPoint(L, mark, sway, 0);
    const now = instarMarkPoint(L, mark, sway, instarThreat(s, beat, 0));
    expect(instarMarkUnder(L, start.x, start.y, field(world, beat, 0))).toBeNull();
    const hold = instarMarkUnder(L, now.x, now.y, field(world, beat, 0))?.hold ?? null;
    expect(hold !== null && "id" in hold ? hold.id : null).toBe(id);
  });

  it("carries the fork along the same line as its blades", () => {
    const world = hung();
    const cursor = world.boss?.kind === "instar" ? world.boss.steps.findIndex(isSwept) : -1;
    const s = acting(world, cursor);
    const sweep = s.steps[cursor]?.marks[0]?.sweepMilli ?? 0;
    const open = instarFigure(s, world.beat, 0).tailX;
    const half = instarFigure(s, world.beat + (s.steps[cursor]?.windowBeats ?? 0) / 2, 0).tailX;
    expect(half - open).toBeCloseTo(sweep / 2, 6);
  });

  it("eases the fork back over the landing from where the window had it", () => {
    const world = hung();
    const cursor = world.boss?.kind === "instar" ? world.boss.steps.findIndex(isSwept) : -1;
    const s = acting(world, cursor);
    const step = s.steps[cursor];
    if (step === undefined) throw new Error("no swept step");
    const sweep = step.marks[0]?.sweepMilli ?? 0;
    const rest = instarFigure(s, world.beat, 0).tailX;
    const landed = { ...s, phase: "land" as const, phaseBeat: world.beat };
    const at = (beat: number) => instarFigure(landed, beat, 0, 0.5).tailX - rest;
    expect(at(world.beat)).toBeCloseTo(sweep / 2, 6);
    expect(Math.abs(at(world.beat + step.landBeats / 2))).toBeLessThan(Math.abs(sweep / 2));
    expect(at(world.beat + step.landBeats)).toBeCloseTo(0, 6);
  });
});

function isSwept(step: { marks: readonly { part: string; sweepMilli?: number }[] }): boolean {
  return step.marks.some((m) => m.part === "tail" && (m.sweepMilli ?? 0) !== 0);
}
