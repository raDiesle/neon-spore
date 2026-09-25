import {
  type UndertowBreach,
  type UndertowState,
  undertowUnseated,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";

/**
 * **What THE UNDERTOW is asking for** — page ten of the readings, and its own
 * page for THE BATON's reason (`boss-cue-read-i.ts`): the fight says a word in
 * every one of its five phases, and a reading that covers all five outgrew the
 * share of `boss-cue-read-b.ts` it had. It shared that page with THE TASTER
 * and THE VANE until 18 September 2026, saying `MOVE` on the cannon and on the
 * plate and `OPEN` and `BURN` on a standing lobe, which is four of the moments
 * this fight has and not the fight.
 *
 * Every rule is `boss-cue.ts`'s, and the one that decides almost every line
 * below is the first: **a cue is drawn on the seat that can act.** This boss
 * is underneath the hull, and the three things that reach it each need a
 * different thumb — the maw and the beam both fire up the *cannon's* column
 * (`undertow-press.ts`, `lance-burn.ts`), which is the pilot's, while the lobe
 * is only burnt once the navigator's hold has filled the lance. So a word
 * asking for the burn is hers and a word asking for the column is his, on the
 * same lobe, one beat apart.
 *
 * **The words are the buttons' own since 25 September 2026**: the maw's is
 * `SUCK`, which is what its lobe in the band says (`content/controls.ts`),
 * and the held trigger's is `SHOOT` — the owner, *add help text during game
 * (one word) to tell what action i have to do e.g. "suck" or "shoot"*. They
 * said `OPEN` and `BURN`, the machine's words for what happens rather than
 * the player's for what the thumb does.
 */

/** THE CHOIR's frame, in tiles: the size of this mark wherever it stands. */
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
): BossCue {
  return { seat, kind, word, x, y, halfW: l.tile * HALF_W, halfH: l.tile * HALF_H, seed };
}

/**
 * **`MOVE`, on the cannon where it stands** — the pilot's, and the only thing
 * this reading ever says to him about a column.
 *
 * It is on the cannon and never on the place he is wanted, which is #34's
 * second rule doing its whole job here: the lobe is drawn on both screens and
 * a frame around it saying `MOVE` would be the field answering *which column*,
 * which is the one sentence the pair has to say out loud in a fight where
 * neither seat can see the other's carriage (`showsCannon`, `showsShield`).
 */
function moveCannon(l: Layout, world: World, seed: number): BossCue {
  return markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, seed);
}

/**
 * THE UNDERTOW. Five phases, and the field says something in every one of
 * them.
 *
 * **Nothing at all while he is unseated.** The floor came up under the cannon,
 * he did not slide off, and for `undertowUnseatedBeats` every verb of his that
 * reaches the ship is swallowed without a sound (`undertowUnseats`). There is
 * no thumb to ask for, so there is no word: this is rule one's own case, and
 * the reading said `MOVE` through all four beats of it until 18 September
 * 2026 — the one moment in the fight when moving is the one thing he cannot
 * do. What he is owed there is the picture, and `undertow-draw.ts` already
 * draws it on his screen alone.
 *
 * **The word he is owed instead comes a phase earlier**, while the floor is
 * still bowing under him: `seat` is the one push that is aimed rather than
 * drawn, and `undertowUnseatBeats` is how long he has (`undertow-step.ts`).
 * That is the moment the fight is asking for something, and it was silent.
 *
 * **And the ordinary bows are still silent, on purpose.** A plate bowing in
 * phases one, two and hard is a warning and not yet a question — the lobe
 * stands for `undertowStandBeats` afterwards and the maw reaches it through
 * all five — so a word there would be the field talking over a fight that has
 * not asked yet. The rehearsal teaches the early answer instead, which is what
 * a film is for (`content/src/scenes/the-undertow.ts`).
 */
export function undertowCues(
  l: Layout,
  world: World,
  u: UndertowState,
  skinY: SurfaceY,
): readonly BossCue[] {
  if (u.phase === "taken" || undertowUnseated(u, world.beat)) return [];
  const out: BossCue[] = [];
  for (const b of u.breaches) {
    if (b.stage === "bowing") bowing(out, l, world, u, b.col);
    else standing(out, l, world, u, b, skinY);
  }
  return out;
}

/** A plate on its way up: two of the five phases ask for the cannon here. */
function bowing(out: BossCue[], l: Layout, world: World, u: UndertowState, col: number): void {
  // The seat. Most urgent thing the fight ever says to him — everything else
  // costs a column of plating and this costs him the next four beats whole.
  if (u.phase === "seat" && col === world.cannonCol) out.unshift(moveCannon(l, world, 43));
  // The rise: the whole edge lifts for `undertowRiseBeats` before the last
  // lobe stands in the middle, and that lift is the time he has to be there.
  // Drawn on both screens rather than his alone (`undertow-draw.ts`), which is
  // the one bow either seat may be marked on — the mark is on his cannon
  // either way, so it is still only ever his to read.
  if (u.phase === "last" && col !== world.cannonCol) out.unshift(moveCannon(l, world, 45));
}

/**
 * A lobe standing: whose it is, and whether the seat that answers it can reach
 * it from where it is.
 *
 * **The last one is a hold and not a take** — `undertowTake` refuses in the
 * `last` phase and `undertow-step.ts` counts `undertowHoldBeats` of the maw
 * open under it instead — so the plate is nothing to it and the navigator is
 * told nothing about it. Her `MOVE` would be a thumb that changes no rule.
 */
function standing(
  out: BossCue[],
  l: Layout,
  world: World,
  u: UndertowState,
  b: UndertowBreach,
  skinY: SurfaceY,
): void {
  const x = tileCX(l, b.col);
  // On the skin the lobe is coming through, which is the place the word is
  // about. It stood `LOBE_LIFT` — 0.8 tiles — above it until 21 September
  // 2026, to keep the verb hung under the frame out of the plating; that is
  // `cueWordY`'s job for every boss now (`BossCue.wordFloor`), and a mark held
  // off the lobe once the word is safe is a frame pointing near the thing
  // rather than at it.
  const y = skinY(x);
  const under = world.cannonCol === b.col;
  if (u.phase === "last") {
    out.unshift(under ? markAt(1, "HOLD", "SUCK", x, y, l, 46) : moveCannon(l, world, 46));
    return;
  }
  // A tall lobe is the beam's and the maw would break on it (`undertow-press.ts`),
  // and the beam burns the cannon's column: her hold fills the lance, his
  // carriage decides what it burns. Two seats, one gesture.
  if (b.tall) {
    out.push(
      under ? markAt(2, "HOLD", "SHOOT", x, y, l, 44 + b.col) : moveCannon(l, world, 44 + b.col),
    );
    return;
  }
  // The shield standing on a lobe's own column keeps the maw off it
  // (`undertow-press.ts`), and nothing in the picture says so — the pilot
  // holds the maw open over a lobe that will not come in and neither of them
  // learns why. It is her thumb that moves the shield, so it is her word.
  //
  // His `SUCK` stands beside it rather than waiting for her: the maw is a
  // window and not a shot (`mawOpen`), the two words are one gesture between
  // two seats, and the beat she clears the column he is already open. That is
  // not the unseat's case above, where there is no beat of his at all.
  if (world.shieldCol === b.col) {
    out.push(markAt(2, "CARRY", "MOVE", tileCX(l, world.shieldCol), l.hullY, l, 49));
  }
  out.push(
    under ? markAt(1, "HOLD", "SUCK", x, y, l, 44 + b.col) : moveCannon(l, world, 44 + b.col),
  );
}
