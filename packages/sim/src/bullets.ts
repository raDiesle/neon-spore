import { batonBeadAlong, batonShotSpends, batonStruck } from "./baton-press.js";
import { resolve } from "./bullet-hit.js";
import { shotMeans } from "./codex.js";
import { hullRow, ticksPerBeat } from "./config.js";
import { ledgerBills } from "./ledger-shot.js";
import { steerShot } from "./lock.js";
import { bulletMilli, creatureMilli } from "./mid-beat.js";
import { firstPodAlong, freePod } from "./pods.js";
import { chargeDue, chargePartTicks, endCharge, laying, layShot } from "./shot-charge.js";
import { shotLeaves } from "./shot-out.js";
import { firstAlong } from "./shot-reach.js";
import { spendShot } from "./spend.js";
import type { Bullet, Color } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * Shots sit on tile centres and cross exactly `bulletTilesPerBeat` tiles per
 * beat. Both hang off the beat, never off each other — otherwise a faster
 * bullet quietly turns the cannon into a continuous stream (docs/spec/systems.md 5.8).
 *
 * At the defaults that is 12 tiles over 75 ticks, so a bullet gains exactly
 * 160 thousandths of a tile per tick and crosses one every 6.25 ticks. The
 * remainder is carried in `subMilli` and never rounded away.
 */
export function fire(world: World, color: Color): void {
  if (world.over) return;
  const cooldown = Math.round(world.cfg.fireEveryBeats * ticksPerBeat(world.cfg));
  // A shot the cooldown refuses never leaves the lobe, so it takes nothing
  // with it either — the charge is only ever spent by a shot that goes out.
  if (world.tick - world.lastFireTick < cooldown) return;
  // One shot is laid at a time. A second press while the first is still in
  // the muzzle is not a second shot and does not restart the first — the same
  // rule `startPrime` plays by, and the reason two presses inside one part of
  // a beat cannot both come out on the same grid point.
  if (laying(world)) return;
  world.lastFireTick = world.tick;
  // THE BATON hears the shot leave, whatever it is aimed at: a bolt is the
  // navigator's act and her turn is spent on it (`baton-press.ts`). A no-op
  // unless that boss is installed.
  batonShotSpends(world);
  // Always an ordinary bolt. A lance is not fired by a press at all any more:
  // the hold fills the lobe and the lobe fires itself at the top of the fill
  // (`releaseLance`), so the two weapons no longer share a moment and a tap
  // can never come out as the wrong one (`lance.ts`).
  if (chargePartTicks(world.cfg) === 0) launch(world, color);
  else layShot(world, color);
}

/**
 * The shot exists. Its column is read *now* rather than at the press, so a
 * cannon that slid during the wind-up takes the shot with it — the bolt leaves
 * the muzzle, and the muzzle is wherever player 1 is holding it
 * (`shot-charge.ts`).
 */
function launch(world: World, color: Color): void {
  // **The one place a colour is swapped**, and the reason THE CODEX is a fault
  // rather than a sweep: everything downstream compares `color`, so the fence's
  // crack, a throb's half, a crystal's join and a boss's rim are all correct
  // without knowing the fault exists. `shown` carries what the thumb pressed, so
  // the bolt that leaves the muzzle is the colour the navigator asked for and
  // the secret is kept (`codex.ts`).
  const means = shotMeans(world, color);
  // **The one place an ordinary bolt is counted as spent**, and with the
  // colour it means rather than the one that was pressed: what a boss tastes
  // is the ammunition that went past it (`spend.ts`).
  spendShot(world, means);
  // **And the one place the cord bills for it**, beside the count for the same
  // reason: from the third hit THE LEDGER charges the pair a return for every
  // shot the cannon takes, whatever it was aimed at (`ledger-shot.ts`).
  ledgerBills(world);
  world.bullets.push({
    id: world.nextId++,
    col: world.cannonCol,
    row: hullRow(world.cfg) - 1,
    subMilli: 0,
    color: means,
    lance: false,
    // Straight up and dead centre of the column, always. A shot is not aimed
    // when it is fired — it is aimed every tick it is in the air, by whatever
    // player 1's hand is on at the time (`lock.ts`).
    driftMilli: 0,
    aimMilli: 0,
    ...(means === color ? {} : { shown: color }),
  });
  // The colour the thumb pressed, never the one it means: this is what the
  // muzzle flashes and what the ear gets, and both belong to the press.
  world.events.push({ type: "fire", col: world.cannonCol, color, lance: false });
}

/**
 * One tick of the wind-up, and the shot on the tick it is due. Called from
 * `step` where `fire` itself would have pushed the bullet, so a world with no
 * grid at all (`shotChargeBeats` 0, the default) never reaches this and every
 * recorded run keeps its timing to the tick.
 */
export function releaseShot(world: World): void {
  const shot = world.charge;
  if (!chargeDue(world) || shot === null) return;
  endCharge(world);
  const before = world.nextId;
  launch(world, shot.color);
  if (shot.swallowed) world.bullets = world.bullets.filter((b) => b.id < before);
}

export function advanceBullets(world: World): void {
  const alive: Bullet[] = [];
  for (const b of world.bullets) if (sweep(world, b)) alive.push(b);
  world.bullets = alive;
}

/**
 * One tick of one shot, from where it stands to where it would be. False when
 * the shot is spent and does not survive the tick.
 *
 * The loop is inherited from the lance and is kept because `resolve` decides
 * whether a shot goes on: every bullet that travels is an ordinary one now and
 * stops at the first body it meets, so the loop turns once. `burnColumn` above
 * is the one caller that goes round it, and it does so over the whole column
 * rather than over a tick's worth of travel.
 */
function sweep(world: World, b: Bullet): boolean {
  const stepMilli = Math.round((world.cfg.bulletTilesPerBeat * MILLI) / ticksPerBeat(world.cfg));
  // Sideways first, then along the column it has arrived in. The order is the
  // whole of why a locked shot connects: `firstAlong` below tests one column,
  // and on the tick the bolt reaches the body it has to already be in the lane
  // that body is standing in rather than in the one it left (`lock.ts`).
  //
  // What comes back is how far it climbs, which is `stepMilli` for every shot
  // in the game but one already round the corner of a lock — that one has spent
  // this tick's travel sideways instead, and the segment below shrinks to a
  // point at the body's own level. A point is a hit test: nothing can be
  // crossed sideways in a tick that is not still in the lane on the next one.
  const climb = steerShot(world, b, stepMilli);
  let from = bulletMilli(b);
  const to = from - climb;

  for (;;) {
    // The shot sweeps a segment every tick, so nothing can slip between two
    // samples — one tile of box against 160 thousandths of travel.
    const hit = firstAlong(world, b, from, to);
    const pod = firstPodAlong(world, b.col, from, to);
    // And THE BATON's bead, when it is in the air in this column — the one
    // thing on the field that is not a body and not a pod and still stops a
    // shot (`baton-press.ts`). All three can be inside the same sweep. The
    // shot stops at whichever stands lower in the column, because that is the
    // one it reaches first.
    const bead = batonBeadAlong(world, b, from, to);
    if (
      bead >= 0 &&
      (!hit || bead >= creatureMilli(world, hit)) &&
      (!pod || bead >= pod.rowMilli)
    ) {
      batonStruck(world, b, bead);
      return false;
    }
    if (pod && (!hit || pod.rowMilli > creatureMilli(world, hit))) {
      freePod(world, pod);
      return false;
    }
    if (!hit) break;
    // Where it met that body, so a lance carries on from there and cannot
    // meet the same stretch of column twice.
    const met = creatureMilli(world, hit);
    if (!resolve(world, b, hit)) return false;
    from = met;
  }

  // Gone past the top of the field: spent, after whatever hangs up there has
  // had its chance at it, and said so (`shot-out.ts`).
  if (to < 0) {
    shotLeaves(world, b, to);
    return false;
  }
  b.row = Math.ceil(to / MILLI);
  b.subMilli = b.row * MILLI - to;
  return true;
}
