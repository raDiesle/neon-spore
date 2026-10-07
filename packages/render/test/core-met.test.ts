import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type BossKind,
  CORE_KINDS,
  createWorld,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { AUTOPILOT_HANDS } from "../../hands/src/autopilot-hands.js";
import { drawBoss } from "../src/boss-draw.js";
import { drawBullets } from "../src/bullets.js";
import { Effects } from "../src/effects.js";
import { computeLayout } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Every core met where it hangs is met where it is drawn** (`sim/core-along.ts`).
 * Each boss on that table is played by its own autopilot hand, drawn every
 * other tick with the bolts' stops, and every bolt the simulation judged in
 * the field rather than past its top had been drawn bursting on the boss a
 * moment before — never taken off the field short of the picture, which
 * would be a bolt vanishing in the air, and never long after it, which would
 * be the hit landing late. A row put on the table at the wrong height is red
 * here.
 *
 * **And what falls**, THE MANTLE's and THE VALVE's sparks and THE RATCHET's
 * and THE HASP's loose bolts: met by the gap closing between ticks (`sim/spark-fall.ts`) rather than on a row of the
 * table, and judged by the boss's own call rather than `shotLeaves`, so the
 * target going out is the receipt rather than a `shotOut`.
 */

beforeAll(() => installCanvasGlobals());

const TPB = ticksPerBeat(CFG);
/** A frame every other tick: a phone at sixty frames and the fastest tempo. */
const EVERY = 2;
/** The most ticks a hit may follow the burst on its target. */
const LATE = 8;
/**
 * The most ticks a judgment may follow any burst: a bolt drawn ending on the
 * shut armour below a core flies on unseen to the core, and the step can
 * light in between (`sim/core-along.ts`).
 */
const UNSEEN = 16;
/** More sparks than a scuff throws (`bolt-stop.ts`): the burst on a target. */
const SCUFF = 5;

/** The bosses whose target falls, and the event that says a bolt met it in the field. */
const FALLING: Partial<Record<BossKind, SimEvent["type"]>> = {
  mantle: "mantleSparkOut",
  valve: "valveSparkOut",
  ratchet: "ratchetBoltOut",
  hasp: "haspBoltOut",
};

/** Whether `e` is a bolt judged in the field rather than past the top, under `kind`. */
function metInField(kind: BossKind, e: SimEvent): boolean {
  if (e.type === "shotOut") return e.atMilli > 0;
  return e.type === FALLING[kind] && "rowMilli" in e && e.rowMilli > 0;
}

interface Burst {
  tick: number;
  target: boolean;
}

function played(kind: BossKind): { met: number[]; bursts: Burst[] } {
  const hand = AUTOPILOT_HANDS[kind];
  if (hand === undefined) throw new Error(`no hand plays ${kind}`);
  const l = computeLayout(VIEWPORT, CFG, "test");
  const world = createWorld({ ...CFG }, 5);
  const index = waveWith(kind);
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const fx = new Effects();
  const ctx = stubCanvas().ctx as unknown as CanvasRenderingContext2D;
  const met: number[] = [];
  const bursts: Burst[] = [];
  for (let n = 0; n < TPB * 120 && met.length < 3 && world.boss !== null; n++) {
    step(
      world,
      hand(world).map((p) => ({ ...p, tick: world.tick })),
    );
    for (const e of world.events) if (metInField(kind, e)) met.push(world.tick);
    if (n % EVERY !== 0) continue;
    const view = {
      world,
      beatPhase: (world.tick % TPB) / TPB,
      role: "test" as const,
      time: n / 60,
      dt: 1 / 60,
      events: [],
      running: true,
    };
    drawBoss(ctx, l, view, fx);
    drawBullets(ctx, l, world.bullets, fx.bolts);
    fx.bolts.end(world.bullets);
    fx.bolts.update(0, (_x, _y, k) => bursts.push({ tick: world.tick, target: k > SCUFF }));
  }
  return { met, bursts };
}

describe("a core met where it hangs", () => {
  it.each([...CORE_KINDS, ...(Object.keys(FALLING) as BossKind[])])(
    "is drawn met there first, under %s",
    (kind) => {
      const { met, bursts } = played(kind);
      expect(met.length).toBeGreaterThan(0);
      for (const tick of met) {
        const before = bursts.filter((b) => b.tick <= tick && tick - b.tick <= UNSEEN);
        // Never taken off the field before it was drawn reaching the boss.
        expect(before.length).toBeGreaterThan(0);
        // And a hit on the target lands with the burst on it.
        const hit = before.filter((b) => b.target).at(-1);
        if (hit !== undefined) expect(tick - hit.tick).toBeLessThanOrEqual(LATE);
      }
    },
  );
});
