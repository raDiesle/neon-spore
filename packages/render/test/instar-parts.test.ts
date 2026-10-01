import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import { beatSeconds, type World } from "@neon-spore/sim";
import { DEG, idleDrift } from "../src/idle-drift.js";
import { type PartAngles, partDrift, partSeed } from "../src/idle-drift-parts.js";
import { INSTAR_DRIFT } from "../src/instar-drift.js";
import { instarMarkUnder } from "../src/instar-mark-grip.js";
import { instarParts } from "../src/instar-parts.js";
import { instarMarkPoint } from "../src/instar-place.js";
import { instarFigure, instarThreat } from "../src/instar-shape.js";
import { instarSway } from "../src/instar-sway.js";
import { computeLayout } from "../src/layout.js";
import { correlation, maxAbs, maxSpeed, sample } from "./drift-stats.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";
import { acting, field, hung, TPB } from "./instar-kit.js";

/**
 * **THE INSTAR's parts drift on their own** (`instar-parts.ts`,
 * `docs/spec/living-bosses.md` §1): the head, the jaw, the eyes, each wing and
 * the tail on top of the body's turn. Every mark of every step is pressed
 * where the body *and* its head and tail are near their widest together, the
 * never-snaps ceilings hold for each part, and a frame draws within a tenth of
 * the body turning whole.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const SEED = 163;
const L = computeLayout(VIEWPORT, CFG, "test");
const SPAN = 600 / beatSeconds(CFG);
/** A side-on step with the jaw nearly shut and the wings folded, where every part has room. */
const SIDE_STEP = 22;

function drifting<T>(run: () => T, parts = true): T {
  const was = { ...INSTAR_DRIFT };
  INSTAR_DRIFT.amount = 1;
  INSTAR_DRIFT.parts = parts;
  try {
    return run();
  } finally {
    INSTAR_DRIFT.amount = was.amount;
    INSTAR_DRIFT.parts = was.parts;
  }
}

function at(beat: number): World {
  const world = hung();
  world.beat = Math.max(world.beat, beat);
  return world;
}

const world0 = hung();
const figure = instarFigure(acting(world0, SIDE_STEP), world0.beat + 2, 0);
const parts = (t: number) => instarParts(t, 1, figure, { xMilli: 0, yMilli: 0 });
const body = (t: number) => idleDrift(t, SEED, 1);

describe("each part stays inside the never-snaps ceilings", () => {
  const own: Record<string, (t: number) => number> = {
    "head turn": (t) => parts(t).headTurn,
    "head cock": (t) => parts(t).headPlane,
    jaw: (t) => parts(t).jaw,
    tail: (t) => parts(t).tailPlane,
    "near wing yaw": (t) => parts(t).wings[0].yaw,
    "near wing roll": (t) => parts(t).wings[0].roll,
    "far wing pitch": (t) => parts(t).wings[1].pitch,
  };
  for (const [name, f] of Object.entries(own)) {
    it(`${name} moves under 20°/s on its parent, and moves`, () => {
      const xs = sample(f);
      expect(maxSpeed(xs)).toBeLessThanOrEqual(20);
      expect(maxAbs(xs)).toBeGreaterThan(DEG);
    });
  }

  it("the head and the tail move under 30°/s on the screen", () => {
    const head = sample((t) => parts(t).headPlane + body(t).pitch + body(t).roll);
    const turn = sample((t) => parts(t).headTurn + body(t).yaw + body(t).headYaw);
    const tail = sample((t) => parts(t).tailPlane + body(t).pitch + body(t).roll);
    for (const xs of [head, turn, tail]) expect(maxSpeed(xs)).toBeLessThanOrEqual(30);
  });

  it("the two wings wander out of step, and the head apart from the tail", () => {
    // What each wing adds of its own: its delta less the follow both share.
    const follow = (seat: number) => (t: number) => {
      const b = (u: number): PartAngles => {
        const d = body(u);
        return { turn: d.yaw, tilt: d.pitch, rotate: d.roll };
      };
      return partDrift(t, partSeed(SEED, seat), "wing", b, 1, { letGo: 0 }).turn - b(t).turn;
    };
    const near = sample((t) => parts(t).wings[0].yaw - follow(2)(t));
    const far = sample((t) => parts(t).wings[1].yaw - follow(3)(t));
    expect(Math.abs(correlation(near, far))).toBeLessThan(0.5);
    const head = sample((t) => parts(t).headPlane);
    const tail = sample((t) => parts(t).tailPlane);
    expect(Math.abs(correlation(head, tail))).toBeLessThan(0.3);
  });
});

/** The beat where the body's yaw, the head's cock and the tail's swing are widest together. */
function widestAll(): { beat: number; phase: number; least: number } {
  const xs: { b: number; yaw: number; head: number; tail: number }[] = [];
  for (let b = 0; b < SPAN; b += 0.05) {
    const t = b * beatSeconds(CFG);
    const p = parts(t);
    xs.push({
      b,
      yaw: Math.abs(body(t).yaw),
      head: Math.abs(p.headPlane),
      tail: Math.abs(p.tailPlane),
    });
  }
  const top = (k: "yaw" | "head" | "tail") => Math.max(...xs.map((x) => x[k]));
  const [y, h, tl] = [top("yaw"), top("head"), top("tail")];
  let best = { beat: 0, phase: 0, least: 0 };
  for (const x of xs) {
    const least = Math.min(x.yaw / y, x.head / h, x.tail / tl);
    if (least > best.least) best = { beat: Math.floor(x.b), phase: x.b - Math.floor(x.b), least };
  }
  return best;
}

describe("a thumb finds a mark where the body and its parts carried it", () => {
  const w = widestAll();

  it("finds a beat where the yaw, the head and the tail are each near half their widest", () => {
    // Three drifts on unrelated seeds are seldom all at their peak at once.
    expect(w.least).toBeGreaterThan(0.4);
  });

  it("presses every mark of every step there, the slow shut", () =>
    drifting(() => {
      const extra = { head: 0, tail: 0 };
      for (let cursor = 0; cursor < INSTAR_SCRIPT.length; cursor++) {
        const world = at(w.beat);
        const s = acting(world, cursor);
        const sway = instarSway(s, CFG, world, world.beat, w.phase);
        const along = instarThreat(s, world.beat, w.phase);
        const d = sway.drift;
        (s.steps[cursor]?.marks ?? []).forEach((mark, id) => {
          const p = instarMarkPoint(L, mark, sway, along);
          if (d !== undefined && (mark.part === "head" || mark.part === "tail")) {
            const { parts: _, ...whole } = d;
            const q = instarMarkPoint(L, mark, { ...sway, drift: whole }, along);
            const k = mark.part;
            extra[k] = Math.max(extra[k], Math.hypot(p.x - q.x, p.y - q.y) / L.tile);
          }
          const t = instarMarkUnder(L, p.x, p.y, field(world, world.beat, w.phase));
          const pressed = t?.command ?? null;
          expect(
            pressed !== null && "id" in pressed ? pressed.id : null,
            `step ${cursor} mark ${id}`,
          ).toBe(id);
        });
      }
      // The parts carried a head mark and a tail mark beyond where the body alone would.
      expect(extra.head).toBeGreaterThan(0.1);
      expect(extra.tail).toBeGreaterThan(0.1);
    }));
});

describe("what a frame costs with the parts drifting", () => {
  installCanvasGlobals();
  const worst = (): Map<string, number> => {
    const world = hung();
    acting(world, SIDE_STEP);
    const most = new Map<string, number>();
    runFrames(world, "p1", TPB, {
      viewport: { width: 390, height: 844, dpr: 3 },
      onDrawn: (ctx, frame) => {
        if (frame >= 2) for (const [k, v] of ctx.tally) most.set(k, Math.max(most.get(k) ?? 0, v));
        ctx.tally.clear();
      },
    });
    return most;
  };

  it("draws within a tenth of the body turning whole", () => {
    const whole = drifting(worst, false);
    const moving = drifting(worst);
    for (const key of [
      "fill",
      "stroke",
      "drawImage",
      "createLinearGradient",
      "createRadialGradient",
    ]) {
      expect(moving.get(key) ?? 0, key).toBeLessThanOrEqual(Math.ceil((whole.get(key) ?? 0) * 1.1));
    }
  });
});
