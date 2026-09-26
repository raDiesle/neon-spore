import { metColor } from "./balance.js";
import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { type KeelState, keelSegCol, NO_JOINT } from "./keel.js";
import { closeSlow, openSlow } from "./slow.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE KEEL's story between the last lock and the end** (§24 rows 9, 10
 * and 15): the three states that turn the fight from nine taps into a spine
 * that fights back, shows what it kept, and cools.
 *
 * - **The flip.** The moment the second movement locks the last segment the
 *   arch bows the wrong way, under THE SLOW. Both thumbs hold the spine's two
 *   end joints down together — P1 the left, P2 the right — for
 *   `keelChordBeats` beats in a row, and the flip is arrested. A beat without
 *   both down starts the count again. Let it run out and the spine snaps back
 *   against the hull (`bossStrikesHull`), and bows again.
 * - **The marrow.** Arrested, a seam lights down the spine's middle, under
 *   THE SLOW. A bolt of each colour up the middle column seals it. Unsealed
 *   when the window runs out, it burns through and the left-middle segment
 *   works loose — re-earned in the tempo run, which reads any loose segment
 *   after the wave's order. Either way the tempo run is next.
 * - **The cooldown.** After the rock, the locked segments bank from white to
 *   iron one after another while both hands stay off. A tap on the spine
 *   flares it, and the bank takes a beat longer, at most `keelCoolFlares`.
 */

/** A new phase, from this beat, with no joint lit. */
export function keelEnter(world: World, s: KeelState, phase: KeelState["phase"]): void {
  s.phase = phase;
  s.phaseBeat = world.beat;
  s.joint = NO_JOINT;
  if (phase === "straight") world.events.push({ type: "keelStraight", col: midCol(world.cfg) });
}

/** The spine is first rigid: it bows the wrong way. */
export function openFlip(world: World, s: KeelState): void {
  keelEnter(world, s, "flip");
  s.chordBeats = 0;
  openSlow(world, world.cfg.keelFlipBeats, "ask");
  world.events.push({ type: "keelFlip", col: midCol(world.cfg) });
}

/** A beat of the flip: the chord counted, then arrested, run out, or neither. */
export function stepFlip(world: World, s: KeelState, since: number): void {
  const cfg = world.cfg;
  const mid = midCol(cfg);
  s.chordBeats = s.held[0] && s.held[1] ? s.chordBeats + 1 : 0;
  if (s.chordBeats >= cfg.keelChordBeats) {
    closeSlow(world);
    world.events.push({ type: "keelArrest", col: mid });
    openMarrow(world, s);
    return;
  }
  if (since < cfg.keelFlipBeats) return;
  world.events.push({ type: "keelSnap", col: mid });
  bossStrikesHull(world, "keel", mid);
  openFlip(world, s);
}

function openMarrow(world: World, s: KeelState): void {
  keelEnter(world, s, "marrow");
  s.marrow = [false, false];
  openSlow(world, world.cfg.keelMarrowBeats, "ask");
  world.events.push({ type: "keelMarrow", col: midCol(world.cfg) });
}

/** A beat of the marrow: unsealed at the end of its window, it burns through. */
export function stepMarrow(world: World, s: KeelState, since: number): void {
  if (since < world.cfg.keelMarrowBeats) return;
  const seg = s.locked.length / 2 - 1;
  s.locked[seg] = false;
  world.events.push({
    type: "keelBurn",
    seg,
    col: keelSegCol(seg, s.locked.length, world.cfg.cols),
  });
  toTempo(world, s);
}

/**
 * A bolt up the middle while the marrow is lit: each colour counts once, and
 * the second seals it. Anywhere else, or a colour already in, is nothing.
 */
export function keelMarrowStruck(world: World, s: KeelState, bullet: Bullet): boolean {
  if (s.phase !== "marrow" || bullet.col !== midCol(world.cfg)) return false;
  const i = bullet.color === "red" ? 0 : 1;
  if (s.marrow[i]) return true;
  s.marrow[i] = true;
  metColor(world);
  if (!s.marrow[0] || !s.marrow[1]) return true;
  closeSlow(world);
  world.events.push({ type: "keelSeal", col: bullet.col });
  toTempo(world, s);
  return true;
}

/** Every joint dims at once, before the tempo run. */
export function toTempo(world: World, s: KeelState): void {
  s.movement = 3;
  s.repriseCursor = 0;
  keelEnter(world, s, "rest");
  world.events.push({ type: "keelDim", col: midCol(world.cfg) });
}

/** The rock is gone: the locked segments begin to bank, hands off. */
export function openCool(world: World, s: KeelState): void {
  keelEnter(world, s, "cool");
  s.flares = 0;
  openSlow(world, world.cfg.keelCoolBeats, "ask");
  world.events.push({ type: "keelCool", col: midCol(world.cfg) });
}

/** A beat of the cooldown: banked once its beats and any flares are spent. */
export function stepCool(world: World, s: KeelState, since: number): void {
  if (since >= world.cfg.keelCoolBeats + s.flares) keelEnter(world, s, "straight");
}

/** A tap on the cooling spine: it flares, and banks a beat later. */
export function keelFlared(world: World, s: KeelState): void {
  if (s.flares >= world.cfg.keelCoolFlares) return;
  s.flares += 1;
  openSlow(world, world.cfg.keelCoolBeats + s.flares - (world.beat - s.phaseBeat), "ask");
  world.events.push({ type: "keelFlare", col: midCol(world.cfg) });
}
