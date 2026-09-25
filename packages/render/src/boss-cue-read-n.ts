import {
  type GorgeState,
  gorgeFull,
  gorgeNearestFull,
  gorgePhase,
  priming,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { gorgeIntakeY } from "./gorge-draw.js";
import { type Layout, tileCX } from "./layout.js";

/**
 * **What THE GORGE is asking for** — page fourteen of the readings, and its
 * own page for page thirteen's reason: `boss-cue-read.ts` held three fights in
 * 199 lines of its 250, and this reading grew by half again when the column
 * went into it.
 *
 * It said `PIERCE` and `PINCH` over a full intake and `BURN` or `PRY` over the
 * mouth, which is every gesture the fight has and **not one word about the
 * column any of them has to be taken in**. A bolt and the beam both leave the
 * cannon's own column (`bullets.ts`), and `gorgeStruck` is a no-op outside it: a
 * pierce fired from anywhere else does not land, and the beam that ends the
 * fight only ends it *standing in the mouth's column*. So the pilot held a
 * whole fight with one word on his screen — `PINCH`, which stops a clock — and
 * nothing at all on the two moments the fight cannot be finished without him.
 * The opposite defect would be a word that walked him off the only column a
 * shot lands from; here there was no word at all.
 *
 * **`MOVE` stands on the cannon, and only where the column is not his own
 * choice.** That line is the whole of this reading's judgement. The fight is
 * *stop shooting, except at one column, in one colour*, and **which** column
 * is his to pick and say — he is the seat shown the bead tally under every
 * lobe (`showsGorgeTally`), so a word that sent him anywhere while an intake
 * was merely filling would be the field overruling the one decision this boss
 * exists to hand him. Twice, though, the column is not a choice at all:
 *
 * - **A full intake.** It is pierceable by any colour and it vents a torch
 *   down its own column `gorgeVentBeats` later (`gorge-step.ts`), so there is
 *   exactly one column worth a shot and a clock on it.
 * - **The mouth.** It is the unruptured intake nearest the centre, it does not
 *   move, and the beam in its colour standing in its column is the only thing
 *   that ends the fight (`gorge.ts`). THE ORRERY's `MOVE` is a park and THE
 *   CANDLE's is a chase; this one is a park with a clock nowhere near it.
 *
 * **And the navigator is told only what the cannon's own column can answer.**
 * THE CANDLE's pairing and THE THROAT's before it: one gesture across two
 * seats, so while the cannon is elsewhere she is told nothing rather than told
 * to `PIERCE` up a lane the shot cannot reach the intake from. It costs her
 * nothing — the ring she is shown stays on the lobe nearest full either way
 * (`gorge-draw.ts`) — and it keeps the word honest, which is that a cue names
 * a thing to do *now*.
 *
 * **Four silences, and each is a decision.**
 *
 * - **While it is being fed.** Nothing is owed and nothing is said: a word
 *   over a sack that wants to be left alone would be the boss asking for its
 *   own dinner, and the restraint is the fight.
 * - **The pry until the mouth is full, which shipped and comes out.** `PRY`
 *   stood the moment the beam began filling, whatever the mouth held, and on a
 *   mouth short of full it is a bead thrown away for nothing: `gorgeStruck`
 *   only ends the fight on `bullet.lance && gorgeFull`, and a pry nobody could
 *   spend clenches on the thumb at `gorgePryBeats` and spits a bead down its
 *   own column (`gorge-pry.ts`). The mouth fills itself a bead a spit and
 *   holds at full, so the window always comes; asking for it early only costs
 *   the pair the bead. `BURN` stands in the meantime, which is the honest word
 *   — a shot in the mouth's colour feeds it, so holding the trigger is both
 *   the wait and the work.
 * - **The spat body.** After `gorgeSpitRuptures` the sack returns a bead down
 *   its own column as a body of its colour, broken by its own colour like
 *   anything else on the field (`bosses.md` §11.23). It is a body, and no
 *   boss's reading cues an ordinary body — the wave's own arrivals are falling
 *   beside it, and a frame on one of them and not the others would say the
 *   sack's is the dangerous one when what is dangerous is that there are now
 *   two things to answer at once.
 * - **The torch a vent throws.** The pinch is the answer to it and the pinch
 *   is cued; a second word once the torch is already falling would be the
 *   field telling the pair what the thing coming at them is, which is the
 *   picture's job.
 *
 * Nothing at all in `out`: every bead it held is leaving and the boss stands
 * `gorgeOutBeats` only so the wave cannot end on the same beat.
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
 * THE GORGE. Four moments, ordered per seat by what expires first.
 *
 * On the pilot's screen the **pinch** outranks the **column**, because the
 * vent is the only clock in this fight that reaches the hull and his thumb
 * stops it where it stands — the cannon can follow a beat later, and while he
 * holds the intake it is not going anywhere (`gorge-hand.ts`). On hers the two
 * words cannot both be true: the pierce and the mouth are different columns,
 * and the cannon is in one of them.
 *
 * The mouth is on both screens once there is one (`drawLobe`), so a frame on
 * it hands nobody the other's half; the cannon is the pilot's own ship; and
 * the lobe the pinch stands on is one he is already reading a count under.
 */
export function gorgeCues(l: Layout, world: World, g: GorgeState): readonly BossCue[] {
  const cfg = world.cfg;
  if (gorgePhase(g, cfg) === "out") return [];
  const y = gorgeIntakeY(l, g, cfg);
  const out: BossCue[] = [];

  const near = gorgeNearestFull(g);
  const intake = near < 0 ? undefined : g.intakes[near];
  const full = intake !== undefined && gorgeFull(intake, cfg);
  const fullCol = g.col + near;
  if (full && g.pinch < 0) out.push(markAt(1, "HOLD", "PINCH", tileCX(l, fullCol), y, l, 76));

  // The columns a shot is owed in this beat. `MOVE` stands while the cannon is
  // in none of them, and never tells him to leave one he is already holding —
  // where the mouth and a full intake both want him, the pierce he can take
  // now outranks the beam he cannot, and his pinch above is holding the vent.
  const mouthCol = g.mouth >= 0 ? g.col + g.mouth : -1;
  const owed: number[] = [];
  if (mouthCol >= 0) owed.push(mouthCol);
  if (full) owed.push(fullCol);
  if (owed.length > 0 && !owed.includes(world.cannonCol)) {
    out.push(markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 77));
  }

  if (full && world.cannonCol === fullCol) {
    out.push(markAt(2, "PRESS", "PIERCE", tileCX(l, fullCol), y, l, 34));
  }
  const mouth = g.mouth < 0 ? undefined : g.intakes[g.mouth];
  if (mouth !== undefined && world.cannonCol === mouthCol) {
    const x = tileCX(l, mouthCol);
    if (gorgeFull(mouth, cfg) && g.pry < 0 && priming(world)) {
      out.push(markAt(2, "HOLD", "PRY", x, y, l, 75));
    } else {
      out.push(markAt(2, "HOLD", "BURN", x, y, l, 33));
    }
  }
  return out;
}
