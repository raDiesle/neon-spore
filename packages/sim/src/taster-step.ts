import { midCol } from "./config.js";
import { nextInt } from "./rng.js";
import {
  type TasterBlade,
  type TasterState,
  tasterGrowing,
  tasterLean,
  tasterLifted,
  tasterOrder,
  tasterPhase,
  tasterPinSpent,
  tasterPried,
  tasterStanding,
} from "./taster.js";
import { tasterHandsFresh } from "./taster-hand.js";
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
    ...tasterHandsFresh(),
    outBeat: -1,
  };
}

/**
 * Every blade whose growth is up **sets its colour**, off the ledger — the
 * moment the pair learns whether their last conversation worked. It held THE
 * SLOW for a beat until 24 September 2026, when the slow moved to the pry,
 * the one ask in this fight with a clock on it (`taster-hand.ts`).
 *
 * Several setting on one beat read the same window and therefore set the same
 * colour, which is the design's *three blades in that same colour at once* with
 * nothing added to get it. A dead heat is decided by the seeded rng, which is
 * `openMouth`'s answer to the same question one boss over: the pair gave it no
 * lean, so the boss picks, and both devices pick the same one.
 */
function setEdges(world: World, t: TasterState): void {
  const cfg = world.cfg;
  const spent = tasterPinSpent(t, cfg);
  for (let i = 0; i < t.blades.length; i++) {
    const k = t.blades[i];
    if (k === undefined || k.shorn || k.growBeat < 0 || k.setBeat >= 0) continue;
    if (world.beat - k.growBeat < cfg.tasterGrowBeats) continue;
    // **The pinned blade does not decide.** Its growth is up and its colour is
    // not: the pilot's thumb is holding it there, and what he has bought is the
    // beats between now and `tasterPinBeats` (`taster-hand.ts`).
    const held = t.pin === i;
    if (held && !spent) continue;
    k.edge = tasterLean(world, t) ?? (nextInt(world.rng, 2) === 0 ? "red" : "cyan");
    k.layers = 1;
    k.setBeat = world.beat;
    world.events.push({ type: "tasterSet", col: t.col + i, color: k.edge });
    if (!held) continue;
    // Held to the end, and the edge came up heavy for it: the bet's other
    // side, and the reason a pin is not a free look at the ledger.
    k.layers = cfg.tasterThickMax;
    world.events.push({ type: "tasterThick", col: t.col + i, layers: k.layers });
    t.pin = -1;
    t.pinBeats = 0;
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
}

/**
 * **What the pilot's thumb came to over the beat**, and what the interlock did
 * while it was open.
 *
 * The two counts the hands are judged by, kept here rather than in
 * `taster-hand.ts` for `undertow-hand.ts`' reason turned round: a thumb is a
 * thing that happens on the tick, and *how long it has been there* is a thing
 * that happens on the beat, and this is the file the beat is in.
 *
 * A pin whose blade went while it was held — struck off by the other seat, or
 * decided past the hold — is a thumb on nothing, and the hold goes with it.
 * The count is **not** reset by a slip, for the reason THE UNDERTOW's free is
 * not: a count that punished a dropped move would ask a phone for the one
 * thing it cannot promise (`docs/spec/latency.md`); a thumb genuinely lifted
 * clears it in `taster-hand.ts`, where the lift is heard.
 */
function stepTasterHands(world: World, t: TasterState): void {
  const cfg = world.cfg;
  if (t.pin >= 0) {
    const k = t.blades[t.pin];
    if (k === undefined || k.shorn || k.setBeat >= 0) {
      t.pin = -1;
      t.pinBeats = 0;
    } else if (t.pinBeats < cfg.tasterPinBeats) t.pinBeats += 1;
  }
  // The window shutting undone: the last blades fold back over the body and
  // the pair pays for it in the one currency this movement has, which is the
  // pry and the fill again. `tasterClose` because that is what it is — the
  // same two edges locking, and the sound the fan already had for it.
  if (t.pryBeat >= 0 && !tasterPried(t, world.beat, cfg)) {
    t.pryBeat = -1;
    t.pryMilli = 0;
    t.pryFills = 0;
    world.events.push({
      type: "tasterClose",
      col: t.col + Math.floor(t.blades.length / 2),
      left: tasterStanding(t),
    });
  }
}

/**
 * One beat of the fan.
 *
 * The hands are counted first, so a pin that has just run out is spent on this
 * beat's `setEdges` rather than on the next one. Then colours set, so a blade
 * that has just decided frees its place for the next one on the same beat.
 * Then the fan grows — one blade at a time until the pair has taken two,
 * `tasterFanBlades` after that — and then, once it is hurrying, the re-edge on
 * its own count.
 *
 * **A closed fan does none of that and is no longer idle.** It has stopped
 * growing and stopped tasting, and what is left in the fight is the pilot's
 * carry and the beam behind it — so the window the carry opened is counted
 * here, and the fan locking again is the one thing this file does in `closed`.
 */
export function stepTaster(world: World, t: TasterState): void {
  const cfg = world.cfg;
  if (t.outBeat >= 0) {
    // Nulled here rather than at the beam, so the frame has its beats of the
    // fan unlocking before the wave is allowed to end (`bossHoldsWave`).
    if (world.beat - t.outBeat >= cfg.tasterOutBeats) world.boss = null;
    return;
  }
  stepTasterHands(world, t);
  const phase = tasterPhase(t, cfg);
  if (phase === "closed") return;
  setEdges(world, t);
  grow(world, t, phase === "opening" ? 1 : cfg.tasterFanBlades);
  if (phase === "hurrying") reEdge(world, t);
}
