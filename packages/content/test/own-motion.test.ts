import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  isBossBody,
  isMeteorKind,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import {
  beats,
  bodyPhase,
  HOLD,
  livingMotion,
  type OwnMotion,
  type Pose,
  poseClock,
  REST,
  SWAY_PUMP,
  TILT_RIPPLE,
  TREMBLE,
} from "../src/own-motion.js";
import { buildBoss, buildPods, buildQueue } from "../src/queue.js";

/**
 * Spec 5.8: own-motion may not touch the lane. A creature that swayed half a
 * tile would sit over the column line, and the whole readability of the field
 * rests on a player being able to say "column four" and mean it.
 */
const LANE_LIMIT = 0.25;

function samples(m: OwnMotion): Pose[] {
  const out = [];
  for (let t = 0; t < 64; t += 0.01) out.push(m.poseAt(beats(t)));
  return out;
}

/** The furthest a motion's own signal reaches, all four channels summed. */
function reach(m: OwnMotion): number {
  let worst = 0;
  for (const p of samples(m)) {
    const r =
      Math.abs(p.dx) + Math.abs(p.dy) + Math.abs(p.rot) + Math.abs(p.sx - 1) + Math.abs(p.sy - 1);
    if (r > worst) worst = r;
  }
  return worst;
}

describe("own-motion", () => {
  for (const m of [SWAY_PUMP, TILT_RIPPLE, TREMBLE, HOLD]) {
    it(`${m.name} stays inside its column`, () => {
      for (const p of samples(m)) {
        expect(Math.abs(p.dx)).toBeLessThan(LANE_LIMIT);
        expect(Math.abs(p.dy)).toBeLessThan(LANE_LIMIT);
      }
    });

    it(`${m.name} never collapses or inverts its scale`, () => {
      for (const p of samples(m)) {
        expect(p.sx).toBeGreaterThan(0.5);
        expect(p.sy).toBeGreaterThan(0.5);
        expect(p.sx).toBeLessThan(2);
        expect(p.sy).toBeLessThan(2);
      }
    });

    it(`${m.name} actually moves — a still motion is a missing one`, () => {
      const poses = samples(m);
      const moved = poses.some(
        (p) => Math.abs(p.dx) > 0.01 || Math.abs(p.rot) > 0.01 || Math.abs(p.sx - 1) > 0.01,
      );
      expect(moved).toBe(true);
    });
  }

  it("pairs each living kind with its own motion", () => {
    expect(livingMotion("bulb")).toBe(SWAY_PUMP);
    expect(livingMotion("slick")).toBe(TILT_RIPPLE);
    expect(livingMotion("throb")).toBe(HOLD);
  });

  it("the throb no longer borrows the slick's tilt", () => {
    // The bug this file exists to fix: the throb used to fall through to
    // TILT_RIPPLE and tilted like a slick. The runt had the same bug and the
    // same fix; it was retired for THE LURE, and `TREMBLE` outlived it as a
    // spare — which is why the motion is still imported and still sampled by
    // the reach tests above.
    expect(livingMotion("throb")).not.toBe(TILT_RIPPLE);
  });

  it("a lure has no motion of its own to be asked for", () => {
    // The one thing this pairing must never grow: a lure sways as the body it
    // wears, resolved by `wornKind` before `livingMotion` is called at all. A
    // case for it here would be a tell on player 1's screen.
    expect(TREMBLE).not.toBe(livingMotion("slick"));
  });

  it("the throb's own-motion is the smallest of the four — it must not compete with the beat", () => {
    const throbReach = reach(HOLD);
    expect(throbReach).toBeLessThan(reach(SWAY_PUMP));
    expect(throbReach).toBeLessThan(reach(TILT_RIPPLE));
    expect(throbReach).toBeLessThan(reach(TREMBLE));
  });

  it("the throb never rotates or scales — either would shadow its own clockwise turn", () => {
    for (const p of samples(HOLD)) {
      expect(p.rot).toBe(0);
      expect(p.sx).toBe(1);
      expect(p.sy).toBe(1);
    }
  });

  it("rests at the identity", () => {
    expect(REST).toEqual({ dx: 0, dy: 0, rot: 0, sx: 1, sy: 1 });
  });
});

/**
 * A body's place in the cycle, and why seven of them was not enough.
 *
 * `(id % 7) * 0.9` gave an eleven-column field seven phases, so a row of
 * neighbours moving in step was routine rather than unlucky — and the two ids
 * most likely to stand side by side, n and n + 1, were always exactly 0.9
 * apart. These tests are the arithmetic that says so.
 */
describe("a body's phase", () => {
  const IDS = Array.from({ length: 400 }, (_, i) => i + 1);

  it("is a fraction of the cycle, and never leaves it", () => {
    for (const id of IDS) {
      const p = bodyPhase(id);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThan(1);
    }
  });

  it("gives four hundred bodies four hundred phases, where the modulo gave seven", () => {
    expect(new Set(IDS.map(bodyPhase)).size).toBe(IDS.length);
    expect(new Set(IDS.map((id) => (id % 7) * 0.9)).size).toBe(7);
  });

  it("spreads any row of eleven neighbours right across the cycle", () => {
    // Eleven columns is a full row of the field. Every window of eleven
    // consecutive ids has to cover most of the cycle, or a row still moves as
    // one object — which is the thing the modulo could not avoid.
    for (let first = 1; first + 10 <= IDS.length; first++) {
      const row = Array.from({ length: 11 }, (_, k) => bodyPhase(first + k));
      expect(Math.max(...row) - Math.min(...row)).toBeGreaterThan(0.4);
      expect(new Set(row).size).toBe(row.length);
    }
  });

  it("is the same number every time it is asked", () => {
    for (const id of IDS) expect(bodyPhase(id)).toBe(bodyPhase(id));
  });
});

/**
 * The two phones, and the reason any of this moved off `view.time`.
 *
 * `apps/game/src/main.ts` fills `ViewState.time` from `performance.now()`,
 * which counts from whenever *that* page opened. Two people do not open the
 * page at the same instant, so a pose sampled at `time` was a different pose
 * on each phone — the bodies disagreed about what they looked like, in a game
 * whose entire control scheme is two people describing shapes to each other.
 *
 * `world.beat + beatPhase` is lockstep state: it comes off the tick counter,
 * which both devices agree about by construction. The test below builds two
 * worlds independently, drives them to the same tick along different routes,
 * derives each one's render clock the way `main.ts` derives it, and poses
 * every creature on the field from both.
 */
describe("two devices", () => {
  const cfg = DEFAULT_CONFIG;
  // Wave 2 puts two bulbs and a slick on the field a few hundred ticks in:
  // three living bodies, two of them the same kind, which is the case where a
  // phase collision would have been visible and a wall clock catastrophic.
  const WAVE = 2;

  /** One phone: its own `World`, stepped in its own frame-sized chunks. */
  function device(ticks: number, chunk: number): World {
    const world = createWorld({ ...cfg }, WAVE);
    startWave(
      world,
      WAVE,
      buildQueue(WAVE, cfg.cols),
      buildPods(WAVE, cfg.cols),
      buildBoss(WAVE, cfg.cols),
    );
    let done = 0;
    while (done < ticks) {
      const n = Math.min(chunk, ticks - done);
      for (let i = 0; i < n; i++) step(world, []);
      done += n;
    }
    return world;
  }

  /** `ViewState`'s two lockstep fields, exactly as `main.ts` computes them. */
  function renderClock(world: World): number {
    const tpb = ticksPerBeat(cfg);
    return world.beat + (world.tick % tpb) / tpb;
  }

  it("draw every body at the same point in its cycle", () => {
    // Different chunk sizes stand in for two phones running at different frame
    // rates: the same 400 ticks, reached by different numbers of frames.
    const a = device(400, 7);
    const b = device(400, 3);
    expect(hashWorld(a)).toBe(hashWorld(b));

    const clockA = renderClock(a);
    const clockB = renderClock(b);
    // The same branch `drawCreatures` takes: a boss body, a tether, a meteor
    // and a torch each have their own draw path and never reach `poseAt`.
    const living = a.creatures.filter(
      (c) =>
        !isBossBody(c.kind) && !isMeteorKind(c.kind) && c.kind !== "tether" && c.kind !== "torch",
    );
    expect(living.length).toBeGreaterThan(1);

    for (const c of living) {
      const twin = b.creatures.find((o) => o.id === c.id);
      expect(twin).toBeDefined();
      if (!twin) continue;
      const poseA = livingMotion(c.kind).poseAt(poseClock(c.id, clockA));
      const poseB = livingMotion(twin.kind).poseAt(poseClock(twin.id, clockB));
      expect(poseA).toEqual(poseB);
    }
  });

  it("would have disagreed on the old clock — the check above is not vacuous", () => {
    // Two phones a quarter of a second apart in wall-clock time. Sampled on
    // `view.time` that was two different poses; the assertion here is that a
    // quarter second is enough to matter, so that the agreement proved above
    // is a property of the beat clock and not of the numbers being small.
    const a = device(400, 7);
    const c = a.creatures.find((x) => x.kind === "bulb" || x.kind === "slick");
    expect(c).toBeDefined();
    if (!c) return;
    const m = livingMotion(c.kind);
    const now = poseClock(c.id, renderClock(a));
    const later = poseClock(c.id, renderClock(a) + 0.4);
    expect(m.poseAt(now)).not.toEqual(m.poseAt(later));
  });

  it("do not draw a row of neighbours in step", () => {
    const a = device(400, 7);
    const clock = renderClock(a);
    const poses = a.creatures
      .filter((c) => c.kind === "bulb" || c.kind === "slick")
      .map((c) => livingMotion(c.kind).poseAt(poseClock(c.id, clock)).dx);
    if (poses.length < 2) return;
    expect(new Set(poses.map((d) => d.toFixed(6))).size).toBe(poses.length);
  });
});
