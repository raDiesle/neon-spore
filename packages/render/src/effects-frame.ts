import { beatSeconds, type SimConfig, type SimEvent, type World } from "@neon-spore/sim";
import type { Effects } from "./effects.js";
import { breakSparks } from "./effects-break.js";
import { ingestOne } from "./effects-ingest.js";
import { burstFor } from "./effects-spark.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { wellFromFlat } from "./well.js";

/**
 * **What `Effects` does with a frame**, as opposed to what it owns.
 *
 * All four of these are the same shape — walk every transient the class holds
 * and say one word to each — and all four grow by a line every time a round
 * brings a new one. `effects.ts` is the roster, and it had come back to its
 * 250-line limit for the second time, so the next transient anybody added
 * there was going to cost a comment somewhere else in the file before
 * `limits.test.ts` went green again. `ingestAll` came over last, on 13
 * September 2026, when the well's placement went in and took it over again.
 *
 * They are free functions rather than methods so the split is real rather than
 * cosmetic: the fields they walk are `readonly` on the class and read from here
 * by name. `Effects` keeps four one-line methods, because every caller in the
 * game says `effects.update(...)` and none of them should have to learn where
 * the loop moved to.
 *
 * `packages/render/test/restart.test.ts` is what holds `resetAll` to the roster:
 * it compares a used instance against a fresh one field by field, so a
 * transient added to `effects.ts` and forgotten here fails there rather than
 * appearing as a ghost in the next run weeks later.
 */

/**
 * Every event, applied to whatever `Effects` remembers past this frame.
 *
 * `well` says this screen is THE WELL. Every transient placed at a pixel when
 * its event arrives — a burst, a kill's sprite, a pod's implosion — is placed
 * off the flat field, and on the well goes through `put` (`wellFromFlat`) so
 * the well's pass can draw it where the lane is (`well-draw.ts`). What is not
 * told is the rest: a transient drawn *around a creature the world still
 * holds* asks `creatureCenter` each frame, and is queued with it.
 */
export function ingestAll(
  fx: Effects,
  events: readonly SimEvent[],
  l: Layout,
  time: number,
  creatureIdAt: (col: number, row: number) => number,
  cfg: SimConfig,
  well: boolean,
): void {
  // Derived, not passed: `cfg` arrived for `claspBreakBeats`, and a second
  // parameter saying the same number is how two clocks start.
  const spb = beatSeconds(cfg);
  const put = well
    ? (x: number, y: number) => wellFromFlat(l, x, y)
    : (x: number, y: number) => ({ x, y });
  const burst = (x: number, y: number, n: number, hex: string) => {
    const at = put(x, y);
    fx.sparks.burst(at.x, at.y, n, hex);
  };
  fx.boss.ingest(events, l, cfg, spb, time, l.role, burst);
  fx.bodies.ingest(events, l, cfg, spb, time);
  fx.recoilLeap.ingest(events, spb);
  fx.coilFlight.ingest(events, l, spb);
  fx.harpoonLine.ingest(events, l);
  fx.volleyShards.ingest(events, l, cfg);
  fx.shotOut.ingest(events, cfg, well);
  for (const e of events) {
    const spark = burstFor(e, l);
    if (spark) burst(spark.x, spark.y, breakSparks(e, spark.n), spark.hex);
    // Everything past the burst table: `effects-ingest.ts`'s `ingestOne`. Its
    // switch is exhaustive over `SimEvent`, not this call site — see its own
    // comment.
    ingestOne(e, {
      l,
      time,
      beatSeconds: spb,
      creatureIdAt,
      sparks: fx.sparks,
      spriteBursts: fx.spriteBursts,
      rockImpactFx: fx.rockImpact,
      coilFlight: fx.coilFlight,
      arrivals: fx.arrivals,
      deflectFx: fx.deflectFx,
      ship: fx.ship,
      crawler: fx.crawler,
      quake: fx.quake,
      beatboxWaves: fx.beatboxWaves,
      beatboxSilences: fx.beatboxSilences,
      blockedUntil: fx.blockedUntil,
      debris: fx.debris,
      huskDeflates: fx.huskDeflates,
      put,
      burst,
    });
  }
}

export function updateAll(e: Effects, dt: number, l: Layout): void {
  // Time does not run backwards and nor does a transient's age: every clock
  // below is a `+= dt` read back as a phase, and a negative one puts a ring at
  // a negative radius, which a real canvas refuses outright.
  if (!(dt > 0)) return;
  e.sparks.update(dt);
  e.debris.update(dt);
  e.deflectFx.update(dt, l.tile);
  e.rockImpact.update(dt, l);
  for (const [id, t] of e.blockedUntil) {
    const left = t - dt;
    if (left <= 0) e.blockedUntil.delete(id);
    else e.blockedUntil.set(id, left);
  }
  e.ship.update(dt);
  e.bodies.update(dt);
  e.recoilLeap.update(dt);
  e.coilFlight.update(dt);
  e.harpoonLine.update(dt);
  e.volleyShards.update(dt);
  e.shotOut.update(dt, l);
  e.crawler.update(dt);
  e.spriteBursts.update(dt);
  e.huskDeflates.update(dt);
  e.ghostTrail.update(dt);
  e.quake.update(dt);
  e.beatboxWaves.update(dt);
  e.beatboxSilences.update(dt);
  // Last, for the fleet: a salvo's particles are thrown from here on the
  // frame it lands, not from `burstFor` on the frame the event arrived
  // (`effects-boss.ts`).
  e.boss.update(dt, l, (x, y, n, hex) => e.sparks.burst(x, y, n, hex));
}

/** Drawn under the hull, so a deflected rock passes behind nothing. The world
 * is here for the clasp transients alone — `drawOnBodies` says why — and
 * `surfaceY` for THE CRAWLER's, about a body on the ship's own skin. */
export function drawAll(
  e: Effects,
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  surfaceY?: SurfaceY,
): void {
  e.deflectFx.draw(ctx);
  e.sparks.draw(ctx);
  e.debris.draw(ctx);
  e.bodies.draw(ctx, l, surfaceY);
  e.coilFlight.draw(ctx, l);
  e.volleyShards.draw(ctx);
  e.shotOut.draw(ctx, l);
  e.crawler.draw(ctx, l, surfaceY);
  e.spriteBursts.draw(ctx);
  e.huskDeflates.draw(ctx, l);
  e.beatboxWaves.draw(ctx, l);
  e.beatboxSilences.draw(ctx, l);
  e.boss.draw(ctx, l);
  e.bodies.drawOnBodies(ctx, l, world, beatPhase, e.recoilLeap);
}

/** Forget everything transient: a wave has (re)started and none of it
 * belongs on screen now. Without this a rock from the run just abandoned
 * latches an arrival (`arrivals.ts`) against a beat the new run is about to
 * reuse — showing that beat's crack before its own rock ever lands. */
export function resetAll(e: Effects): void {
  e.sparks.clear();
  e.debris.clear();
  e.deflectFx.clear();
  e.rockImpact.clear();
  e.arrivals.clear();
  e.blockedUntil.clear();
  e.ship.clear();
  e.boss.clear();
  e.bodies.clear();
  e.recoilLeap.clear();
  e.coilFlight.clear();
  e.harpoonLine.reset();
  e.volleyShards.clear();
  e.shotOut.clear();
  e.crawler.clear();
  e.spriteBursts.clear();
  e.huskDeflates.clear();
  e.coordGrid.clear();
  e.ghostTrail.clear();
  e.opening.reset();
  e.quake.clear();
  e.beatboxWaves.clear();
  e.beatboxSilences.clear();
}
