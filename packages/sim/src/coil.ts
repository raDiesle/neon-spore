import { markMoment } from "./balance.js";
import { coilCharged, coilDue, coilHeading, coilIsDomed } from "./coil-state.js";
import { hullRow, type SimConfig } from "./config.js";
import { crossField } from "./cross.js";
import { guardArmed } from "./hull-guard.js";
import { nextInt } from "./rng.js";
import { occupiesCol, spanOf } from "./span.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE COIL: a rock sitting inside a dome of its own, crossing the field from
 * the right wall to the left instead of falling — and the first body in this
 * game whose answer **takes every other one of its kind with it**.
 *
 * THE CLASP is the shape it is built on and its own doc says to expect more:
 * the kind *is* the state, the ward opens it, and what is left is a different
 * creature falling. Everything up to there is that creature, said about a rock
 * instead of a body. Two things are new.
 *
 * **It travels, and it travels sideways.** It comes in at the right wall and
 * crosses `coilCols` columns to the left every beat, sinking `coilDropRows` at
 * each wall it turns at, so it works its way down the field in flights rather
 * than in a lane. That is deliberately *not* THE CAROM's problem: a carom is a
 * lead nobody can be under, and this one is a lane everybody can be under if
 * they get there first. The dome is answered wherever it happens to be when
 * the trigger arrives — a shield is a column and not a plate on one row
 * (`breakClaspsInColumn` says the same) — so what the pair agrees is *stand in
 * four and hold*, and then they both watch it come true.
 *
 * **And a dome does not go out quietly.** The charge it was holding jumps to
 * one other coil still standing, chosen from the seeded stream, and
 * `coilJumpBeats` later that one comes open and throws the charge on again —
 * until there is nothing left with a dome on it. So one ward opens the whole
 * field, one link at a time, and every link is a rock at a torch's speed
 * coming down a column nobody picked.
 *
 * That is the creature: **the pair does not answer an arrival, they answer an
 * order**. Player 1 is the only seat the bolt is drawn on (`render/coil-jump.ts`),
 * player 2 is the only seat that can move the dome, and between the charge
 * landing and the rock arriving there are four beats — one call, no sentence.
 * Which is why the wave it arrives on is the one where the dome comes up by
 * itself: with the timing taken away by the fault, what is left is the
 * geography and the order, and that is all this creature has ever been about.
 *
 * **What it becomes is a `torch` and not a fifth tier.** The owner named the
 * speed — *"it falls down fast like torch"* — and a torch is that speed
 * already, called rather than restated (`fallTilesPerBeat`). The width is
 * written down at the break for `caromStruck`'s reason: a coil is one tile and
 * a torch is two, so a rock that inherited its new kind's width would be twice
 * the thing the pair have been watching, and the dome would have to cover a
 * column that did not exist a tick earlier.
 */

/**
 * One beat of a coil, in place of the fall every other body takes.
 *
 * The charge is read first and it replaces the crossing rather than sitting
 * beside it: the beat a dome comes open is the beat the rock inside it is
 * standing still being uncovered, and a body that both opened and crossed
 * would be freed two lanes from where the pair watched it happen.
 *
 * Deliberately not through `grippedFallTiles` — a coil refuses a hand
 * (`isGrippable`), so there is no hold here for a brake to scale, and the
 * torch it becomes is grippable again the instant the dome is off.
 */
export function stepCoil(world: World, c: Creature): void {
  const cfg = world.cfg;
  if (coilDue(cfg, world, c)) {
    popCoil(world, c, false);
    return;
  }
  const step = crossField(cfg.cols, c.col, spanOf(c), coilHeading(c), cfg.coilCols);
  c.col = step.col;
  c.coilDir = step.dir;
  // The wall is the only place it sinks. A body that dropped every beat would
  // be a carom with a dome on it, and the pair would never have the beats they
  // need to agree on a column and then stand in it.
  if (step.turned) c.row = Math.min(c.row + cfg.coilDropRows, hullRow(cfg));
}

/**
 * The dome coming off one, and the charge going on to the next.
 *
 * `ward` says which of the two ways it happened, and it is on the event rather
 * than worked out by render for one reason: the ward's own bolts come *up out
 * of the hull* in the shield's column (`render/clasp-strike.ts` draws exactly
 * that for a clasp), and a chained one's come from the dome that just failed.
 * Two pictures of two different causes, and nothing downstream can tell them
 * apart from a column and a row.
 */
function popCoil(world: World, c: Creature, ward: boolean): void {
  const col = c.col;
  const row = c.row;
  // The width, written down before the kind changes — `caromStruck`'s line and
  // its reason. `spanOf` answers one for a coil and two for a torch, so a rock
  // that inherited the fallback would be twice the body the pair has been
  // watching cross the field.
  const span = spanOf(c);
  c.kind = "torch";
  c.span = span;
  // **And it runs for the far wall.** The rock does not fall out of the dome
  // where the dome stood: it is at the wall furthest from the plate on the
  // same beat, and it comes down there (`escapeCol`). That is what makes
  // opening a dome a *price* rather than a move — the plate that opened it is
  // by construction the plate least able to catch what came out — and it is
  // the whole reason a pair now talks about keeping the shield *out* of a
  // coil's column.
  //
  // `fromCol` goes with it so nothing glides: a body drawn crossing eleven
  // columns in one beat is a carom, and a carom is a lead the pair reads a
  // path off. This one has no path. It is at the wall, and the only picture of
  // where it came from is the dome bursting where it stood
  // (`render/effects-spark.ts` places that burst from the event's own column).
  c.col = escapeCol(world);
  c.fromCol = c.col;
  // It has stopped crossing and it is no longer holding a charge, so it holds
  // neither field. Cleared for `caromStruck`'s reason: the fingerprint of a
  // rock has to be the fingerprint of a rock whatever made it.
  c.coilDir = undefined;
  c.coilLit = undefined;
  markMoment(world, true);
  world.score += world.cfg.scoreCoilBreak;
  world.events.push({ type: "coilBreak", id: c.id, col, row, ward });
  chargeNextCoil(world, col, row);
}

/**
 * The charge leaving a failed dome for another one still standing.
 *
 * **One, and rolled.** One because the picture the owner asked for is a bolt
 * going *to the next one* and then on again from there — a fan out to every
 * coil at once would open the field on a single beat and there would be no
 * order left for the pair to say out loud. Rolled because the order is the
 * whole of what player 1 is holding and player 2 is not: nearest-first would
 * be on both screens by arithmetic, and a split either seat can work out is a
 * split that stops either of them talking.
 *
 * A coil the charge has already been sent to is skipped rather than re-lit, so
 * a chain can never turn back on itself and stall; when nothing is left free,
 * the last dome to open is the end of it.
 */
function chargeNextCoil(world: World, col: number, row: number): void {
  const free = world.creatures.filter((c) => coilIsDomed(c) && !coilCharged(c));
  if (free.length === 0) return;
  const next = free[nextInt(world.rng, free.length)]!;
  next.coilLit = world.beat;
  world.events.push({ type: "coilJump", id: next.id, col, row });
}

/**
 * A shot met a coil that is still wearing its dome. `claspStruck`'s rule and
 * its whole argument: nothing a shot carries gets through a dome, so there is
 * no chipping branch and no colour test — and it is deliberately not scored as
 * a colour miss, because a coil carries no colour at all and the mistake was
 * the pair's order of operations rather than player 2's choice.
 *
 * It lives here rather than in `bullet-hit.ts` for that function's reason: it
 * is a rule about this creature, and that file is at its length limit.
 */
export function coilStruck(world: World, hit: Creature): void {
  world.events.push({ type: "reject", col: hit.col, row: hit.row });
}

/**
 * Break every dome the standing shield is under, and start a chain from each.
 *
 * **A state and not an edge, which is the whole of it.** This used to hang off
 * `armShield`, so a dome only came off on the tick the trigger was pressed —
 * and a plate already lit that a coil *crossed into*, or a plate carried under
 * a coil while the window was still open, did nothing at all. Both are the
 * pair doing exactly what they said out loud and watching nothing happen,
 * which is the defect the owner reported. So it is asked every tick instead,
 * of the window rather than of the press (`guardArmed`), and the dome comes
 * off on the first tick the two are in the same column whichever of them
 * arrived there second.
 *
 * `step` calls it and nothing else does. It is deliberately **not** counted in
 * `world.guard`: those three numbers are the rock ledger the balance sheet
 * reads as "rocks that reached the shield, and how many you turned", and a
 * coil never reaches anything. The torch it leaves behind is counted there
 * like any other rock, one beat later.
 *
 * The loop reads the array while `popCoil` writes to it, which is safe and
 * meant: nothing is added or removed, and a coil the chain lights *inside this
 * column* is opened by the ward on the same pass rather than waiting three
 * beats for a charge that had nowhere better to go.
 */
export function wardCoils(world: World): void {
  if (!guardArmed(world)) return;
  for (const c of world.creatures) {
    if (!coilIsDomed(c)) continue;
    if (!occupiesCol(c, world.shieldCol)) continue;
    popCoil(world, c, true);
  }
}

/**
 * The wall a freed rock runs for: the one furthest from the plate.
 *
 * Read off which half of the field the shield is standing in rather than by
 * measuring both distances and comparing them — the two are the same number
 * and one of them needs a tie-break written down. A plate at dead centre is
 * equally far from either wall, and `<` sends it to the left one, which is a
 * rule rather than whichever way a `>=` happened to be spelled.
 *
 * It is the plate's column and not the rock's on purpose. What the pair is
 * being charged for is the ward, so the punishment has to be measured from the
 * thing that did it: a rock that ran to the wall it was already heading away
 * from would sometimes land beside the shield by luck, and a price that is
 * sometimes free is not one anybody plans around.
 */
function escapeCol(world: World): number {
  const cols = world.cfg.cols;
  return world.shieldCol * 2 < cols - 1 ? cols - 1 : 0;
}

/**
 * What a whole one costs the hull when it reaches it. `damageCoil` rather than
 * `damageCreature`, and `caromImpactDamage`'s reason word for word: what
 * arrived is the rock it always was, and the shield was never offered it.
 */
export function coilImpactDamage(cfg: SimConfig): number {
  return cfg.damageCoil;
}
