import { midCol } from "./config.js";
import { nextInt } from "./rng.js";
import { openSlow } from "./slow.js";
import {
  type TasterBlade,
  type TasterState,
  tasterGrowing,
  tasterLean,
  tasterLifted,
  tasterOrder,
  tasterPhase,
} from "./taster.js";
import type { World } from "./world.js";

/**
 * THE TASTER's clock — the crest arriving, a blade coming out of it, its colour
 * setting on the ledger, and the fan re-edging itself.
 *
 * Everything here runs on the **beat**, from `stepBoss`. What a shot does to it
 * is `taster-shot.ts`, on the tick.
 *
 * **Nothing here reads how well the pair played.** Every decision this file
 * makes is `spendLean` over a window, which counts colours out of the muzzle
 * and cannot see what any of them hit (`spend.ts`) — the condition
 * `docs/spec/bosses.md`'s *fixed and learnable* puts on a boss that reacts to the pair at all.
 */

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installTaster(world: World): TasterState {
  const cfg = world.cfg;
  const width = Math.min(cfg.tasterBlades, cfg.cols);
  const col = Math.max(0, Math.min(cfg.cols - width, midCol(cfg) - Math.floor(width / 2)));
  const blades: TasterBlade[] = [];
  for (let i = 0; i < width; i++)
    blades.push({ edge: null, layers: 0, growBeat: -1, setBeat: -1, shorn: false });
  world.events.push({ type: "tasterRise", col, width });
  return {
    kind: "taster",
    col,
    blades,
    shorn: 0,
    crest: 0,
    liftBeat: -1,
    edgeBeat: world.beat,
    outBeat: -1,
  };
}

/**
 * Every blade whose growth is up **sets its colour**, off the ledger — the one
 * beat of this fight the design gives THE SLOW, because it is the moment the
 * pair learns whether their last conversation worked.
 *
 * Several setting on one beat read the same window and therefore set the same
 * colour, which is the design's *three blades in that same colour at once* with
 * nothing added to get it. A dead heat is decided by the seeded rng, which is
 * `openMouth`'s answer to the same question one boss over: the pair gave it no
 * lean, so the boss picks, and both devices pick the same one.
 */
function setEdges(world: World, t: TasterState): void {
  const cfg = world.cfg;
  for (let i = 0; i < t.blades.length; i++) {
    const k = t.blades[i];
    if (k === undefined || k.shorn || k.growBeat < 0 || k.setBeat >= 0) continue;
    if (world.beat - k.growBeat < cfg.tasterGrowBeats) continue;
    k.edge = tasterLean(world, t) ?? (nextInt(world.rng, 2) === 0 ? "red" : "cyan");
    k.layers = 1;
    k.setBeat = world.beat;
    world.events.push({ type: "tasterSet", col: t.col + i, color: k.edge });
    openSlow(world, cfg.tasterSlowBeats);
  }
}

/** The next blades out of the crest, from the middle outward (`tasterOrder`). */
function grow(world: World, t: TasterState, atOnce: number): void {
  let growing = tasterGrowing(t);
  for (const i of tasterOrder(t.blades.length)) {
    if (growing >= atOnce) return;
    const k = t.blades[i];
    if (k === undefined || k.growBeat >= 0) continue;
    k.growBeat = world.beat;
    growing += 1;
    world.events.push({ type: "tasterGrow", col: t.col + i });
  }
}

/**
 * Every standing blade **re-edges** to the current majority: the design's
 * *it noticed*, and the reason the pair has to cut the crest.
 *
 * Nothing happens on a dead heat — there is no majority to re-edge to — and
 * nothing happens once the crest is cut through, which is the whole of what
 * those four shots into the gaps buy.
 */
function reEdge(world: World, t: TasterState): void {
  const cfg = world.cfg;
  if (tasterLifted(t) || world.beat - t.edgeBeat < cfg.tasterEdgeBeats) return;
  t.edgeBeat = world.beat;
  const lean = tasterLean(world, t);
  if (lean === null) return;
  let moved = false;
  for (const k of t.blades) {
    if (k.shorn || k.setBeat < 0 || k.edge === lean) continue;
    k.edge = lean;
    k.setBeat = world.beat;
    moved = true;
  }
  if (!moved) return;
  world.events.push({ type: "tasterTaste", color: lean });
  openSlow(world, cfg.tasterSlowBeats);
}

/**
 * One beat of the fan.
 *
 * Colours set first, so a blade that has just decided frees its place for the
 * next one on the same beat rather than on the one after. Then the fan grows —
 * one blade at a time until the pair has taken two, `tasterFanBlades` after
 * that — and then, once it is hurrying, the re-edge on its own count. A closed
 * fan does none of it: it has stopped growing and stopped tasting, and the
 * only thing left in the fight is the beam.
 */
export function stepTaster(world: World, t: TasterState): void {
  const cfg = world.cfg;
  if (t.outBeat >= 0) {
    // Nulled here rather than at the beam, so the frame has its beats of the
    // fan unlocking before the wave is allowed to end (`bossHoldsWave`).
    if (world.beat - t.outBeat >= cfg.tasterOutBeats) world.boss = null;
    return;
  }
  const phase = tasterPhase(t, cfg);
  if (phase === "closed") return;
  setEdges(world, t);
  grow(world, t, phase === "opening" ? 1 : cfg.tasterFanBlades);
  if (phase === "hurrying") reEdge(world, t);
}
