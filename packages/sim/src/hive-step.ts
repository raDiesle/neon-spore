import { midCol } from "./config.js";
import {
  type HivePhase,
  type HiveState,
  hiveDown,
  hiveNext,
  hiveNextBeat,
  hiveOpen,
  hiveSiteCols,
  hiveSwelling,
  hiveTwins,
} from "./hive.js";
import { hiveClenched, hiveClenchUntil, hivePinchDone, NO_PINCH } from "./hive-lobe.js";
import { livingKindForColor } from "./kinds.js";
import { nextInt } from "./rng.js";
import { spawnOne } from "./spawn.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE HIVE's clock — the look, the swell, the openings and the spill. What
 * seals a breach is `hive-shot.ts`, on the tick.
 *
 * Everything here runs on the **beat** from `stepBoss`, and in one order:
 * the next site **swells** if it is due to, then **opens** if it is due,
 * then every open breach **spills** if the cadence says so — so a breach
 * that opens on a spill beat spills on it, and the pair is never shown a
 * breach that has not yet cost them anything. The order of the sites and
 * their colours are the seed's, decided once at install, which is what
 * makes the pilot's read a read: an author would have written a pattern,
 * and a pattern is a thing the navigator could learn.
 *
 * **What it spills is what its wave is** (`bossFillsWave`): the breach's own
 * colour, living (`livingKindForColor`) rather than a rock — a matching bolt
 * kills it same as any other coloured body, so a breach costs two shots
 * inside one `hiveSpillBeats` cadence: one to clear the column, one to seal
 * it, same as `antiphon-step.ts` answers its own spill. Answered by the
 * owner, 19 September 2026: a plain rock stopped every bolt regardless of
 * colour, so the fight could not be won at the shipped numbers.
 *
 * **A clench is folded into the same order** and changes only two of its
 * steps: nothing spills while the underside is up, and a clench that runs
 * out relaxes *before* the swell, so the beat it comes back down is a beat
 * the backlog falls on. The openings it covers are not touched at all,
 * which is the departure the whole boss is built on (`config-hive.ts`).
 */

/** Walk the mass into a phase, remembering the beat it arrived. The one writer of both fields. */
export function enterHivePhase(s: HiveState, phase: HivePhase, beat: number): void {
  s.phase = phase;
  s.phaseBeat = beat;
}

/** Install it from the wave's own `boss:` entry: every site shut, the order and the colours sown by the seed. */
export function installHive(world: World): HiveState {
  const cfg = world.cfg;
  const cols = hiveSiteCols(cfg, cfg.hiveSites);
  // Fisher–Yates over the columns, so the order the sites open in is the
  // seed's and not left to right; the colours are rolled site by site.
  for (let i = cols.length - 1; i > 0; i--) {
    const j = nextInt(world.rng, i + 1);
    const a = cols[i] ?? 0;
    cols[i] = cols[j] ?? 0;
    cols[j] = a;
  }
  const colors: Color[] = cols.map(() => (nextInt(world.rng, 2) === 0 ? "red" : "cyan"));
  const s: HiveState = {
    kind: "hive",
    phase: "hang",
    phaseBeat: world.beat,
    cols,
    colors,
    sealed: cols.map(() => false),
    wrung: cols.map(() => false),
    opened: 0,
    openBeat: world.beat,
    spillBeat: world.beat,
    pinch: NO_PINCH,
    pinchBeat: 0,
    haulMilli: 0,
    downBeat: -1,
  };
  world.events.push({ type: "hiveEnter", col: midCol(cfg) });
  return s;
}

/** The navigator's warning: the beat the next site starts to swell, said once. */
function swell(world: World, s: HiveState): void {
  const cfg = world.cfg;
  const next = hiveNext(s);
  if (next < 0 || world.beat !== hiveNextBeat(s, cfg) - cfg.hiveSwellBeats) return;
  world.events.push({ type: "hiveSwell", col: s.cols[next] ?? 0 });
}

/**
 * One opening, when it is due: the next site, and the one after it too once
 * the openings come in pairs.
 *
 * **A lobe under a thumb long enough opens wrung** — the colour is squeezed
 * out of it on the way, so either colour seals it, and the mass feels the
 * hand exactly as it feels a wrong bolt (`hiveProvokeBeats`). The thumb is
 * let go of here rather than on the lift: the lobe it was on is not a lobe
 * any more, and a thumb still down is a thumb on the next swell only if it
 * is put there.
 */
function open(world: World, s: HiveState): void {
  const cfg = world.cfg;
  if (hiveNext(s) < 0 || world.beat < hiveNextBeat(s, cfg)) return;
  const count = hiveTwins(s, cfg) ? 2 : 1;
  const wrung = hivePinchDone(s, cfg, world.beat) ? s.pinch : NO_PINCH;
  for (let n = 0; n < count && hiveNext(s) >= 0; n++) {
    const i = s.opened;
    s.opened += 1;
    world.events.push({ type: "hiveOpen", col: s.cols[i] ?? 0, color: s.colors[i] ?? "red" });
    if (i !== wrung) continue;
    s.wrung[i] = true;
    s.spillBeat -= cfg.hiveProvokeBeats;
    s.pinch = NO_PINCH;
    world.events.push({ type: "hiveWrung", col: s.cols[i] ?? 0 });
  }
  s.openBeat = world.beat;
  if (s.phase === "hang") enterHivePhase(s, "spill", world.beat);
}

/**
 * A clench that nobody hauled, letting go of its own accord — and paying
 * the pair back for the wait. The cadence was carried along with the mass
 * while it was up (`spill`), so it is set one full cadence back here: the
 * beat it relaxes is a spill beat, and every breach that opened behind the
 * clench spills on it at once. A clench *hauled* down never comes through
 * here, which is the whole of what the gesture buys.
 */
function relax(world: World, s: HiveState): void {
  const cfg = world.cfg;
  if (!hiveClenched(s) || world.beat < hiveClenchUntil(s, cfg)) return;
  enterHivePhase(s, "spill", world.beat);
  s.spillBeat = world.beat - cfg.hiveSpillBeats;
}

/** The spill, on its cadence: the breach's own colour, living, at the top of every open column. */
function spill(world: World, s: HiveState): void {
  const cfg = world.cfg;
  // Clenched, the underside is up out of reach and nothing comes out of it.
  // The cadence rides along rather than piling up: what a clench owes is
  // settled in one place, when it runs out rather than when it is hauled.
  if (hiveClenched(s)) {
    s.spillBeat = world.beat;
    return;
  }
  if (world.beat - s.spillBeat < cfg.hiveSpillBeats) return;
  s.spillBeat = world.beat;
  for (let i = 0; i < s.opened; i++) {
    if (!hiveOpen(s, i)) continue;
    const col = s.cols[i] ?? 0;
    const color = s.colors[i] ?? "red";
    spawnOne(world, { beat: world.beat, col, kind: livingKindForColor(color), color });
    world.events.push({ type: "hiveSpill", col });
  }
}

/** One beat of the body. */
export function stepHive(world: World, s: HiveState): void {
  const cfg = world.cfg;
  if (hiveDown(s)) {
    // Nulled here rather than at the seal, so the frame has its beats of the
    // scarred underside before the wave is allowed to end (`bossHoldsWave`).
    if (world.beat - s.downBeat >= cfg.hiveOutBeats) {
      world.events.push({ type: "hiveOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  // The swell is checked before the opening moves the clock, so a swell of
  // nought beats is never said on the beat the site is already open.
  relax(world, s);
  if (hiveSwelling(s, cfg, world.beat)) swell(world, s);
  open(world, s);
  spill(world, s);
}
