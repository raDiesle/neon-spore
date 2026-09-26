import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { instarMarkUnder } from "../src/instar-mark-grip.js";
import { instarMarkPoint } from "../src/instar-shape.js";
import { instarBody, instarSway } from "../src/instar-sway.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";
import { acting, field, hung } from "./instar-kit.js";

/**
 * **THE INSTAR's body travels, and everything of it travels together.**
 *
 * The owner asked for the movement on 22 September 2026 and said what it is
 * for: *so we better see the slow effect when something was moving fast*. So
 * the first thing pinned here is that the travel is **large** — a swing that
 * covered a few pixels would leave a slow window with nothing to slow.
 *
 * The second is the one a look of this kind gets wrong quietly: a mark is
 * *drawn* at one place and *found* at another, and the game keeps playing.
 * Both readings come from `instarSway`, so the test presses the glass where
 * the ring is painted and expects the hold, and presses where the body would
 * have hung and expects nothing.
 *
 * Nothing here has to test the slow itself. The swing is a function of `beat`
 * and `beatPhase` and reads no clock, so a window that makes beats arrive at a
 * third of the wall rate carries it for free — that third is
 * `apps/game/test/tick-rate.test.ts`, and what is pinned below is the property
 * that makes it apply: the same point of the swing whichever side of a beat
 * boundary it is read from.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const L = computeLayout(VIEWPORT, CFG, "test");
describe("the body travels", () => {
  it("carries the head a fifth of the field across a beat", () => {
    const world = hung();
    const s = acting(world, 0);
    const xs = [0, 0.25, 0.5, 0.75].map((p) => instarBody(s, CFG, world.beat, p).f.headX);
    const span = Math.max(...xs) - Math.min(...xs);
    expect(span).toBeGreaterThan(200);
  });

  it("carries the marks the same distance as the head, so the body does not shear", () => {
    const world = hung();
    const s = acting(world, 0);
    const mark = s.steps[0]?.marks[0];
    if (mark === undefined) throw new Error("the script's first step has no mark");
    const at = (phase: number): { head: number; ring: number } => {
      const { f, sway } = instarBody(s, CFG, world.beat, phase);
      return { head: f.headX, ring: instarMarkPoint(L, mark, sway, 0).x };
    };
    const a = at(0);
    const b = at(0.25);
    expect(b.head - a.head).toBeCloseTo(((b.ring - a.ring) * 1000) / L.gridWidth, 6);
  });
});

describe("a thumb finds a mark where it is drawn", () => {
  it("takes the ring at its swung place", () => {
    const world = hung();
    const s = acting(world, 0);
    const beat = world.beat;
    const phase = 0.25; // the far end of the swing, where the two places differ most
    const mark = s.steps[0]?.marks[0];
    if (mark === undefined) throw new Error("the script's first step has no mark");
    const { sway } = instarBody(s, CFG, beat, phase);
    const at = instarMarkPoint(L, mark, sway, 0);
    const t = instarMarkUnder(L, at.x, at.y, field(world, beat, phase));
    expect(t?.command?.kind).toBe("drag");
    const hold = t?.hold ?? null;
    expect(hold !== null && "id" in hold ? hold.id : null).toBe(0);
  });

  it("finds nothing where the body would have hung", () => {
    const world = hung();
    const s = acting(world, 0);
    const beat = world.beat;
    const phase = 0.25;
    const mark = s.steps[0]?.marks[0];
    if (mark === undefined) throw new Error("the script's first step has no mark");
    const still = instarMarkPoint(L, mark, { xMilli: 0, yMilli: 0 }, 0);
    expect(instarMarkUnder(L, still.x, still.y, field(world, beat, phase))).toBeNull();
  });
});

describe("the swing is beats and nothing else", () => {
  it("stands at the same place whichever side of a boundary the beat is counted from", () => {
    const world = hung();
    const s = acting(world, 0);
    const a = instarSway(s, CFG, world.beat, 0.75);
    const b = instarSway(s, CFG, world.beat + 1, -0.25);
    expect(b.xMilli).toBeCloseTo(a.xMilli, 9);
    expect(b.yMilli).toBeCloseTo(a.yMilli, 9);
  });

  it("hangs still once the body is beaten", () => {
    const world = hung();
    const s = acting(world, 0);
    const alive = instarSway(s, CFG, world.beat, 0.25);
    s.phase = "down";
    s.phaseBeat = world.beat;
    // The same instant, now that it has been beaten: already damped, and gone
    // by the time the body may leave (`instarOutBeats`).
    const dying = instarSway(s, CFG, world.beat, 0.25);
    const stilled = instarSway(s, CFG, world.beat + CFG.instarOutBeats, 0.25);
    expect(Math.abs(alive.xMilli)).toBeGreaterThan(0);
    expect(Math.abs(dying.xMilli)).toBeLessThan(Math.abs(alive.xMilli));
    expect(stilled.xMilli).toBeCloseTo(0, 9);
    expect(stilled.yMilli).toBeCloseTo(0, 9);
  });
});
