import { midCol } from "./config.js";
import {
  type HiveState,
  hiveDown,
  hiveNext,
  hiveNextBeat,
  hiveOpen,
  hiveSiteCols,
  hiveSwelling,
  hiveTwins,
} from "./hive.js";
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
 * **What it spills is what its wave is** (`bossFillsWave`): a plain rock at
 * the top of the breach's column, which the shield turns and the cannon
 * cannot — the design's insect, answered the way a rock is so that the
 * cannon has nothing to do but seal. The look lane owes it a body of its
 * own; the sim owes it a column and a tier.
 */

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
    cols,
    colors,
    sealed: cols.map(() => false),
    opened: 0,
    openBeat: world.beat,
    spillBeat: world.beat,
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

/** One opening, when it is due: the next site, and the one after it too once the openings come in pairs. */
function open(world: World, s: HiveState): void {
  const cfg = world.cfg;
  if (hiveNext(s) < 0 || world.beat < hiveNextBeat(s, cfg)) return;
  const count = hiveTwins(s, cfg) ? 2 : 1;
  for (let n = 0; n < count && hiveNext(s) >= 0; n++) {
    const i = s.opened;
    s.opened += 1;
    world.events.push({ type: "hiveOpen", col: s.cols[i] ?? 0, color: s.colors[i] ?? "red" });
  }
  s.openBeat = world.beat;
}

/** The spill, on its cadence: a rock at the top of every open breach's column. */
function spill(world: World, s: HiveState): void {
  const cfg = world.cfg;
  if (world.beat - s.spillBeat < cfg.hiveSpillBeats) return;
  s.spillBeat = world.beat;
  for (let i = 0; i < s.opened; i++) {
    if (!hiveOpen(s, i)) continue;
    const col = s.cols[i] ?? 0;
    spawnOne(world, { beat: world.beat, col, kind: "meteor", color: null });
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
  if (hiveSwelling(s, cfg, world.beat)) swell(world, s);
  open(world, s);
  spill(world, s);
}
