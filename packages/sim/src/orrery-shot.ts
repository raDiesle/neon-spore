import { metColor, missedColor } from "./balance.js";
import { type OrreryState, orreryBoss, orreryCoreCol } from "./orrery.js";
import { orreryShaftOpen } from "./orrery-beat.js";
import { orreryCrack } from "./orrery-step.js";
import { openSlow } from "./slow.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * What a shot that left the top of a column does when THE ORRERY is up.
 *
 * Called from the two places anything above the grid is ever reached —
 * `bullets.ts` when a bolt runs out of field, and `lance-burn.ts` when a beam
 * has burnt a whole column and met nothing — beside THE VANE's bearing and
 * THE DIASTOLE's twin lobe. A no-op unless this boss is the one installed.
 *
 * **Three things have to be true and each belongs to a different half of the
 * pair.** The column is the core's, which is where the cannon has been parked
 * all fight; the beat is one every unbroken ring's gap stands at the bottom of
 * its orbit, which neither seat can work out alone; and the colour is the one
 * the core is showing, which changes every time a ring comes off. Miss the
 * beat and nothing happens at all — miss the colour and it is a colour miss,
 * because the core has been showing it on both screens the whole time.
 */
export function orreryStruck(world: World, bullet: Bullet, beat: number): void {
  const b = orreryBoss(world);
  if (b === null || b.phase === "out") return;
  if (bullet.col !== orreryCoreCol(world.cfg)) return;
  if (b.phase === "naked") {
    naked(world, b, bullet);
    return;
  }
  // A shut shaft. Deliberately *not* a colour miss and deliberately not a
  // reject either: a shot up this column on a beat the gaps are not together
  // is a shot into armour that both screens were drawing, and the pair can
  // see perfectly well that it went nowhere. THE VANE's shut housing exactly.
  if (!orreryShaftOpen(world.cfg, b, beat)) return;
  if (bullet.color !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: bullet.col, row: 0 });
    return;
  }
  metColor(world);
  orreryCrack(world, b);
}

/**
 * The core with nothing left around it, and the only thing that reaches it:
 * **the lance**.
 *
 * An ordinary bolt is spent on it, which is not a penalty but the shape of
 * the finish the design asks for — she holds a colour for `lancePrimeBeats`
 * while he keeps the cannon still in a column the core is spitting rocks down,
 * and neither half of that is worth anything without the other. A bolt that
 * could finish the fight would make the whole of P4 optional.
 */
function naked(world: World, b: OrreryState, bullet: Bullet): void {
  if (!bullet.lance) {
    world.events.push({ type: "reject", col: bullet.col, row: 0 });
    return;
  }
  if (bullet.color !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: bullet.col, row: 0 });
    return;
  }
  metColor(world);
  b.phase = "out";
  b.phaseBeat = world.beat;
  // Slowed for the whole of it, because it is the picture this fight was for:
  // a beam standing in a shaft through three broken orbits.
  openSlow(world, world.cfg.orreryOutBeats);
}
