import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import {
  type GorgeIntake,
  type GorgeState,
  gorgeBeads,
  gorgeBoss,
  gorgeFull,
  gorgeIntakeAt,
  gorgePinched,
  gorgePried,
} from "./gorge.js";
import { spitEmptiest, stepGorgePry } from "./gorge-pry.js";
import { gorgeSlow } from "./gorge-slow.js";
import { nextInt } from "./rng.js";
import { spawnOne } from "./spawn.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE GORGE's clock — the vent, the spit, the mouth feeding itself and the
 * beats after the beam — and the one moment a shot meets it: swallowed at
 * the top of the field. Everything on the **beat** runs from `stepBoss`; the
 * one thing on the **tick** is a shot leaving the top (`gorgeStruck`),
 * because a bead that waited for the next beat to go in would be a shot the
 * pair watched vanish into nothing. The thumbs are `gorge-hand.ts`.
 */

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installGorge(world: World): GorgeState {
  const cfg = world.cfg;
  const width = Math.min(cfg.gorgeIntakes, cfg.cols);
  const col = Math.max(0, Math.min(cfg.cols - width, midCol(cfg) - Math.floor(width / 2)));
  const intakes: GorgeIntake[] = [];
  for (let i = 0; i < width; i++)
    intakes.push({ beads: 0, color: null, fullBeat: -1, ruptured: false, pierced: 0 });
  world.events.push({ type: "gorgeSettle", col, width });
  return {
    kind: "gorge",
    col,
    intakes,
    ruptures: 0,
    swallowed: 0,
    spitBeat: world.beat,
    mouth: -1,
    outBeat: -1,
    pinch: -1,
    pry: -1,
    pryBeat: -1,
    pryFills: 0,
  };
}

/** How many intakes can still be pierced. */
function standing(g: GorgeState): number {
  let n = 0;
  for (const k of g.intakes) if (!k.ruptured) n += 1;
  return n;
}

/** One bead in, of `color`, and the intake full if that was the last. */
function swallow(world: World, g: GorgeState, i: number, k: GorgeIntake, color: Color): void {
  const col = g.col + i;
  k.color = color;
  if (k.beads < world.cfg.gorgeFullBeads) {
    k.beads += 1;
    g.swallowed += 1;
  }
  world.events.push({ type: "gorgeSwallow", col, color, beads: k.beads });
  if (k.beads === world.cfg.gorgeFullBeads && k.fullBeat < 0) {
    k.fullBeat = world.beat;
    k.pierced = 0;
    world.events.push({ type: "gorgeFull", col, color });
  }
}

/** One bead out — the wrong colour went in — and the colour forgotten at none. */
function empty(world: World, g: GorgeState, i: number, k: GorgeIntake): void {
  k.beads = Math.max(0, k.beads - 1);
  k.fullBeat = -1;
  k.pierced = 0;
  if (k.beads === 0) k.color = null;
  world.events.push({ type: "gorgeEmptied", col: g.col + i, beads: k.beads });
}

/**
 * The unruptured intake nearest the centre becomes the mouth, in the colour
 * it holds — or one off the rng when it is empty: the sack's own choice.
 */
function openMouth(world: World, g: GorgeState): void {
  const centre = (g.intakes.length - 1) / 2;
  let best = -1;
  for (let i = 0; i < g.intakes.length; i++) {
    if (g.intakes[i]?.ruptured) continue;
    if (best < 0 || Math.abs(i - centre) < Math.abs(best - centre)) best = i;
  }
  if (best < 0) return;
  const k = g.intakes[best];
  if (k === undefined) return;
  if (k.color === null) k.color = nextInt(world.rng, 2) === 0 ? "red" : "cyan";
  g.mouth = best;
  g.spitBeat = world.beat;
  world.events.push({ type: "gorgeMouth", col: g.col + best, color: k.color });
}

/**
 * **A shot that nothing on the field stopped, leaving through the top** of
 * a column the sack hangs over: from `bullets.ts` and `lance-burn.ts` beside
 * `candleStruck`, a no-op unless THE GORGE is the boss and the column its own.
 *
 * A ruptured intake hangs open and the shot goes through. A full one is
 * pierced by any colour, bolt or beam, and ruptures on the `gorgeVentShots`th;
 * every shot short of it is a `gorgeNick`, as every beam short of the last
 * into the pried mouth is a `gorgePryFill`, so no shot that landed is silent.
 * Otherwise the shot is a bead: the intake's colour, or its first, fills it a
 * step and counts as a colour met; the other colour takes a bead back out and
 * counts as one missed. The mouth takes beads the same way but is never
 * pierced: `gorgePryFills` beams in its colour, standing in its column while
 * it is full **and pried open under player 2's thumb**, end the fight; on a
 * mouth nobody holds it clenches, and the beam goes in as nothing
 * (`gorge-hand.ts`). Whatever it answered, THE SLOW is put where the asks
 * still standing say (`gorge-slow.ts`).
 */
export function gorgeStruck(world: World, bullet: Bullet): void {
  const g = gorgeBoss(world);
  if (g === null || g.outBeat >= 0) return;
  struck(world, g, bullet);
  gorgeSlow(world, g);
}

function struck(world: World, g: GorgeState, bullet: Bullet): void {
  const i = gorgeIntakeAt(g, bullet.col);
  const k = g.intakes[i];
  if (k === undefined || k.ruptured) return;
  const cfg = world.cfg;
  const col = g.col + i;
  if (i === g.mouth) {
    if (k.color !== null && k.color !== bullet.color) {
      missedColor(world);
      empty(world, g, i, k);
      return;
    }
    if (bullet.lance && gorgeFull(k, cfg)) {
      if (!gorgePried(g)) {
        world.events.push({ type: "gorgeClench", col });
        return;
      }
      metColor(world);
      g.pryFills += 1;
      if (g.pryFills < cfg.gorgePryFills) {
        const owed = cfg.gorgePryFills - g.pryFills;
        world.events.push({ type: "gorgePryFill", col, color: bullet.color, owed });
        return;
      }
      g.outBeat = world.beat;
      world.events.push({ type: "gorgeOut", col, beads: g.swallowed });
      return;
    }
    metColor(world);
    swallow(world, g, i, k, bullet.color);
    return;
  }
  if (gorgeFull(k, cfg)) {
    metColor(world);
    k.pierced += 1;
    if (k.pierced < cfg.gorgeVentShots) {
      const owed = cfg.gorgeVentShots - k.pierced;
      world.events.push({ type: "gorgeNick", col, color: k.color ?? bullet.color, owed });
      return;
    }
    k.ruptured = true;
    k.beads = 0;
    k.color = null;
    k.fullBeat = -1;
    k.pierced = 0;
    g.ruptures += 1;
    if (g.pinch === i) g.pinch = -1;
    world.events.push({ type: "gorgeRupture", col, left: standing(g) });
    if (g.mouth < 0 && (g.ruptures >= cfg.gorgeMouthRuptures || standing(g) <= 1)) {
      openMouth(world, g);
    }
    return;
  }
  if (k.color === null || k.color === bullet.color) {
    metColor(world);
    swallow(world, g, i, k, bullet.color);
    return;
  }
  missedColor(world);
  empty(world, g, i, k);
}

/**
 * Every full intake past its patience lets go: a torch down the column, and
 * empty. One under the pilot's pinch waits, its count moved along with it,
 * so the patience runs from the lift and not the fill (`gorge-hand.ts`).
 */
function vent(world: World, g: GorgeState): void {
  const cfg = world.cfg;
  for (let i = 0; i < g.intakes.length; i++) {
    const k = g.intakes[i];
    if (k === undefined || i === g.mouth || !gorgeFull(k, cfg)) continue;
    if (gorgePinched(g, i)) {
      k.fullBeat = world.beat;
      continue;
    }
    if (world.beat - k.fullBeat < cfg.gorgeVentBeats) continue;
    const col = g.col + i;
    k.beads = 0;
    k.color = null;
    k.fullBeat = -1;
    k.pierced = 0;
    world.events.push({ type: "gorgeVent", col });
    spawnOne(world, { beat: world.beat, col, kind: "torch", color: null });
  }
}

/**
 * One beat of the sack.
 *
 * Full intakes vent on their count. Then, on the spit count, the sack either
 * feeds its mouth a bead of the mouth's colour — never past full, never
 * venting — or, once it is spitting, returns one bead to the field. A pry
 * held past its window is thrown off first (`gorge-hand.ts`), and THE SLOW
 * is put where the asks left standing say (`gorge-slow.ts`). After the beam
 * it stands `gorgeOutBeats` and goes.
 */
export function stepGorge(world: World, g: GorgeState): void {
  const cfg = world.cfg;
  if (g.outBeat >= 0) {
    // Nulled here rather than at the beam, so the frame has its beats of
    // beads leaving before the wave is allowed to end (`bossHoldsWave`).
    if (world.beat - g.outBeat >= cfg.gorgeOutBeats) world.boss = null;
    return;
  }
  vent(world, g);
  stepGorgePry(world, g);
  gorgeSlow(world, g);
  if (world.beat - g.spitBeat < cfg.gorgeSpitBeats) return;
  const mouth = g.intakes[g.mouth];
  if (mouth !== undefined) {
    g.spitBeat = world.beat;
    if (mouth.color !== null && !gorgeFull(mouth, cfg))
      swallow(world, g, g.mouth, mouth, mouth.color);
    return;
  }
  if (g.ruptures < cfg.gorgeSpitRuptures || gorgeBeads(g) === 0) return;
  g.spitBeat = world.beat;
  spitEmptiest(world, g);
}
