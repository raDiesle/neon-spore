import { midCol } from "./config.js";
import { breachHull } from "./hull-damage.js";
import { nextInt } from "./rng.js";
import { NO_SHELL } from "./shell.js";
import {
  type SinewState,
  sinewBandMilli,
  sinewDecaying,
  sinewHeld,
  sinewInZone,
  sinewMassLeft,
  sinewMassRow,
  sinewSum,
  sinewSwinging,
  sinewWalked,
  sinewZone,
  sinewZoneWidth,
} from "./sinew.js";
import { catchSinew, releaseSinew } from "./sinew-hand.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE SINEW's clock — the hold, the part, the snap-back, the slack, the
 * fall. The two hands on it are `sinew-hand.ts`, on the tick.
 *
 * Everything here runs on the **beat** from `stepBoss`. The sum is *read* on
 * the beat, like everything else this boss decides: a wobble over the zone's
 * top between two beats is forgiven, and a snap is a number the pair held
 * wrong long enough to hear.
 */

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installSinew(world: World): SinewState {
  const cfg = world.cfg;
  const s: SinewState = {
    kind: "sinew",
    massCol: midCol(cfg),
    fibres: Math.max(1, cfg.sinewFibres),
    pullP1Milli: -1,
    pullP2Milli: -1,
    swayP1Milli: 0,
    swayP2Milli: 0,
    slackMilli: 0,
    zoneLowMilli: 0,
    holdBeat: -1,
    snapBeat: -1,
    catchBeat: -1,
    fallBeat: -1,
    outBeat: -1,
  };
  rollZone(world, s);
  world.events.push({
    type: "sinewSettle",
    col: s.massCol,
    fibres: s.fibres,
    row: sinewMassRow(s, cfg, world.beat),
  });
  return s;
}

/**
 * Where the zone sits for the fibre now hanging by. Rolled anywhere from
 * `sinewZoneLowMilli` up to the band's top for every fibre but the last,
 * whose zone is the last step under the top: one hand at the limit and the
 * other all but, which is the hardest sum there is to say — and still one
 * that can be over-pulled, because the top of the band is the snap and not
 * the zone, and the last fibre's snap is the one that throws three rocks.
 */
function rollZone(world: World, s: SinewState): void {
  const cfg = world.cfg;
  const width = sinewZoneWidth(s, cfg);
  const top = sinewBandMilli(cfg) - width;
  if (s.fibres <= 1) {
    s.zoneLowMilli = Math.max(0, top - width);
    return;
  }
  const low = Math.max(0, Math.min(top, cfg.sinewZoneLowMilli));
  s.zoneLowMilli = low + nextInt(world.rng, Math.max(1, top - low + 1));
}

/** One rock out of the mass, into one of its own columns, from where it hangs. */
function shedRock(world: World, s: SinewState): void {
  const cfg = world.cfg;
  const span = Math.max(1, Math.min(cfg.sinewMassCols, cfg.cols));
  const col = sinewMassLeft(s, cfg) + nextInt(world.rng, span);
  const row = sinewMassRow(s, cfg, world.beat);
  world.creatures.push({
    id: world.nextId++,
    kind: "meteor",
    span: 1,
    col,
    row,
    fromRow: row,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  });
  world.events.push({ type: "sinewRock", col, row });
}

/**
 * The sum went over the zone's top. Both hands are thrown off, the slack is
 * gone with them, the hold starts over, and the mass is whipped hard enough
 * to shed a rock — three on the last fibre, where it hangs lowest.
 */
function snap(world: World, s: SinewState): void {
  const cfg = world.cfg;
  s.snapBeat = world.beat;
  // The catch that bought the last swing's beats back is spent: two clocks
  // that could both read would be a tendon steady and whipping at once.
  s.catchBeat = -1;
  s.holdBeat = -1;
  releaseSinew(world, s, 1);
  releaseSinew(world, s, 2);
  const rocks = s.fibres <= 1 ? cfg.sinewSnapRocksLast : cfg.sinewSnapRocks;
  world.events.push({ type: "sinewSnap", col: s.massCol, rocks });
  for (let i = 0; i < rocks; i++) shedRock(world, s);
}

/**
 * A fibre parts: the mass drops a row, the zone is rolled again for the next
 * one, and the tendon re-seats — no slack. Watched at the slow rate for
 * `sinewPartSlowBeats`, a moment that asks nothing.
 *
 * The last one drops the mass, and the hands stay on for the fall — **the
 * one ask in this fight with a clock on it**, so THE SLOW spans the whole of
 * it from here (`docs/decisions.md` #33) and is shut the beat the mass is
 * walked clear or lands (`fall`).
 */
function part(world: World, s: SinewState): void {
  const cfg = world.cfg;
  s.fibres -= 1;
  s.holdBeat = -1;
  s.slackMilli = 0;
  if (s.fibres <= 0) {
    openSlow(world, cfg.sinewFallBeats);
    s.fallBeat = world.beat;
    const row = sinewMassRow(s, cfg, world.beat);
    world.events.push({ type: "sinewFall", col: s.massCol, row });
    return;
  }
  openSlow(world, cfg.sinewPartSlowBeats);
  rollZone(world, s);
  world.events.push({
    type: "sinewPart",
    col: s.massCol,
    fibres: s.fibres,
    row: sinewMassRow(s, cfg, world.beat),
  });
}

/**
 * One beat of the fall. Both hands carried past `sinewSwayMilli` the same
 * way walk the mass a column that way; at `sinewFallBeats` it lands — at the
 * wall if it was walked `sinewClearCols` from the middle, on the hull if not.
 * THE SLOW over the fall stops on whichever comes first: the walk answered,
 * or the landing.
 */
function fall(world: World, s: SinewState): void {
  const cfg = world.cfg;
  if (world.beat - s.fallBeat >= cfg.sinewFallBeats) {
    closeSlow(world);
    s.outBeat = world.beat;
    if (sinewWalked(s, cfg) >= cfg.sinewClearCols) {
      world.events.push({ type: "sinewOut", col: s.massCol });
      return;
    }
    world.events.push({ type: "sinewCrush", col: s.massCol });
    breachHull(world, s.massCol, "meteor", sinewMassRow(s, cfg, world.beat), "heavy");
    return;
  }
  if (!sinewHeld(s, 1) || !sinewHeld(s, 2)) return;
  const dir1 = Math.sign(s.swayP1Milli);
  const dir2 = Math.sign(s.swayP2Milli);
  if (dir1 === 0 || dir1 !== dir2) return;
  if (Math.abs(s.swayP1Milli) < cfg.sinewSwayMilli || Math.abs(s.swayP2Milli) < cfg.sinewSwayMilli)
    return;
  const dir: -1 | 1 = dir1 < 0 ? -1 : 1;
  const half = Math.floor(Math.max(1, Math.min(cfg.sinewMassCols, cfg.cols)) / 2);
  const col = Math.max(half, Math.min(cfg.cols - 1 - half, s.massCol + dir));
  if (col === s.massCol) return;
  s.massCol = col;
  world.events.push({ type: "sinewSwing", col, dir });
  if (sinewWalked(s, cfg) >= cfg.sinewClearCols) closeSlow(world);
}

/**
 * One beat of the tendon.
 *
 * After the mass lands it stands `sinewOutBeats` and goes. While it falls,
 * the fall. While the handles swing, the one thing that can happen is the
 * catch — both hands carried outward end the swing here. Otherwise: the slack
 * creeps if it is time; then the sum is read against the zone — over the top
 * is a snap, inside is the hold counting or the fibre parting, under is the
 * hold starting over.
 *
 * The catch returns either way: caught, the beat is spent on the catching and
 * the tendon is read again from the next one; uncaught, the swing has beats
 * left to run and the sum is a pair of hands pinned to nought.
 */
export function stepSinew(world: World, s: SinewState): void {
  const cfg = world.cfg;
  if (s.outBeat >= 0) {
    // Nulled here rather than at the landing, so the frame has its beats of
    // the mass settling before the wave is allowed to end (`bossHoldsWave`).
    if (world.beat - s.outBeat >= cfg.sinewOutBeats) world.boss = null;
    return;
  }
  if (s.fallBeat >= 0) {
    fall(world, s);
    return;
  }
  if (sinewSwinging(s, world)) {
    catchSinew(world, s);
    return;
  }
  if (sinewDecaying(s, cfg) && (sinewHeld(s, 1) || sinewHeld(s, 2))) {
    s.slackMilli = Math.min(sinewBandMilli(cfg), s.slackMilli + cfg.sinewDecayMilli);
    world.events.push({ type: "sinewSlack", col: s.massCol, slackMilli: s.slackMilli });
  }
  if (sinewSum(s) > sinewZone(s, cfg).high) {
    snap(world, s);
    return;
  }
  if (!sinewInZone(s, cfg)) {
    if (s.holdBeat >= 0) {
      s.holdBeat = -1;
      world.events.push({ type: "sinewLoose", col: s.massCol });
    }
    return;
  }
  if (s.holdBeat < 0) {
    s.holdBeat = world.beat;
    world.events.push({ type: "sinewEnter", col: s.massCol });
    return;
  }
  if (world.beat - s.holdBeat >= cfg.sinewHoldBeats) part(world, s);
}
