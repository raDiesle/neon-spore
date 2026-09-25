import { afterEach, beforeAll, describe, expect, it, setDefaultTimeout, spyOn } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  instarBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { BossHurt } from "../src/boss-hurt.js";
import { Effects } from "../src/effects.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A boss the pair got the better of shows it took the blow — the owner's
 * generic rule of 24 September 2026 (`boss-hurt.ts`): a shake and a red
 * glow on the body for a moment after a sequence lands, and nothing after
 * one part of it alone.
 *
 * **One row per boss that wears it.** A row names the event that means *a
 * sequence landed*, one that is only a part of one, and where its fx class
 * keeps the blow. The frame case runs the same play twice with the landing
 * pushed both times, once with `hit()` stubbed out, so the red it counts is
 * the blow's and not a burst the same event throws.
 */

beforeAll(installCanvasGlobals);
afterEach(() => {
  hitOff?.mockRestore();
  hitOff = null;
});

let hitOff: ReturnType<typeof spyOn> | null = null;

const L = computeLayout(VIEWPORT, CFG, "test");

interface Row {
  boss: Parameters<typeof waveWith>[0];
  /** The events that mean a sequence landed; each deals the blow. */
  land: SimEvent[];
  /** One part of a sequence, which does not. */
  part: SimEvent[];
  hurt: (fx: Effects) => BossHurt;
  /** The world on a frame where the body is up; four beats in if not given. */
  world?: () => World;
}

const ROWS: Row[] = [
  {
    boss: "instar",
    land: [
      { type: "instarLand", step: 0, col: 3 },
      { type: "instarDown", col: 3 },
    ],
    part: [{ type: "instarDone", mark: 0, part: "jaw", col: 3 }],
    hurt: (fx) => fx.boss.instar.hurt,
    world: instarMorphing,
  },
  {
    boss: "warden",
    land: [
      { type: "plate", col: 3, row: 2, left: 2, color: "red" },
      { type: "wardenDown", col: 3, row: 2 },
    ],
    part: [{ type: "wardenSlam", col: 3 }],
    hurt: (fx) => fx.boss.warden.hurt,
  },
];

describe("the blow a boss takes", () => {
  it("shows at once and is over within half a second", () => {
    const hurt = new BossHurt();
    expect(hurt.value).toBe(0);
    expect(Math.abs(hurt.shakeX(1, 40))).toBe(0);
    hurt.hit();
    expect(hurt.value).toBe(1);
    for (let i = 0; i < 29; i++) hurt.update(1 / 60);
    expect(hurt.value).toBeGreaterThan(0);
    for (let i = 0; i < 2; i++) hurt.update(1 / 60);
    expect(hurt.value).toBe(0);
  });

  for (const row of ROWS) {
    describe(row.boss, () => {
      it("is dealt by a landed sequence, not by one part of it, and forgotten on a restart", () => {
        for (const e of row.land) {
          const fx = new Effects();
          fx.ingest(row.part, L, 0, () => 0, CFG);
          expect(row.hurt(fx).value).toBe(0);
          fx.ingest([e], L, 0, () => 0, CFG);
          expect(row.hurt(fx).value).toBe(1);
          fx.reset();
          expect(fx).toEqual(new Effects());
        }
      });

      it("washes the body red on the frames after a landing", () => {
        const rims = (dealt: boolean): number => {
          if (!dealt) hitOff = spyOn(BossHurt.prototype, "hit").mockImplementation(() => {});
          const world = (row.world ?? fourBeatsIn(row.boss))();
          const log: string[] = [];
          runFrames(world, "p1", 6, {
            every: 3,
            onCanvas: (c) => {
              c.log = log;
            },
            onTick: (tick, w) => {
              step(w, []);
              if (tick === 0) w.events.push(row.land[0] as SimEvent);
            },
          });
          hitOff?.mockRestore();
          hitOff = null;
          return log.join("|").split(PALETTE.redRim).length;
        };
        expect(rims(true)).toBeGreaterThan(rims(false));
      });
    });
  }
});

function fourBeatsIn(boss: Row["boss"]): () => World {
  return () => {
    const world = createWorld(CFG, 3);
    const index = waveWith(boss);
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
    for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
    return world;
  };
}

/** THE INSTAR at the start of its second step's morph: no mark is up yet. */
function instarMorphing(): World {
  const world = fourBeatsIn("instar")();
  const s = instarBoss(world);
  if (s === null) throw new Error("the instar wave hung no body");
  s.cursor = 1;
  s.phase = "morph";
  s.phaseBeat = world.beat;
  return world;
}
