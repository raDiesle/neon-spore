import type { World } from "@neon-spore/sim";
import type { Effects } from "./effects.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";

/**
 * **What `Effects` does with a frame**, as opposed to what it owns.
 *
 * All three of these are the same shape — walk every transient the class holds
 * and say one word to each — and all three grow by a line every time a round
 * brings a new one. `effects.ts` is the roster and the routing table, and it had
 * come back to its 250-line limit for the second time, so the next transient
 * anybody added there was going to cost a comment somewhere else in the file
 * before `limits.test.ts` went green again.
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
  e.mirror.update(dt);
  e.warden.update(dt);
  e.bodies.update(dt);
  e.recoilLeap.update(dt);
  e.coilFlight.update(dt);
  e.volleyShards.update(dt);
  e.crawler.update(dt);
  e.spriteBursts.update(dt);
  e.ghostTrail.update(dt);
  e.quake.update(dt);
  e.beatboxWaves.update(dt);
  e.beatboxSilences.update(dt);
  // A salvo's particles are thrown from here on the frame it lands, not from
  // `burstFor` on the frame the event arrived — a second and a quarter
  // earlier (`fleet-fx.ts`).
  e.fleet.update(dt, l, (x, y, n, hex) => e.sparks.burst(x, y, n, hex));
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
  e.crawler.draw(ctx, l, surfaceY);
  e.spriteBursts.draw(ctx);
  e.beatboxWaves.draw(ctx, l);
  e.beatboxSilences.draw(ctx, l);
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
  e.mirror.clear();
  e.warden.reset();
  e.fleet.clear();
  e.bodies.clear();
  e.recoilLeap.clear();
  e.coilFlight.clear();
  e.volleyShards.clear();
  e.crawler.clear();
  e.spriteBursts.clear();
  e.coordGrid.clear();
  e.ghostTrail.clear();
  e.opening.reset();
  e.quake.clear();
  e.beatboxWaves.clear();
  e.beatboxSilences.clear();
}
