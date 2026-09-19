import {
  CURTAIN_COLS,
  type CurtainState,
  carryIsReady,
  curtainBody,
  curtainCoreBare,
  type GorgeState,
  gorgeFull,
  gorgeNearestFull,
  gorgePhase,
  occupiesCol,
  priming,
  type QueenState,
  queenGesture,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { creatureCenter } from "./creature-place.js";
import { gorgeIntakeY } from "./gorge-draw.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { queenMarkCenter } from "./queen-figure.js";

/**
 * **What THE GORGE, THE CURTAIN and BULB QUEEN are asking for**,
 * read off their own state and turned into at most one word each.
 *
 * The rules every reading here obeys are `boss-cue.ts`'s, and the one worth
 * repeating beside the code is the third: **a mark stands only on something
 * this seat is already shown**. Each cue below names the `showsX` predicate
 * that makes it true, because that is the line between a cue and the pair's
 * own sentence — a frame is a *place*, and a place handed to the seat that
 * was not given it is the other half of their picture, taken.
 *
 * Nothing here is held between frames, nothing here reaches `world`, and
 * every number it reads is one the simulation already keeps.
 */

/** How far a cue's frame reaches, in tiles: THE CHOIR's, which is the one
 * shipped frame of this shape and the size a pair has already met. */
const HALF_W = 0.72;
const HALF_H = 0.66;

/** A frame around one tile's worth of a thing. */
function markAt(
  seat: BossCue["seat"],
  kind: BossCue["kind"],
  word: string,
  x: number,
  y: number,
  l: Layout,
  seed: number,
  wide = 1,
): BossCue {
  return {
    seat,
    kind,
    word,
    x,
    y,
    halfW: l.tile * HALF_W * wide,
    halfH: l.tile * HALF_H,
    seed,
  };
}

/**
 * THE GORGE. The fight is *stop shooting*, so the cue is silent while it is
 * being fed: there is nothing to do, and a word standing over a sack that
 * wants to be left alone would be the boss asking for its own dinner.
 *
 * It speaks at the moments something is owed, and to the seat that owes it.
 * An intake come full asks two things at once, one of each seat: `PIERCE`
 * on the navigator, who fires and is already shown which intake is nearest
 * (`showsGorgeNearest`), and `PINCH` on the pilot, whose thumb holds the
 * vent off while she loads — silent once it is down (`sim/gorge-hand.ts`).
 * The mouth asks the navigator alone, in the order the pry is meant to be
 * taken: `BURN` first, because a pry taken before the beam is filling is
 * thrown off; `PRY` once a lobe is filling and no thumb is on the mouth; and
 * `BURN` again under the pry, for the window it opened (`gorge-grip.ts`).
 */
export function gorgeCues(l: Layout, world: World, g: GorgeState): readonly BossCue[] {
  const cfg = world.cfg;
  const phase = gorgePhase(g, cfg);
  if (phase === "out") return [];
  const y = gorgeIntakeY(l, g, cfg);
  if (phase === "gorged" && g.mouth >= 0) {
    const x = tileCX(l, g.col + g.mouth);
    if (g.pry < 0 && priming(world)) return [markAt(2, "HOLD", "PRY", x, y, l, 75)];
    return [markAt(2, "HOLD", "BURN", x, y, l, 33)];
  }
  const near = gorgeNearestFull(g);
  const intake = near < 0 ? undefined : g.intakes[near];
  if (intake === undefined || !gorgeFull(intake, cfg)) return [];
  const x = tileCX(l, g.col + near);
  const out = [markAt(2, "PRESS", "PIERCE", x, y, l, 34)];
  if (g.pinch < 0) out.push(markAt(1, "HOLD", "PINCH", x, y, l, 76));
  return out;
}

/**
 * THE CURTAIN. Two words, and the whole encounter is which of them is true.
 *
 * `SHOVE` is **either seat's**, because the carry is (`grip-push.ts`): a
 * thumb on the fabric moves it whoever it belongs to, and the frame stands on
 * the sheet, which both screens are drawn. It is silent while the body is in
 * the beat of quiet a carry costs (`carryIsReady`), so the word appears only
 * on a beat a hand can actually spend.
 *
 * `FIRE` is the navigator's, and it stands on the core — which is *her*
 * picture and not his (`showsCurtainShadow`). On the pilot's screen, where
 * the core is only a suspicion, there is no mark and no word.
 */
export function curtainCues(l: Layout, world: World, c: CurtainState): readonly BossCue[] {
  if (c.outBeat >= 0) return [];
  const y = tileCY(l, world.cfg.curtainRow);
  if (curtainCoreBare(world, c)) {
    return [markAt(2, "PRESS", "FIRE", tileCX(l, c.coreCol), y, l, 35)];
  }
  const body = curtainBody(world, c);
  if (body === undefined || !carryIsReady(world, body)) return [];
  return [
    markAt(null, "CARRY", "SHOVE", tileCX(l, body.col + (CURTAIN_COLS - 1) / 2), y, l, 36, 2),
  ];
}

/**
 * BULB QUEEN. The oldest boss in the game and the one whose whole difficulty
 * is a **column one seat knows and the other has to be told**, so it is the
 * sharpest test of #34's third rule there is: every word below stands on
 * something its own seat is already shown, and not one of them says left or
 * right.
 *
 * `FIRE` stands on the mark that is **really** open, which is the navigator's
 * picture and hers alone (`showsQueenHint`, `queen-weakpoint.ts`). On the
 * pilot's screen the same two marks are drawn with nothing to tell them apart,
 * and there is no word over either.
 *
 * `MOVE` stands on the **cannon**, on the hull, for the whole of the bloom —
 * from the announcement to the close — and it is the pilot's. It says the verb
 * and stops: which column is the sentence he has to ask her for, and a word
 * that vanished once he was under the real mark would answer it by
 * disappearing. So it does not, and it is not suppressed when he is right.
 *
 * The torch is the second thing she does, and the ward is two hands: `MOVE` on
 * the **plate** is the navigator's, silent while the plate already stands in
 * the torch's columns (`occupiesCol`, the simulation's own rule) for THE
 * LEDGER's reason — a word over a shield that is where it should be teaches
 * the pair to stop reading words. `GUARD` rides the torch down and is the
 * pilot's, who holds the trigger; it says nothing about *when*, which is the
 * one sentence this fight is built to make them say.
 *
 * **The order is per seat, and it is what expires first.** She is open for two
 * beats and the pilot's `MOVE` goes with it, so the bloom outranks the torch
 * on his screen; the torch outranks the bloom on hers, because a torch that
 * lands is a hull breach and a hull breach fails the whole wave, while a mark
 * missed costs nothing but the beat.
 */
export function queenCues(
  l: Layout,
  world: World,
  q: QueenState,
  beatPhase: number,
): readonly BossCue[] {
  const queen = world.creatures.find((c) => c.kind === "queen");
  if (queen === undefined) return [];
  const torch = world.creatures.reduce<(typeof world.creatures)[number] | undefined>(
    (low, c) => (c.kind === "torch" && (low === undefined || c.row > low.row) ? c : low),
    undefined,
  );
  const out: BossCue[] = [];
  if (torch !== undefined && !occupiesCol(torch, world.shieldCol)) {
    out.push(markAt(2, "CARRY", "MOVE", tileCX(l, world.shieldCol), l.hullY, l, 37));
  }
  // The two phases answered on her picture (`queen-hand.ts`): the pilot's
  // word stands on her own column, in the gap between the marks — never on
  // one, because which of the two is real is the fight, and his thumb is
  // the one that has to be told. PRESS while a pry is waiting; HOLD for the
  // whole of a SCREAM bloom, from its tell, so the thumb is there when it opens.
  const gesture = queenGesture(q);
  if (gesture === "pry" && q.openBeat !== -1 && queen.color === null) {
    const y = queenMarkCenter(l, queen, 1).y;
    out.push(markAt(1, "PRESS", "OPEN", tileCX(l, queen.col), y, l, 41));
  } else if (gesture === "hold" && q.openBeat !== -1) {
    const y = queenMarkCenter(l, queen, 1).y;
    out.push(markAt(1, "HOLD", "OPEN", tileCX(l, queen.col), y, l, 42));
  }
  if (q.openBeat !== -1) {
    out.push(markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 38));
  }
  if (queen.color !== null) {
    const mark = queenMarkCenter(l, queen, q.weakSide);
    out.push(markAt(2, "PRESS", "FIRE", mark.x, mark.y, l, 39));
  }
  if (torch !== undefined) {
    const at = creatureCenter(l, world, torch, beatPhase);
    out.push(markAt(1, "PRESS", "GUARD", at.x, at.y, l, 40));
  }
  return out;
}
