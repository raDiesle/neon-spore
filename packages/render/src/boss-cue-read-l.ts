import {
  type OrreryState,
  orreryAdrift,
  orreryCoreCol,
  priming,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { type Layout, tileCX } from "./layout.js";
import { orreryRingCircle } from "./orrery-grab.js";
import { orreryCorePoint } from "./orrery-shape.js";

/**
 * **What THE ORRERY is asking for** — page twelve of the readings, and its own
 * page for the reason page eleven is: `boss-cue-read-c.ts` was at its 250-line
 * limit with one word of this fight in it, and the fight has more than one
 * (`boss-cue-read-k.ts`).
 *
 * It said `BURN` on the naked core and nothing anywhere else, which was honest
 * about the half of this boss the field may not touch and silent about the
 * half it may. **The beat is the boss.** Three rings, one gap each, the outer
 * true on both screens, the middle on his alone and the inner on hers
 * (`view-role-clocks.ts`): a word that lit on the beat every gap stands at the
 * bottom would be the only question this fight asks, answered. So
 * `orreryShaftOpen`, `orreryNextOpen` and `orreryGapSlot` are deliberately not
 * read in this file, and neither is `b.color` — that is #34's third rule
 * twice over, a count and a colour.
 *
 * **What was missing is the column**, and it is not the beat at all. A bolt
 * leaves the cannon's own column (`bullets.ts`) and so does the beam, and the
 * core hangs over exactly one — `orreryCoreCol`, the middle, for the whole
 * fight. So the pilot's entire job on the panel is *be there and stay there*,
 * through a phase that spends itself throwing rocks down every column but his
 * to pull him off it (`orrery-step.ts`), and nothing on his band said so: it
 * was the guide's first line, and the guide is what this brief takes down.
 *
 * **The mark stands on the cannon and never on the core.** That is #34's
 * second rule doing its job the way THE THROAT's `MOVE` does: the core is
 * drawn on both screens, and a frame round it saying `MOVE` would be the field
 * naming the one column — which the pair would then never need to be told, and
 * the guide's line would have been moved rather than retired. Where the thumb
 * goes is the cannon; where it is going is his to work out from a body he is
 * already looking at.
 *
 * **And the column is his even when the trigger is hers**, which is why the
 * `MOVE` returns alone. The beam stands in the cannon's column, so `BURN` on
 * her screen while his carriage is somewhere else is a word over a beam that
 * would burn an empty lane — THE THROAT's pairing exactly, one gesture across
 * two seats (`boss-cue-read-k.ts`).
 *
 * **Three silences, and each is a decision.**
 *
 * - **The rocks.** A broken ring sheds three organs and the core spits one
 *   every `orrerySpitBeats`, and not one of them is cued. They are ordinary
 *   meteors answered by the ordinary shield loop, and the two `SHIELD`
 *   precedents in this game both stand on a boss's own special body — BULB
 *   QUEEN's torch, THE LEDGER's bead. More than that: they never come down
 *   the core's column (`spit`, `organCol`), so what a rock asks of the pilot
 *   is *stay where you are while something falls beside you*, and a word
 *   pointing at it would be the field arguing against its own `MOVE`.
 * - **The hand on the ring, while the rings are turning.** The pilot can turn
 *   the outermost standing ring and bring an alignment forward
 *   (`orrery-hand.ts`), and there it is **offered rather than asked for**.
 *   When it is worth a turn is a function of where the gaps are, so a `TURN`
 *   that lit then would be the alignment said out loud; a `TURN` that stood
 *   whenever a ring was turnable would stand for the whole fight, which is
 *   the word the pair learns to stop reading. **`seized` is the third
 *   condition this file said it did not have**, and it is the state the
 *   §6.2 lane gave the boss for exactly that: a cracked ring is jammed, the
 *   shaft is shut until it is wound home, and there is then one thing to do
 *   and no beat to keep. So the word stands only there, and it names the
 *   gesture and nothing about where the gap is.
 *   **And a fourth, which is the hand's own doing.** The orbits share factors
 *   (`config-orrery.ts`) and a thumb writes an anchor, so one stray organ can
 *   leave the rings in a parity that never lines up again — six of the outer
 *   ring's eight positions do. `orreryAdrift` is that question asked over a
 *   full cycle, which is the horizon past which *not yet* and *never* are the
 *   same word. There `TURN` is not the alignment said out loud, because there
 *   is no alignment: it is the field saying the beat the pair is counting
 *   towards is not coming, and the only failure in this fight that patience
 *   makes worse. So the silence is still the rule and both breaks in it are
 *   states the pair cannot read off the rings themselves.
 * - **While the lance is filling.** `BURN` goes quiet the moment a colour is
 *   held, for `gripBrakes`' reason: a word over something already being
 *   answered teaches the pair to stop reading the words. What is left on her
 *   screen then is the prime's own charge, which is the readout the hold
 *   already has.
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
 * THE ORRERY. Four moments, and each is one word on one seat.
 *
 * **Nothing at all once it is out.** The lance has stood in the core, THE SLOW
 * is open for the whole of it and the boss is already beaten
 * (`orreryOutBeats`): a word there would ask for a gesture the simulation has
 * decided to ignore, which is THE THROAT's eversion again.
 *
 * **The column first, in every phase it has one**, because it is the only one
 * that can be wrong while the fight is still winnable and because everything
 * else in this reading is behind it. `rings` is where he learns to park, and
 * `spitting` is where the fight spends its second half trying to move him.
 *
 * **Then the beam, once every ring is off.** The core underneath takes nothing
 * but the lance (`orrery-shot.ts`) — an ordinary bolt is spent on it, and
 * nothing on the panel says the trigger has stopped working, which is THE
 * LEAD's sentence and THE SCUTTLE's. The verb changing is the whole of what
 * this word is for.
 */
export function orreryCues(l: Layout, world: World, b: OrreryState): readonly BossCue[] {
  if (b.phase === "out") return [];
  const cfg = world.cfg;
  // **A cracked ring first, ahead of the column.** Nothing a shot does counts
  // while the shaft is jammed (`orrery-shot.ts`), so the cannon's column can
  // wait the two detents out — and one word at a time is the whole reason
  // this state was worth adding. The mark stands on the grip, which is drawn
  // on his screen on every ring including the one he cannot read
  // (`showsOrreryGrip`), so #34's second rule holds on the ring the fight
  // ends on as well as the one it starts on.
  //
  // `OPEN` rather than a second `TURN` under the kind's own glyph, and it is
  // the word eight other readings already use: turning is what the thumb
  // does and opening is what it is for, and the gap coming to the bottom is
  // the shaft opening. It names no column, no colour and no count.
  if (b.phase === "seized") {
    const on = orreryRingCircle(l, cfg, b);
    return on === null ? [] : [markAt(1, "TURN", "OPEN", on.x, on.y, l, 57)];
  }
  // **And a parity with no alignment in it, ahead of the column for the same
  // reason.** The shaft cannot open on any beat from here, so a carriage in
  // the right lane is a carriage waiting for nothing — the thumb has to move
  // the rings before the column is worth a word.
  //
  // `TURN` under the turn glyph rather than `OPEN`, and the pair of them is
  // the distinction the fight turns on: `OPEN` is a gap two detents from the
  // bottom and a count that ends, `TURN` is a count that does not. One word
  // each, and neither says a slot, a colour or a beat.
  if (orreryAdrift(cfg, b, world.beat)) {
    const on = orreryRingCircle(l, cfg, b);
    return on === null ? [] : [markAt(1, "TURN", "TURN", on.x, on.y, l, 60)];
  }
  if (world.cannonCol !== orreryCoreCol(cfg)) {
    return [markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 59)];
  }
  if (b.phase !== "naked" || priming(world)) return [];
  const at = orreryCorePoint(l, cfg);
  return [markAt(2, "HOLD", "BURN", at.x, at.y, l, 58)];
}
