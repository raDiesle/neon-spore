import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import { beatSeconds, type InstarState, type World } from "@neon-spore/sim";
import { instarMarkUnder } from "../src/instar-mark-grip.js";
import { instarMarkPoint } from "../src/instar-place.js";
import { instarThreat } from "../src/instar-shape.js";
import { instarBody, instarHush, instarSway } from "../src/instar-sway.js";
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
 * Nothing here has to test the slow's rate itself. The swing is a function of `beat`
 * and `beatPhase` and reads no clock, so a window that makes beats arrive at a
 * third of the wall rate carries it for free — that third is
 * `apps/game/test/tick-rate.test.ts`, and what is pinned below is the property
 * that makes it apply: the same point of the swing whichever side of a beat
 * boundary it is read from.
 *
 * **And a window hushes it** — the owner, 27 September 2026: *circles should
 * almost stay where they are*. Every mark of every step, through the whole of
 * its window after the half beat the weave takes to die down, is drawn moving
 * less than a tenth of a tile a wall-clock second, and is still found where
 * it is drawn. A swept mark's travel along its track is the gesture, so the
 * speed is read with it held where it started.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const L = computeLayout(VIEWPORT, CFG, "test");
describe("the body travels", () => {
  it("carries the head a fifth of the field across a beat", () => {
    const world = hung();
    const s = acting(world, 0);
    const xs = [0, 0.25, 0.5, 0.75].map((p) => instarBody(s, CFG, world, world.beat, p).f.headX);
    const span = Math.max(...xs) - Math.min(...xs);
    expect(span).toBeGreaterThan(200);
  });

  it("carries the marks the same distance as the head, so the body does not shear", () => {
    const world = hung();
    const s = acting(world, 0);
    const mark = s.steps[0]?.marks[0];
    if (mark === undefined) throw new Error("the script's first step has no mark");
    const at = (phase: number): { head: number; ring: number } => {
      const { f, sway } = instarBody(s, CFG, world, world.beat, phase);
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
    const { sway } = instarBody(s, CFG, world, beat, phase);
    const at = instarMarkPoint(L, mark, sway, 0);
    const t = instarMarkUnder(L, at.x, at.y, field(world, beat, phase));
    expect(t?.command?.kind).toBe("drag");
    // The command names the mark on either seat; only its own seat gets a hold.
    const pressed = t?.command ?? null;
    expect(pressed !== null && "id" in pressed ? pressed.id : null).toBe(0);
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
    const a = instarSway(s, CFG, world, world.beat, 0.75);
    const b = instarSway(s, CFG, world, world.beat + 1, -0.25);
    expect(b.xMilli).toBeCloseTo(a.xMilli, 9);
    expect(b.yMilli).toBeCloseTo(a.yMilli, 9);
  });

  it("hangs still once the body is beaten", () => {
    const world = hung();
    const s = acting(world, 0);
    const alive = instarSway(s, CFG, world, world.beat, 0.25);
    s.phase = "down";
    s.phaseBeat = world.beat;
    // The same instant, now that it has been beaten: already damped, and gone
    // by the time the body may leave (`instarOutBeats`).
    const dying = instarSway(s, CFG, world, world.beat, 0.25);
    const stilled = instarSway(s, CFG, world, world.beat + CFG.instarOutBeats, 0.25);
    expect(Math.abs(alive.xMilli)).toBeGreaterThan(0);
    expect(Math.abs(dying.xMilli)).toBeLessThan(Math.abs(alive.xMilli));
    expect(stilled.xMilli).toBeCloseTo(0, 9);
    expect(stilled.yMilli).toBeCloseTo(0, 9);
  });
});

/** The window opened over the step `acting` put up, as the simulation opens it (`sim/instar-step.ts`). */
function slowed(world: World, cursor: number): { s: InstarState; from: number; to: number } {
  const s = acting(world, cursor);
  const from = world.beat;
  const to = from + (s.steps[cursor]?.windowBeats ?? 0);
  world.slowFromBeat = from;
  world.slowToBeat = to;
  return { s, from, to };
}

describe("a window hushes the weave", () => {
  // A wall-clock second at the window's rate is this many beats.
  const perSecond = CFG.slowRateMilli / 1000 / beatSeconds(CFG);
  const DT = 1 / 25; // beats between two readings

  for (let cursor = 0; cursor < INSTAR_SCRIPT.length; cursor++) {
    it(`holds step ${cursor}'s marks nearly still, and finds them where they are drawn`, () => {
      const world = hung();
      const { s, from, to } = slowed(world, cursor);
      const marks = s.steps[cursor]?.marks ?? [];
      const at = (b: number, id: number, along: number) => {
        const beat = Math.floor(b);
        const { sway } = instarBody(s, CFG, world, beat, b - beat);
        const mark = marks[id];
        if (mark === undefined) throw new Error(`step ${cursor} has no mark ${id}`);
        return instarMarkPoint(L, mark, sway, along);
      };
      let fastest = 0;
      for (let b = from + 0.5; b + DT < to; b += DT) {
        for (let id = 0; id < marks.length; id++) {
          const a = at(b, id, 0);
          const c = at(b + DT, id, 0);
          const tiles = Math.hypot(c.x - a.x, c.y - a.y) / L.tile;
          fastest = Math.max(fastest, (tiles / DT) * perSecond);
        }
      }
      expect(fastest).toBeLessThan(0.1);
      for (const b of [from + 0.5, (from + to) / 2, to - 0.25]) {
        const beat = Math.floor(b);
        for (let id = 0; id < marks.length; id++) {
          const p = at(b, id, instarThreat(s, beat, b - beat));
          const t = instarMarkUnder(L, p.x, p.y, field(world, beat, b - beat));
          const pressed = t?.command ?? null;
          expect(
            pressed !== null && "id" in pressed ? pressed.id : null,
            `mark ${id} at ${b}`,
          ).toBe(id);
        }
      }
    });
  }

  it("dies down over half a beat and comes back over half a beat after the window shuts", () => {
    const world = hung();
    const { from, to } = slowed(world, 0);
    const hush = (b: number) => instarHush(world, Math.floor(b), b - Math.floor(b));
    expect(hush(from - 0.01)).toBe(1);
    expect(hush(from)).toBe(1);
    expect(hush(from + 0.25)).toBeLessThan(1);
    expect(hush(from + 0.25)).toBeGreaterThan(0.1);
    expect(hush(from + 0.5)).toBeCloseTo(0.05, 9);
    expect(hush(to - 0.01)).toBeCloseTo(hush(to), 3);
    expect(hush(to + 0.5)).toBe(1);
    // Shut early — a landing — and it comes back from where it had got to.
    world.slowToBeat = from + 0.25;
    expect(hush(from + 0.25)).toBeCloseTo(hush(from + 0.2499), 3);
    expect(hush(from + 0.75)).toBe(1);
  });
});
