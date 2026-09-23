import {
  CURTAIN_COLS,
  type CurtainState,
  carryIsReady,
  curtainBody,
  curtainCoreBare,
  occupiesCol,
  type QueenState,
  queenGesture,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { creatureCenter } from "./creature-place.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { queenMarkCenter } from "./queen-figure.js";

/**
 * **What THE CURTAIN and BULB QUEEN are asking for**, read off their own state
 * and turned into at most one word each.
 *
 * THE GORGE's reading was the first one here and left on 19 September 2026,
 * for `boss-cue-read-n.ts`, when the column the pilot is owed went into it and
 * it grew past what this file has room for.
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
 * THE CURTAIN. Three words, and the third is the column the other two are
 * spent in.
 *
 * It shipped with `SHOVE` and `FIRE` and no column at all, which is THE
 * GORGE's defect of the same morning (`boss-cue-read-n.ts`): `curtainStruck`
 * is a no-op unless the shot leaves the top of the **core's own column**, and
 * a bolt only takes a lobe off in the column the fabric is struck in
 * (`curtainHemStruck`), so both of the shipped words named a gesture and
 * neither named the lane it lands in. The pilot's whole job is that lane and
 * his band said nothing about it — it is the guide's third step for him, in
 * as many words: *put the cannon in the core's column*.
 *
 * `MOVE` stands on the cannon and is his, and which column it is for depends
 * on what the fight is asking:
 *
 * - **While the core is bare**, its own column, because that is the only lane
 *   a hit comes off it in and the fabric rolls back over it
 *   `curtainRerollBeats` after the last hand leaves. Her `FIRE` waits behind
 *   it, THE CANDLE's pairing: off the column she is told nothing rather than
 *   told to fire up a lane the core cannot be reached in.
 * - **While it is covered**, a **soft** lobe's column. The hem is the health
 *   and a bolt into a soft lobe is what takes it (`curtainHemStruck`), and
 *   *which* lobes are soft is the pilot's picture alone (`showsCurtainSoft`)
 *   — so the word may stand on his own ship, where he is already reading
 *   them, and on her screen there is no mark and no word for the hem at all.
 *   That is BULB QUEEN's arrangement: the seat that cannot see the difference
 *   is told nothing and has to be told, which is the sentence the fight is
 *   made of.
 *
 * `SHOVE` is **either seat's**, because the carry is (`grip-push.ts`): a
 * thumb on the fabric moves it whoever it belongs to, and the frame stands on
 * the sheet, which both screens are drawn. It is silent while the body is in
 * the beat of quiet a carry costs (`carryIsReady`), so the word appears only
 * on a beat a hand can actually spend. It stands **behind** his column, since
 * the cannon and the fabric are different thumbs: while he is lining up the
 * hem she is told to shove, and the pair spends both hands on the same beat.
 *
 * `FIRE` is the navigator's, and it stands on the core — which is *her*
 * picture and not his (`showsCurtainShadow`). On the pilot's screen, where
 * the core is only a suspicion, there is no mark and no word.
 *
 * `LIFT` is the pilot's, and it stands where `SHOVE` stood, on the sheet's
 * middle: while the rail is jammed the shove is refused whole
 * (`curtain-shove.ts`) and the hem carried *up* is the only way back to the
 * core, so the one word the fabric wears changes rather than a second one
 * joining it. It is on the sheet and not on the core's column because the
 * handle is the whole hem — the gap opens over the core wherever the core is,
 * and a mark on that column would hand the pilot the half of the fight that
 * is hers.
 *
 * **One word per state, and never two on the same thumb**: `SHOVE` while it
 * hangs, `LIFT` while it is pinned, `FIRE` once the core is bare, and nothing
 * once it is out. Short words, because the two people reading them may not
 * share a language.
 *
 * **Three silences.** The core's **colour**, which is hers alone and the one
 * thing she has to say out loud — the wrong colour is answered with a rock
 * down the column at once (`curtainStruck`), and a field that named it would
 * be the whole conversation answered. The **hem** on her screen, above. And
 * nothing in `out`, where the core is going and the wave is held two beats so
 * it cannot end on the same one.
 */
export function curtainCues(l: Layout, world: World, c: CurtainState): readonly BossCue[] {
  if (c.phase === "out") return [];
  const y = tileCY(l, world.cfg.curtainRow);
  const at = (col: number) => markAt(1, "CARRY", "MOVE", tileCX(l, col), l.hullY, l, 43);
  if (curtainCoreBare(world, c)) {
    if (world.cannonCol !== c.coreCol) return [at(world.cannonCol)];
    return [markAt(2, "PRESS", "FIRE", tileCX(l, c.coreCol), y, l, 35)];
  }
  const body = curtainBody(world, c);
  if (body === undefined) return [];
  const out: BossCue[] = [];
  if (c.soft.length > 0 && !c.soft.some((i) => body.col + i === world.cannonCol)) {
    out.push(at(world.cannonCol));
  }
  const mid = tileCX(l, body.col + (CURTAIN_COLS - 1) / 2);
  if (c.phase === "pinned") {
    // The rail is jammed and no shove will move it: the word on the sheet is
    // the hem, carried up and held until the gap over the core opens.
    out.push(markAt(1, "CARRY", "LIFT", mid, y, l, 37, 2));
    return out;
  }
  if (carryIsReady(world, body)) {
    out.push(markAt(null, "CARRY", "SHOVE", mid, y, l, 36, 2));
  }
  return out;
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
 * the pair to stop reading words. `SHIELD` rides the torch down and is the
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
    out.push(markAt(1, "PRESS", "SHIELD", at.x, at.y, l, 40));
  }
  return out;
}
