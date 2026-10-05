import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  beatPhase,
  grindstoneBoss,
  grindstoneLitStep,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { CFG, MID, rightColor, toStep } from "../../sim/test/grindstone-rig.js";
import { BoltStops } from "../src/bolt-stop.js";
import { drawBullets } from "../src/bullets.js";
import { drawGrindstone } from "../src/grindstone-draw.js";
import { GrindstoneFx } from "../src/grindstone-fx.js";
import { computeLayout } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE GRINDSTONE takes a hit where it is drawn taking it.** The owner, 5
 * October 2026: *the shot should hit it and then have destroying animation,
 * not fly through the boss, so it's visible the shot hit and took effect
 * immediately it hit the right location.* A bolt up the middle into the lit
 * axle, drawn every few ticks with the bolts' stops, bursts on the axle
 * (`bolt-stop.ts`) and is a hit within a few ticks of it
 * (`sim/core-along.ts`) — never a fifth of a beat later, when it would have
 * left the top of the field.
 */

beforeAll(() => installCanvasGlobals());

const TPB = ticksPerBeat(CFG);
/** More sparks than a scuff throws (`bolt-stop.ts`): the burst on a target. */
const SCUFF = 5;
const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

function fired(every: number): { burst: number; hit: number; out: number } {
  const l = computeLayout(VIEWPORT, CFG, "p1");
  const world = toStep(4);
  const s = grindstoneBoss(world);
  const lit = s === null ? null : grindstoneLitStep(s);
  if (lit === null) throw new Error("nothing is lit");
  const t = world.tick;
  const cmds: TimedCommand[] = [
    { tick: t, player: 1, command: { kind: "cannonCol", col: MID } },
    { tick: t + 1, player: 2, command: { kind: "fire", color: rightColor(lit) } },
  ];
  const stops = new BoltStops();
  let burst = -1;
  let hit = -1;
  let out = Number.NaN;
  for (let n = 0; n < TPB * 2 && hit < 0; n++) {
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    for (const e of world.events) {
      if (e.type === "grindstoneHit") hit = world.tick;
      if (e.type === "shotOut") out = e.atMilli;
    }
    const g = grindstoneBoss(world);
    if (n % every !== 0 || g === null) continue;
    const phase = beatPhase(world.cfg, world.tick);
    drawGrindstone(paper(), l, world, g, world.beat, phase, 0, new GrindstoneFx(), stops);
    drawBullets(paper(), l, world.bullets, stops);
    stops.end(world.bullets);
    stops.update(0, (_x, _y, k) => {
      if (burst < 0 && k > SCUFF) burst = world.tick;
    });
  }
  return { burst, hit, out };
}

describe("THE GRINDSTONE takes a hit where it is drawn", () => {
  for (const every of [1, 2, 3])
    it(`bursts on the axle and is hit with it, a frame every ${every} ticks`, () => {
      const { burst, hit, out } = fired(every);
      expect(hit).toBeGreaterThan(0);
      expect(burst).toBeGreaterThan(0);
      expect(burst).toBeLessThanOrEqual(hit);
      expect(hit - burst).toBeLessThanOrEqual(every + 4);
      // Met in the field, not past its top.
      expect(out).toBeGreaterThan(0);
    });
});
