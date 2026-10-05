import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  beatPhase,
  createWorld,
  gimbalBoss,
  midCol,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { drawBullets } from "../src/bullets.js";
import { drawGimbal } from "../src/gimbal-draw.js";
import { GimbalFx } from "../src/gimbal-fx.js";
import { computeLayout } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE GIMBAL takes a hit where it is drawn taking it.** The owner, 5
 * October 2026: the shot should hit the leak *and take effect immediately it
 * hit the right location*. So a bolt up the seam's column, drawn tick by tick
 * with the bolts' stops, bursts on the bead (`bolt-stop.ts`) and the seam is
 * shut within a tick of it (`sim/gimbal-bead.ts`) — at every point of the
 * bead's run down the column, and on every frame rate, so the bolt is never
 * taken off the field before it is drawn reaching the bead.
 */

beforeAll(() => installCanvasGlobals());

const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);
/** More sparks than a scuff throws (`bolt-stop.ts`): the burst on a target. */
const SCUFF = 5;
const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

/** The wave's own cradle, leaking `beatsIn` beats ago, the cannon under the seam. */
function leaking(beatsIn: number): World {
  const world = createWorld({ ...CFG, gimbalSeamBeats: 6 }, 5);
  const index = waveWith("gimbal");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = gimbalBoss(world);
  if (s === null) throw new Error("the gimbal wave hung no cradle");
  s.seamCol = MID;
  s.seamBeat = world.beat - beatsIn;
  step(world, [{ tick: world.tick, player: 1, command: { kind: "cannonCol", col: MID } }]);
  return world;
}

/** Fire, then draw every `every`-th tick: the tick of the burst and of the seam shut. */
function fired(beatsIn: number, every: number): { burst: number; shut: number } {
  const l = computeLayout(VIEWPORT, CFG, "p1");
  const world = leaking(beatsIn);
  const stops = new BoltStops();
  let burst = -1;
  let shut = -1;
  const fire: TimedCommand = {
    tick: world.tick,
    player: 2,
    command: { kind: "fire", color: "cyan" },
  };
  for (let n = 0; n < TPB * 2 && shut < 0; n++) {
    step(world, n === 0 ? [fire] : []);
    if (world.events.some((e) => e.type === "gimbalSeamOut")) shut = world.tick;
    if (n % every !== 0) continue;
    const s = gimbalBoss(world);
    if (s === null) break;
    const phase = beatPhase(world.cfg, world.tick);
    drawGimbal(paper(), l, world, s, world.beat, phase, 0, new GimbalFx(), stops);
    drawBullets(paper(), l, world.bullets, stops);
    stops.end(world.bullets);
    // A target's burst is the big one; a scuff on the cradle is a few grains.
    stops.update(0, (_x, _y, n) => {
      if (burst < 0 && n > SCUFF) burst = world.tick;
    });
  }
  return { burst, shut };
}

describe("THE GIMBAL takes a hit where it is drawn", () => {
  for (const beatsIn of [0, 1, 2, 3, 4])
    for (const every of [1, 2, 3])
      it(`bursts on the bead and shuts the seam with it, ${beatsIn} beats into the leak, a frame every ${every} ticks`, () => {
        const { burst, shut } = fired(beatsIn, every);
        expect(shut).toBeGreaterThan(0);
        expect(burst).toBeGreaterThan(0);
        expect(burst).toBeLessThanOrEqual(shut);
        expect(shut - burst).toBeLessThanOrEqual(every + 4);
      });
});
