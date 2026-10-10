import { bossStrikesHull } from "./boss-strike.js";
import {
  type LampreyState,
  lampreyAsks,
  lampreyNextTooth,
  lampreyStep,
  lampreyTapsWanted,
  lampreyTeethIn,
  lampreyToothIn,
} from "./lamprey.js";
import { lampreyNextAndTail, lampreyTileIndex } from "./lamprey-leap.js";
import { lampreyEntering, lampreyFeeding } from "./lamprey-meal.js";
import {
  lampreyDescends,
  lampreyDownTile,
  lampreyPlugCreep,
  lampreyPlugLand,
} from "./lamprey-plug.js";
import { lampreyRoaming, lampreyRoams, lampreySweepDung } from "./lamprey-roam.js";
import { lampreyTowLand } from "./lamprey-tow.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE LAMPREY's clock, once a beat: the worm crawling in, feeding
 * (`lamprey-meal.ts`) and across the field (`lamprey-roam.ts`), landing on a tile, a stay's
 * window running out, the leap to the next tile, the recoil from a hit, and
 * falling away spent.
 *
 * The thumbs are heard on the tick (`lamprey-hand.ts`) and the shot where a
 * bolt leaves the top of the field (`lamprey-shot.ts`); both call back here
 * when a stay is answered, so the leap starts the tick it is won.
 *
 * **A window run out is the hull**, THE SEAM's rule: the bite goes through,
 * the hull takes it at the tile's column, and the eel leaps on — for the wave
 * is lost anyway (`wave-fail.ts`), and a stay asked again would strike again
 * in a world nobody is playing any more.
 */

export function stepLamprey(world: World, s: LampreyState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  lampreySweepDung(world, s);
  if (s.phase === "spent") {
    if (since >= cfg.lampreySpentBeats) {
      world.events.push({ type: "lampreyOut", col: s.col });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "entering") lampreyEntering(world, s);
  else if (s.phase === "feeding") lampreyFeeding(world, s);
  else if (s.phase === "roam") {
    if (lampreyRoaming(world, s)) land(world, s);
  } else if (s.phase === "leap" && since >= cfg.lampreyLeapBeats) land(world, s);
  else if (s.phase === "recoil" && since >= cfg.lampreyRecoilBeats) leapOn(world, s);
  else if (s.phase === "bite" || s.phase === "rearing") {
    const step = lampreyStep(s);
    // A plug's button pulled out a step further each beat; all the way is the bite through.
    if (step !== null && (since >= step.beats || lampreyPlugCreep(world, s))) bitThrough(world, s);
  }
}

/**
 * Down on the tile it leapt to: a bite under THE SLOW, or the gullet reared
 * and lit — and the next tile drawn now, so the tail can lie away from it.
 * **A crawl's trail is kept** until it sets off again (`leapOn`), so the
 * picture can carry the head over its last tile and swing the body off the
 * trail onto the way the tail lies, rather than jump (the owner, 9 October
 * 2026: *fluent movement where it was before and where it stops*).
 */
function land(world: World, s: LampreyState): void {
  const step = lampreyStep(s);
  if (step === null) {
    spend(world, s);
    return;
  }
  const after = s.steps[s.cursor + 1];
  if (step.ask === "tow") lampreyTowLand(world, s, after);
  else if (step.ask === "plug") lampreyPlugLand(world, s, step, after);
  else lampreyNextAndTail(world, s, step, after);
  const down = lampreyDownTile(world.cfg, after);
  if (down !== null) {
    s.nextCol = down.col;
    s.nextRow = down.row;
  }
  s.phaseBeat = world.beat;
  s.pulled = [];
  s.toothTaps = 0;
  s.tailDown = [false, false];
  s.tailMilli = [0, 0];
  s.headMilli = [0, 0];
  s.slipped = [false, false];
  s.towMilli = 0;
  s.towFrom = -1;
  s.angered = false;
  openSlow(world, step.beats, "ask");
  if (step.ask === "gullet") {
    s.phase = "rearing";
    world.events.push({ type: "lampreyRear", color: step.color, col: s.col });
    return;
  }
  s.phase = "bite";
  s.bitten.push(lampreyTileIndex(world, s.col, s.row));
  if (!lampreyToothIn(s, s.litTooth)) s.litTooth = lampreyNextTooth(s, s.litTooth);
  const side: 0 | 1 = step.holder === 1 ? 0 : 1;
  world.events.push({ type: "lampreyBite", side, tooth: s.litTooth, col: s.col, row: s.row });
}

/** The window run out: the bite through and the hull struck, and the eel off to the next tile. */
function bitThrough(world: World, s: LampreyState): void {
  world.events.push({ type: "lampreyFull", col: s.col });
  closeSlow(world);
  bossStrikesHull(world, "lamprey", s.col, s.row);
  s.pulled = [];
  s.cursor += 1;
  leapOn(world, s);
}

/**
 * A right tap from `side` on the lit tooth: one of the step's `taps`, and the
 * last of them cracks it. Called by the hand (`lamprey-hand.ts`).
 */
export function lampreyTapped(world: World, s: LampreyState, side: 0 | 1): void {
  s.toothTaps += 1;
  if (s.toothTaps >= lampreyTapsWanted(s)) {
    lampreyCracked(world, s, side);
    return;
  }
  const taps = s.toothTaps;
  world.events.push({ type: "lampreyTap", side, tooth: s.litTooth, taps, col: s.col });
}

/**
 * The lit tooth knocked out by `side`: the next one two places on lights, and
 * the stay won once it has given up its teeth.
 */
function lampreyCracked(world: World, s: LampreyState, side: 0 | 1): void {
  const tooth = s.litTooth;
  s.toothTaps = 0;
  s.pulled.push(tooth);
  world.events.push({ type: "lampreyCrack", side, tooth, col: s.col });
  const step = lampreyStep(s);
  if (step === null || s.pulled.length >= step.teeth || lampreyTeethIn(s) === 0) {
    loose(world, s, -1);
    return;
  }
  s.litTooth = lampreyNextTooth(s, tooth);
}

/**
 * A tooth snapped back by a tap from `side` — on a dark tooth, or with the
 * tail loose: the last tooth this stay cracked goes back in, the same tooth
 * stays lit and its taps start again. The window runs on.
 */
export function lampreySnapped(world: World, s: LampreyState, side: 0 | 1): void {
  s.pulled.pop();
  s.toothTaps = 0;
  world.events.push({ type: "lampreySnap", tooth: s.litTooth, side, col: s.col });
}

/**
 * The head pulled off the tile, by a `pull`, an `apart` or a `tow`: the lit
 * tooth stays behind in the bite — but not a `plug`'s, whose teeth were on a
 * button. Called by the hand (`lamprey-hand.ts`).
 */
export function lampreyFreed(world: World, s: LampreyState): void {
  const keeps = lampreyAsks(s) !== "plug" && lampreyToothIn(s, s.litTooth);
  const tooth = keeps ? s.litTooth : -1;
  if (tooth !== -1) s.pulled.push(tooth);
  loose(world, s, tooth);
}

/** The stay won: its teeth out for good, THE SLOW shut, and the eel off to the next tile. */
function loose(world: World, s: LampreyState, tooth: number): void {
  world.events.push({ type: "lampreyLoose", tooth, col: s.col });
  for (const t of s.pulled) s.teethOut |= 1 << t;
  s.pulled = [];
  if (!lampreyToothIn(s, s.litTooth)) s.litTooth = lampreyNextTooth(s, s.litTooth);
  closeSlow(world);
  s.cursor += 1;
  leapOn(world, s);
}

/** The gullet shot in its colour: the eel recoils on its tile. Called by the shot. */
export function lampreyRecoiled(world: World, s: LampreyState): void {
  closeSlow(world);
  s.cursor += 1;
  s.phase = "recoil";
  s.phaseBeat = world.beat;
}

/**
 * Off the tile: a leap to the one drawn as it landed — or, for a step that
 * crawls, the crawl across the field that ends on it — or, with the script
 * done, spent where it is.
 */
function leapOn(world: World, s: LampreyState): void {
  const step = lampreyStep(s);
  if (step === null || s.nextCol < 0) {
    spend(world, s);
    return;
  }
  s.toothTaps = 0;
  s.trailCol = [];
  s.trailRow = [];
  // A tow or a plug is never leapt to: it crawls down the middle of the field at the hull.
  if (step.crawl === true || lampreyDescends(step)) {
    lampreyRoams(world, s, step.crawl === true ? 0 : 2);
    return;
  }
  s.fromCol = s.col;
  s.fromRow = s.row;
  s.col = s.nextCol;
  s.row = s.nextRow;
  s.nextCol = -1;
  s.nextRow = -1;
  s.phase = "leap";
  s.phaseBeat = world.beat;
}

function spend(world: World, s: LampreyState): void {
  s.phase = "spent";
  s.phaseBeat = world.beat;
  world.events.push({ type: "lampreySpent", col: s.col });
}
