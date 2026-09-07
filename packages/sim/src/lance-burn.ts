import { resolve } from "./bullet-hit.js";
import { hullRow } from "./config.js";
import { beamTicks, lanceReady, primeColor, spendPrime } from "./lance.js";
import { bulletMilli, creatureMilli } from "./mid-beat.js";
import { firstPodAlong, freePod } from "./pods.js";
import { firstAlong } from "./shot-reach.js";
import type { Bullet, Color } from "./types.js";
import { vaneStruck } from "./vane.js";
import type { World } from "./world.js";

/**
 * **THE LANCE going off**: the lobe coming full, and the column burning on
 * that tick.
 *
 * Its own file beside `bullets.ts` since the owner made the beam the weapon on
 * 7 September 2026, on the seam that change put there. Next door is a shot
 * that *travels* — a thing with a position, stepped once a tick until it meets
 * something — and this is a thing with no position at all: it resolves a whole
 * column in one call and leaves a picture with a countdown on it behind
 * (`LanceBeam` in `lance.ts`).
 */

/**
 * The lobe full, and the column burning on that very tick.
 *
 * **It fires itself.** There is no press to spend it — the owner's answer on
 * 7 September 2026 was that the hold is the whole gesture, so it goes the
 * instant the fill reaches the top and the thumb resting on the button
 * afterwards does nothing at all (`Prime.spent`).
 *
 * **And nothing leaves the ship.** The lance used to be a slow bolt that
 * travelled up the column through three bodies; the owner watched the fill and
 * said the beam itself is the weapon. So the whole column is resolved here, on
 * this tick, and what is left behind is a picture with a countdown on it
 * (`LanceBeam`) rather than an object with a position.
 *
 * `lanceFull` still goes out beside the `fire` event, and it is not a
 * duplicate: it is the one row of the information split that is not split at
 * all (docs/spec/systems.md 5.2), and audio/ has bound the moment since the
 * day the lance had a button of its own.
 */
export function releaseLance(world: World): void {
  if (world.over || !lanceReady(world)) return;
  const color = primeColor(world);
  if (color === null) return;
  spendPrime(world);
  world.lastFireTick = world.tick;
  const col = world.cannonCol;
  world.events.push({ type: "lanceFull", col });
  world.events.push({ type: "fire", col, color, lance: true });
  world.beam = { col, color, left: beamTicks(world.cfg), topMilli: burnColumn(world, col, color) };
}

/**
 * Everything of one colour standing in one column, burnt at once — and how far
 * up the beam got before something stopped it, in thousandths from the top.
 *
 * **The shot it resolves through is a real `Bullet` that never enters the
 * world.** That is not a trick, it is the point: a beam meets a rock, a wrong
 * colour, a veil, a queen's petal and a worm's armoured segment in exactly the
 * ways a bolt does, and every one of those answers is already written down
 * once, in `resolve` (`bullet-hit.ts`). A second copy of them for the beam
 * would be a second copy of the whole bestiary's relationship with the cannon.
 * `lance` on it is what tells `resolve` the shot does not stop at the first
 * body it kills.
 *
 * The segment is the whole column at once — hull to the top of the field —
 * where an ordinary shot sweeps `bulletTilesPerBeat` of it per tick. Each turn
 * of the loop either ends the beam or removes a body from the field, so it
 * cannot run forever.
 */
function burnColumn(world: World, col: number, color: Color): number {
  const b: Bullet = {
    id: world.nextId++,
    col,
    row: hullRow(world.cfg) - 1,
    subMilli: 0,
    color,
    lance: true,
    driftMilli: 0,
    aimMilli: 0,
  };
  let from = bulletMilli(b);
  for (;;) {
    const hit = firstAlong(world, b, from, 0);
    const pod = firstPodAlong(world, b.col, from, 0);
    // Both can be standing in the beam. It reaches whichever is lower in the
    // column first, exactly as a bolt sweeping the same segment would.
    if (pod && (!hit || pod.rowMilli > creatureMilli(world, hit))) {
      freePod(world, pod);
      return pod.rowMilli;
    }
    if (!hit) break;
    const met = creatureMilli(world, hit);
    if (!resolve(world, b, hit)) return met;
    from = met;
  }
  // Nothing left in the column, so it reaches the top of the field — and THE
  // VANE's bearing hangs there, which is the one thing above the grid at all.
  vaneStruck(world, b);
  return 0;
}
