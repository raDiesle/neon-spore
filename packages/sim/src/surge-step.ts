import { midCol } from "./config.js";
import { removeCreatures } from "./field.js";
import { openSlow } from "./slow.js";
import {
  type SurgeState,
  surgeBulbRow,
  surgeChargePerHand,
  surgeCovers,
  surgeEverting,
  surgeHands,
  surgeHoldsCharge,
  surgeInBand,
  surgeWarding,
} from "./surge.js";
import { surgeSpit, surgeSpits } from "./surge-rock.js";
import { surgeBurst } from "./surge-seam.js";
import type { World } from "./world.js";

/**
 * THE SURGE's clock — the charge, the leak, the feeding, the burst at the
 * top of the gauge, the eversion. The two thumbs on it are `surge-hand.ts`,
 * on the tick, and what a lift comes to is `surge-seam.ts`.
 *
 * Everything here runs on the **beat** from `stepBoss`. The pressure moves
 * on the beat and is *read* on the tick by a lift, so what the pair lifts
 * on is the number the last beat left: a beat is the grain of this fight,
 * and a lift is inside one or it is not.
 */

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installSurge(world: World): SurgeState {
  const s: SurgeState = {
    kind: "surge",
    notches: 0,
    pressureMilli: 0,
    heldP1: false,
    heldP2: false,
    liftTick: -1,
    nearBeat: -1,
    burstBeat: -1,
    rockBeat: -1,
    rockId: -1,
    evertBeat: -1,
    outBeat: -1,
  };
  world.events.push({
    type: "surgeSettle",
    col: midCol(world.cfg),
    row: surgeBulbRow(s, world.cfg),
  });
  return s;
}

/**
 * What the field feeds the bulb, once it holds: every body that has come
 * down to its row in its columns is taken in, a step of pressure each,
 * thumbs on it or not — a body cannot pass through the bulb. Read
 * after the fall loop has moved them (`beat.ts`), so a body that arrived on
 * the row this beat is eaten this beat — and only bodies that came *down*
 * to it, so a gum the bulb itself threw from the row under it is not.
 *
 * **The rock it spat is named rather than reasoned about**, because the row
 * rule stops covering it the moment a vent sinks the bulb: a rock leaves from
 * the row under the bulb, and one vent later that row *is* the bulb's, so the
 * bulb would come down on its own rock and take a step of pressure for it
 * (`surge-rock.ts`). The rock was thrown at the ship; a boss that feeds on
 * what it threw is the pair's gesture paying the boss.
 */
function feed(world: World, s: SurgeState): void {
  const cfg = world.cfg;
  const row = surgeBulbRow(s, cfg);
  const eaten: number[] = [];
  for (const c of world.creatures) {
    if (c.id === s.rockId) continue;
    if (c.row < row || c.fromRow > row || !surgeCovers(cfg, c.col)) continue;
    eaten.push(c.id);
    s.pressureMilli += cfg.surgeAbsorbMilli;
    world.events.push({ type: "surgeAbsorb", col: c.col, row: c.row });
  }
  removeCreatures(world, eaten);
}

/**
 * One beat of the bulb.
 *
 * After the eversion it stands `surgeOutBeats` and goes. While it everts,
 * nothing. Otherwise: the hands charge it, or it leaks, or — once it holds —
 * it keeps what it has and eats what reaches it; the top of the gauge is a
 * burst; two thumbs held on it long enough is a rock spat at the ship
 * (`surge-rock.ts`); and the pressure coming into the notch's band opens THE
 * SLOW, the design's release window made visible as tissue.
 */
export function stepSurge(world: World, s: SurgeState): void {
  const cfg = world.cfg;
  if (s.outBeat >= 0) {
    // Nulled here rather than at the eversion's end, so the frame has its
    // beats of the everted body before the wave is allowed to end
    // (`bossHoldsWave`).
    if (world.beat - s.outBeat >= cfg.surgeOutBeats) world.boss = null;
    return;
  }
  if (surgeEverting(s)) {
    if (world.beat - s.evertBeat >= cfg.surgeEvertBeats) {
      s.outBeat = world.beat;
      world.events.push({ type: "surgeOut", col: midCol(cfg) });
    }
    return;
  }
  const hands = surgeHands(s);
  const holds = surgeHoldsCharge(s, cfg);
  if (hands > 0) s.pressureMilli += hands * surgeChargePerHand(s, cfg);
  else if (!holds) s.pressureMilli = Math.max(0, s.pressureMilli - cfg.surgeDecayMilli);
  if (holds) feed(world, s);
  // Forgotten the beat it leaves the field, warded or landed: what became of
  // it is the field's, and only "still falling" is this boss's (`surge.ts`).
  if (s.rockId >= 0 && !surgeWarding(s, world)) s.rockId = -1;
  if (s.pressureMilli >= cfg.surgeBurstMilli) {
    surgeBurst(world, s);
    return;
  }
  // Before the band's gate below, which returns: a rock is owed whether or
  // not the pressure has come near a notch.
  if (surgeSpits(world, s)) surgeSpit(world, s);
  if (!surgeInBand(s, cfg)) {
    s.nearBeat = -1;
    return;
  }
  if (s.nearBeat < 0) {
    s.nearBeat = world.beat;
    openSlow(world, cfg.surgeNearSlowBeats, "show");
    world.events.push({ type: "surgeNear", col: midCol(cfg) });
  }
}
