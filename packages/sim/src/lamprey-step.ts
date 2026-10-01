import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  freshLamprey,
  type LampreyState,
  type LampreyStep,
  lampreyHeld,
  lampreyNextTooth,
  lampreyStep,
  lampreyTeethIn,
  lampreyToothIn,
} from "./lamprey.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE LAMPREY's clock, once a beat: the jaw held or chewing, the jaw
 * crawling, the lit tooth's window running out, the eel pulling loose,
 * rearing, recoiling, and falling away spent.
 *
 * The thumbs are heard on the tick (`lamprey-hand.ts`) and only *read* here,
 * so a jaw held at the beat's edge is held for that beat. The shot is judged
 * where a bolt leaves the top of the field (`lamprey-shot.ts`).
 *
 * **A full bite is the hull**, THE SEAM's rule: `biteMilli` reaching
 * `lampreyBiteFullMilli` strikes it and the depth starts again from nothing,
 * for the wave is lost anyway. **A gullet's window run out is a lunge**: the
 * eel bites again with the teeth it has left, and the gullet is lit again
 * once they are out — and they are not lost, so the next lunge has them too.
 */

export function installLamprey(world: World, steps: readonly LampreyStep[]): LampreyState {
  const col = steps[0]?.col ?? midCol(world.cfg);
  const s = freshLamprey(world.beat, col, steps);
  world.events.push({ type: "lampreyEnter", col });
  return s;
}

export function stepLamprey(world: World, s: LampreyState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "spent") {
    if (since >= cfg.lampreySpentBeats) {
      world.events.push({ type: "lampreyOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "entering" && since >= cfg.lampreyEnterBeats) next(world, s);
  else if (s.phase === "loose" && since >= cfg.lampreyLooseBeats) next(world, s);
  else if (s.phase === "recoil" && since >= cfg.lampreyRecoilBeats) next(world, s);
  else if (s.phase === "bite") bite(world, s);
  else if (s.phase === "rearing") rearing(world, s, since);
}

/** A beat of a bite: the chew, the crawl, and the lit tooth's window. */
function bite(world: World, s: LampreyState): void {
  const step = lampreyStep(s);
  if (step === null) return;
  if (!lampreyHeld(world, s)) chew(world, s);
  if (world.beat - s.crawlBeat >= step.crawlBeats) crawl(world, s);
  if (world.beat - s.toothBeat >= step.toothBeats) lampreySnapped(world, s, null);
}

/** The jaw not held: the bite a step deeper, and a full one the hull. */
function chew(world: World, s: LampreyState): void {
  const cfg = world.cfg;
  s.biteMilli = Math.min(cfg.lampreyBiteFullMilli, s.biteMilli + cfg.lampreyBiteStepMilli);
  world.events.push({ type: "lampreyGnaw", biteMilli: s.biteMilli, col: s.jawCol });
  if (s.biteMilli < cfg.lampreyBiteFullMilli) return;
  world.events.push({ type: "lampreyFull", col: s.jawCol });
  s.biteMilli = 0;
  bossStrikesHull(world, "lamprey", s.jawCol);
}

/** The jaw a column along the hull, turning back at either end. */
function crawl(world: World, s: LampreyState): void {
  const last = world.cfg.cols - 1;
  if (s.jawCol + s.crawlDir < 0 || s.jawCol + s.crawlDir > last) {
    s.crawlDir = s.crawlDir === 1 ? -1 : 1;
  }
  s.jawCol += s.crawlDir;
  s.crawlBeat = world.beat;
  world.events.push({ type: "lampreyCrawl", dir: s.crawlDir, col: s.jawCol });
}

/**
 * The lit tooth knocked out by `side`: the next one two places on lights with
 * a fresh window, and the bite done once it has given up its teeth. Called by
 * the tap (`lamprey-hand.ts`).
 */
export function lampreyCracked(world: World, s: LampreyState, side: 0 | 1): void {
  const tooth = s.litTooth;
  s.pulled.push(tooth);
  world.events.push({ type: "lampreyCrack", side, tooth, col: s.jawCol });
  closeSlow(world);
  const step = lampreyStep(s);
  if (step === null || s.pulled.length >= step.teeth || lampreyTeethIn(s) === 0) {
    loose(world, s);
    return;
  }
  s.litTooth = lampreyNextTooth(s, tooth);
  s.toothBeat = world.beat;
}

/**
 * The lit tooth snapped back, by a wrong tap from `side` or its window run
 * out (`side` null): the last tooth this bite cracked goes back in, the same
 * tooth stays lit, and its window starts again.
 */
export function lampreySnapped(world: World, s: LampreyState, side: 0 | 1 | null): void {
  s.pulled.pop();
  const tooth = s.litTooth;
  world.events.push(
    side === null
      ? { type: "lampreySnap", tooth, col: s.jawCol }
      : { type: "lampreySnap", tooth, side, col: s.jawCol },
  );
  closeSlow(world);
  s.toothBeat = world.beat;
}

/** The bite given up: the teeth out for good, unless it was a re-bite, and the mouth off the hull. */
function loose(world: World, s: LampreyState): void {
  world.events.push({ type: "lampreyLoose", col: s.jawCol });
  if (s.rebiting) s.rebiting = false;
  else {
    for (const t of s.pulled) s.teethOut |= 1 << t;
    s.cursor += 1;
  }
  s.pulled = [];
  s.phase = "loose";
  s.phaseBeat = world.beat;
}

/** The gullet's window: a hit is the shot's, and the window run out a lunge. */
function rearing(world: World, s: LampreyState, since: number): void {
  const step = lampreyStep(s);
  if (step === null || since < step.beats) return;
  world.events.push({ type: "lampreyLunge", col: step.col });
  s.rebiting = true;
  beginBite(world, s, step);
}

/** The gullet shot in its colour: the eel recoils and the cursor moves on. Called by the shot. */
export function lampreyRecoiled(world: World, s: LampreyState): void {
  s.cursor += 1;
  s.phase = "recoil";
  s.phaseBeat = world.beat;
}

/** The next step: a bite onto the hull, the gullet lit, or, with none, the eel spent. */
function next(world: World, s: LampreyState): void {
  const step = lampreyStep(s);
  const col = midCol(world.cfg);
  if (step === null) {
    s.phase = "spent";
    s.phaseBeat = world.beat;
    world.events.push({ type: "lampreySpent", col });
    return;
  }
  if (step.ask === "bite") {
    beginBite(world, s, step);
    return;
  }
  s.phase = "rearing";
  s.phaseBeat = world.beat;
  world.events.push({ type: "lampreyRear", color: step.color, col });
}

/** The mouth on the hull at the step's column, a tooth lit under THE SLOW. */
function beginBite(world: World, s: LampreyState, step: LampreyStep): void {
  s.phase = "bite";
  s.phaseBeat = world.beat;
  s.jawCol = step.col;
  s.crawlDir = step.crawl;
  s.crawlBeat = world.beat;
  s.pulled = [];
  if (!lampreyToothIn(s, s.litTooth)) s.litTooth = lampreyNextTooth(s, s.litTooth);
  s.toothBeat = world.beat;
  openSlow(world, step.toothBeats + 1, "ask");
  const side: 0 | 1 = step.pinner === 1 ? 0 : 1;
  world.events.push({ type: "lampreyBite", side, tooth: s.litTooth, col: s.jawCol });
}
