import {
  type Creature,
  gripBrakes,
  gumIsFlung,
  handMeans,
  isWardable,
  occupiesCol,
  type ThroatState,
  throatHolds,
  throatMouthRow,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { creatureCenter } from "./creature-place.js";
import { type Layout, tileCX } from "./layout.js";

/**
 * **What THE THROAT is asking for** — page eleven of the readings, and its own
 * page for THE UNDERTOW's reason twice over: the fight has three moments and
 * `boss-cue-read-c.ts` was at its 250-line limit with one of them in it.
 *
 * It said `FLING` on any gum on the field, from the beat the body arrived to
 * the beat a hand let go of it, in every phase including the one where nothing
 * can be hurt at all. **A fling only ever chokes a ring from the mouth's own
 * row**: `gumSwiped` flies a gum level along the row it was on when the thumb
 * lifted (`gum.ts`), and `throatChoked` refuses one that arrives on any other
 * (`throat-step.ts`). So the old word stood for twenty beats and meant
 * something on one of them, which is a field that has taught the pair to stop
 * reading it.
 *
 * **The other two moments are the boss.** This is the one fight answered by
 * *giving* rather than taking, and what it costs to forget that is a ring back
 * — every body the mouth swallows re-tightens one (`throatFed`). Both of those
 * moments were silent: the body standing in the mouth with one inhale to live,
 * and the body climbing the gullet towards it.
 *
 * **The seats come out of the simulation's own sentence** — *a rock in the
 * mouth's column is his to brake, a creature is hers to shoot*
 * (`throat-pull.ts`) — and the reading calls the two rules that sentence is
 * made of rather than writing either out again: `isWardable` for whether a
 * shot answers a body at all, `handMeans` for whether a hand on it is a brake.
 *
 * **And the column is his even when the trigger is hers.** The colour buttons
 * sit on player 2's band and fire straight up the column *player 1's* carriage
 * is standing in, so a living body in the mouth is `FIRE` on her screen when
 * he is under it and `MOVE` on his when he is not — THE UNDERTOW's pairing
 * exactly, one gesture across two seats (`boss-cue-read-j.ts`).
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
 * Whether a hand laid on this body would drag at its fall, on either seat.
 *
 * `handMeans` and not a kind list, which is the rule this file is held to
 * rather than a copy of it: a brake is the answer to a rock and to nothing
 * else, an aim is the pilot's alone and drags at nothing, and the day a kind
 * changes sides the cue changes with it (`hand.ts`). Both seats are asked
 * because the cue's seat is `null` — the carry is either thumb's, which is
 * #34's third answer and a real one.
 */
function braking(kind: Creature["kind"]): boolean {
  return handMeans(kind, 1) === "brake" && handMeans(kind, 2) === "brake";
}

/**
 * **A body the mouth is about to swallow, said to whichever seat can answer
 * it this beat.**
 *
 * `FIRE` is hers and the column is his: a bolt leaves the cannon's own column
 * (`fire.ts`), so a trigger pulled while the carriage is somewhere else is a
 * shot up an empty lane. `occupiesCol` rather than two columns compared,
 * because a body wider than a tile is one the shot reaches from either of them
 * and that is the simulation's own test for it (`span.ts`).
 *
 * The `MOVE` half stands on the cannon and never on the mouth, which is #34's
 * second rule doing its whole job here: the gullet is drawn on both screens
 * (`throat-draw.ts`), and a frame around its mouth saying `MOVE` would be the
 * field answering *which column* — the one sentence this fight is made of.
 */
function shot(
  l: Layout,
  world: World,
  c: Creature,
  at: { x: number; y: number },
  seed: number,
): BossCue {
  if (occupiesCol(c, world.cannonCol)) return markAt(2, "PRESS", "FIRE", at.x, at.y, l, seed);
  return markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, seed);
}

/**
 * THE THROAT. Three moments, in the order they cost something.
 *
 * **Nothing at all while it everts.** The tube is turning through its own
 * mouth, `throatChoked` refuses, the inhale has stopped and the hold is let go
 * of (`throat-pull.ts`): every rule that could make a thumb worth anything is
 * off, so a word there would ask for a gesture the simulation has already
 * decided to ignore. The eversion is THE SLOW's own payoff and nobody presses
 * anything during it (`docs/decisions.md` #33).
 *
 * **The fling first, because it is the only one that expires.** A gum falls a
 * row a beat and the row it is on is the line it will fly along, so the beat
 * it crosses the mouth's row is the whole of the pilot's window; the cannon
 * can be moved next beat and a braked rock stays braked. It says nothing about
 * *which way* or *how far*, which is the arithmetic sentence the pair has to
 * say out loud — a gum crosses `gumFlingCols` a beat and the mouth steps its
 * own stride, and neither number is the field's to give.
 *
 * **Then the body with one inhale to live.** The swallow takes whatever is
 * standing in the mouth on an inhale beat, and the lift hauls a held body up
 * into it *after* the swallow — so a body arriving in the mouth stands there
 * for a whole inhale before it goes down (`throat-step.ts`). That window is
 * what this word is: it opens the beat the body arrives and shuts the beat the
 * ring comes back.
 *
 * **A rock standing in the mouth is told nothing**, and that is the honest
 * answer rather than an omission. A shot at a warded body leaves a crater and
 * not a kill (`isWardable`), a hand on it drags at a fall that is no longer
 * happening, and the mouth has it. What the pair is owed about that rock is
 * the word below, one row lower and one inhale earlier.
 *
 * **And the climb, which is the one thing with time in it.** A rock the throat
 * has hold of steps a row an inhale, and a braking hand has every one of those
 * beats to arrive — THE DRAG and not THE SLOW, which is the design's own
 * choice here (`throat-pull.ts`). Silent once a thumb is on it: `gripBrakes`
 * is already counting, and a word over a body that is being answered teaches
 * the pair to stop reading the words.
 */
export function throatCues(
  l: Layout,
  world: World,
  b: ThroatState,
  beatPhase: number,
): readonly BossCue[] {
  if (b.phase === "everts") return [];
  const mouth = throatMouthRow(world.cfg);
  const flings: BossCue[] = [];
  const standing: BossCue[] = [];
  const climbing: BossCue[] = [];
  for (const c of world.creatures) {
    if (c.kind === "gum" && !gumIsFlung(c) && c.row === mouth) {
      const at = creatureCenter(l, world, c, beatPhase);
      flings.push(markAt(1, "CARRY", "FLING", at.x, at.y, l, 51));
      continue;
    }
    // `throatHolds` and not a column test written out here: the body the fall
    // loop refused to drop, the body the mouth takes and the body this reading
    // speaks about are one rule, and a fourth copy of it would be the one that
    // disagreed (`throat-pull.ts`).
    if (!throatHolds(world, c)) continue;
    if (c.row === mouth) {
      if (isWardable(c.kind)) continue;
      standing.push(shot(l, world, c, creatureCenter(l, world, c, beatPhase), 52));
      continue;
    }
    if (!braking(c.kind) || gripBrakes(world, c) > 0) continue;
    const at = creatureCenter(l, world, c, beatPhase);
    climbing.push(markAt(null, "HOLD", "BRAKE", at.x, at.y, l, 53));
  }
  return [...flings, ...standing, ...climbing];
}
