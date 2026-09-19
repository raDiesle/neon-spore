import {
  type DiastoleState,
  diastoleBridgeCol,
  diastoleChamberCol,
  diastoleClamped,
  diastoleClampHolds,
  type LeadState,
  leadPassing,
  leadStill,
  type ScuttleState,
  scuttleShootable,
  scuttleSocketCol,
  scuttleWinding,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { diastoleY } from "./diastole-draw.js";
import { type Layout, tileCX } from "./layout.js";
import { leadRidgeY } from "./lead-shape.js";
import { scuttleLockBox } from "./scuttle-draw.js";
import { scuttleRowY } from "./scuttle-shape.js";

/**
 * **What THE LEAD, THE SCUTTLE and THE DIASTOLE are asking for**
 * — page three of the readings, on the seam the two before it draw. THE THROAT
 * was a fifth here until its fight was read whole and outgrew a paragraph, and
 * THE ORRERY a sixth for the same reason a day later; they have pages eleven
 * and twelve to themselves (`boss-cue-read-k.ts`, `boss-cue-read-l.ts`).
 *
 * **THE LEDGER was the first here and has gone** to page fifteen
 * (`boss-cue-read-o.ts`), on the day its reading grew the movement before the
 * shot: the column the seam runs down, which nothing on the field had ever
 * named. Three are left.
 *
 * These three are the older half of the choreographed page and the half whose
 * whole difficulty is a **number the pair says out loud**: which beat the gaps
 * line up, where the cord will root next, where the body will be when the shot
 * gets there. So the rule that decides almost every line below is #34's third:
 * **it says the verb and never the answer.**
 *
 * That is why two of them are quieter than their fights are busy. THE DIASTOLE
 * says nothing about either count. THE LEAD says nothing about where the body
 * will be. What each of them is given instead is
 * the moment its **verb changes** and nothing on the panel says so: the
 * trigger stops working and only the beam lands. A pair that has learned the
 * fight needs that sentence once and never needs to be told the number.
 */

/** THE CHOIR's frame, in tiles, and the lift a mark takes over a hull line. */
const HALF_W = 0.72;
const HALF_H = 0.66;

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
  return { seat, kind, word, x, y, halfW: l.tile * HALF_W * wide, halfH: l.tile * HALF_H, seed };
}

/**
 * THE LEAD. **Silent for the whole of the fight it is named for**, and both of
 * its words are about the last movement.
 *
 * *Where it will be* is a number the pair computes out of her column and his
 * lean, and a cue anywhere near it would be the arithmetic done for them. This
 * boss's split is the strictest in the game: the pilot is shown the lean and
 * **never** the column, the navigator the column and never the lean
 * (`showsLeadLean`, `showsLeadCol`). So there is no `MOVE` here and there
 * cannot be one — the word four of these readings give the pilot goes out the
 * beat he arrives, and on this boss its *absence* would tell him the column he
 * is not shown. Every other reading's `MOVE` stands on a column the game is
 * already drawing him.
 *
 * What is left is the two moments the trigger **stops working**, and both are
 * hers, because the presses are hers (`content/src/controls.ts`).
 *
 * - **`STILL`, while it stands dead.** At one segment the body stops where it
 *   was hit for `leadStillBeats`, the shots in the air are thrown away, and
 *   from then until the pass *nothing touches it at all*: `leadStruck` refuses
 *   a bolt and a beam up any column is the plating's answer
 *   (`sim/lead-shot.ts`). Four beats of a trigger that has quietly stopped
 *   working, which is this boss's own sentence and was true of this boss.
 *   `STILL` is the kind and the word, THE STARE's arrangement, so the screen
 *   says one thing.
 * - **`BURN`, on the pass.** It runs for the farther wall at `leadPassCols` a
 *   beat and **only the beam standing in its column** ends it; a pass that
 *   reaches the wall is another still and a pass back.
 *
 * **The mark stands on the body, and only she is shown the body.** The stalk's
 * foot is drawn at `s.col` on her screen and at the middle of the field on his
 * (`lead-shape.ts`), so a seat-2 cue at `tileCX(l, s.col)` names the thing she
 * is already looking at and `cueSeen` keeps it off his glass.
 *
 * **And `STILL` hands her nothing she has not got.** Standing dead is drawn to
 * both seats — the stalk goes upright, the mound changes and the lock dims to
 * half (`lead-draw.ts`, and the angle is nought whatever the role) — so the
 * word adds the verb and no reading. What it does *not* say is that the pilot
 * has four beats of work in there: on the last of them the stalk leans the way
 * the pass will go (`settleLean`, `leadPassDir`), which is his picture, his to
 * say, and the guide's to explain.
 */
export function leadCues(l: Layout, _world: World, s: LeadState): readonly BossCue[] {
  if (leadPassing(s)) {
    return [markAt(2, "HOLD", "BURN", tileCX(l, s.col), leadRidgeY(l).mid, l, 54)];
  }
  if (!leadStill(s)) return [];
  return [markAt(2, "STILL", "STILL", tileCX(l, s.col), leadRidgeY(l).mid, l, 95)];
}

/**
 * THE SCUTTLE. A boss racing the pair to its own death, so both of its words
 * are about **the window**, never about which socket: the live part is the
 * navigator's own picture (`showsScuttleLive`) and it is the only thing a shot
 * can strike, so a mark on it says *now* and nothing she was not already shown.
 *
 * `BURN` replaces it for the last part, which is not thrown at all — the frame
 * winds up, and only the beam standing in that column before the throw ends
 * the fight. The verb changing is the whole of what the cue is for.
 */
export function scuttleCues(l: Layout, world: World, s: ScuttleState): readonly BossCue[] {
  if (s.downBeat >= 0) return [];
  const cfg = world.cfg;
  if (scuttleWinding(s)) {
    const i = s.parts.findIndex((p) => p !== null);
    if (i < 0) return [];
    return [
      markAt(2, "HOLD", "BURN", tileCX(l, scuttleSocketCol(cfg, i)), scuttleRowY(l, cfg, i), l, 55),
    ];
  }
  if (!scuttleShootable(s)) return [];
  // **No frame of its own.** Her screen already locks the column the next
  // throw lands in (`scuttle-draw.ts`), which is the live part's own column,
  // so the cue borrows that box and adds the one thing it does not say.
  const box = scuttleLockBox(l, cfg, s);
  if (box === null) return [];
  return [{ seat: 2, kind: "PRESS", word: "FIRE", ...box, seed: 56, framed: false }];
}

/**
 * THE DIASTOLE. Two counts, one each, and neither is ever cued — that is the
 * boss, and `diastole-bridge.ts` already refuses to say when the coincidence
 * is for the same reason.
 *
 * What is cued is the sentence the fight turns on: from the beat the right
 * chamber wakes, **a single-chamber hit stops landing** and only the beam in
 * the bridge's column takes anything at all. The bridge is the one part of
 * this body both screens read the same, so the mark is on it, and the word is
 * hers because the lance is filled by holding a colour.
 *
 * **Alone, the two words follow the thumb**, which is the half this reading
 * was missing until 18 September 2026: it wrote both of them for the whole of
 * the phase, and for most of the phase neither was true.
 *
 * - No thumb on the chamber: `HOLD` / `CLAMP` on the ring, his — the beat now
 *   has to be held as well as found (`diastole-clamp.ts`) — and **nothing at
 *   all to her**. The beam lands only under the clamp (`diastoleOpen`), so a
 *   word over the bridge before there is one is a word over a lance that is
 *   refusing, which is the objection THE MAZE's reading makes about a handle
 *   the ship has taken away.
 * - The clamp on and its window open: `HOLD` / `BURN` on the bridge, hers, and
 *   **nothing to him**. What the fight wants of his thumb then is *let go
 *   before the dial closes* — a clamp held past its window spasms the chamber
 *   — so `HOLD` would be the field asking for the failure, and the ring's own
 *   dial is the whole of what is left to say (`handle-draw.ts`).
 * - The window lapsed with the thumb still down: nothing on either screen. He
 *   is late, the dial has closed, and the next thing the round does is the
 *   spasm.
 *
 * It says *where* and *what* and never *when* — the when is the navigator's to
 * say, in both phases. A spasm cues nothing: there is nothing to hold for
 * eight beats, and the chamber's shudder is the whole of the announcement.
 */
export function diastoleCues(l: Layout, world: World, b: DiastoleState): readonly BossCue[] {
  if (b.phase !== "two" && b.phase !== "alone") return [];
  const y = diastoleY(l);
  const burn = markAt(2, "HOLD", "BURN", tileCX(l, diastoleBridgeCol(world.cfg)), y, l, 57);
  if (b.phase !== "alone") return [burn];
  if (!diastoleClamped(b)) {
    return [markAt(1, "HOLD", "CLAMP", tileCX(l, diastoleChamberCol(world.cfg, 1)), y, l, 79)];
  }
  return diastoleClampHolds(b, world.beat) ? [burn] : [];
}
