import type { CairnEntry } from "./entries.js";
import { removeCreatures } from "./field.js";
import { nextInt } from "./rng.js";
import { NO_SHELL } from "./shell.js";
import { CAIRN_COLS, clampSpanCol } from "./span.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE CAIRN: the boss that is taken apart rather than beaten.**
 *
 * Seven rocks stacked four, two and one, held in one outline five columns
 * wide, standing at `cairnRow` and never moving. Nothing either panel does
 * reaches it — a bolt goes past it to whatever is above (`shot-reach.ts`) and
 * the shield has nothing to say to a thing that is not falling. That is not a
 * new rule but the game's oldest one worn as a body: a rock cannot be shot,
 * and the first act teaches it.
 *
 * **It is dismantled by hand, into the game the pair already knows.** A grip
 * carried sideways across the pile — the ordinary gesture, the ordinary
 * `gripPushMilli` of travel, the ordinary beat of quiet after it
 * (`grip-push.ts`) — drags one unit out of the side the finger went, and what
 * comes away is a plain `meteor` falling a tile a beat in a lane like any
 * other. So every answer to this boss is a rock the navigator now has to be
 * under, and the whole fight is **rate**: the pile does not care how many are
 * already in the air, and a pair who empty it in four beats have four rocks
 * and one dome.
 *
 * **Waiting is a choice and the pile makes it for you.** A stack that has
 * stood `cairnShedBeats` without losing a unit lets one go itself, into a
 * column the seeded rng drew — and that column is drawn on **player 1's
 * screen alone** (`render/cairn-settle.ts`). So the seat that can see where
 * the next rock is coming from is the seat holding no shield, and the pair's
 * second sentence is a number said out loud, which is the same sentence THE
 * GHOST asks for and the plainest one this game has.
 *
 * The two ways a unit leaves are therefore the fight in one line: **pull it
 * and you choose an edge, wait and the pile chooses the middle.**
 *
 * `Creature` carries none of this. `CairnState` is the whole of it, for the
 * Warden's reason — one file owns a fight's state and nothing else writes it.
 */

/**
 * Everything THE CAIRN remembers between beats, which is four integers — and
 * three of them are the fight.
 *
 * `units` is how many rocks are still stacked, which is also the health bar
 * and also the silhouette: the pile is drawn out of this number, so what the
 * pair counts on the screen and what the simulation has left are the same
 * thing rather than two things that agree (`render/cairn.ts`).
 *
 * `leftBeat` and `settleCol` are the clock the pile keeps on the pair. One
 * says how long it has stood whole and the other where its own next rock is
 * going — drawn from the rng at the moment the clock restarts, so there is a
 * whole `cairnShedBeats` in which the announcement exists to be said out loud.
 * It is on player 1's screen and on nothing player 2 can see.
 *
 * Nothing is derived here that could be: how far a pull has come is the hand's
 * (`GripPush`), and which units are where in the stack is the picture's, from
 * `units` and the creature's own column. A pile that stored its own geometry
 * would be a second copy of a drawing.
 */
export interface CairnState {
  kind: "cairn";
  /** The id of the pile in `world.creatures`. */
  creatureId: number;
  /** Rocks still stacked. At nought the body is already gone. */
  units: number;
  /** The wave beat a unit last left it, either way. The shed clock counts from
   * here, so a pull buys patience as well as a lane. */
  leftBeat: number;
  /** The column the pile drops its own next rock into. Player 1's, and only
   * player 1's. */
  settleCol: number;
}

/**
 * THE CAIRN takes the field where it stands and never leaves it: dead centre,
 * at `cairnRow`, five columns wide. There is no starting column to author —
 * a pile placed off centre offers one long lane and one short one — so the
 * only thing a wave says about it is how many rocks are stacked.
 *
 * The shed clock starts at beat nought with a column already drawn, so the
 * first thing the pair sees is the pile and the one rock in it that is going
 * to come down whether they touch it or not. That is the fight stated before
 * a hand is put on anything, which is how every boss in this game opens.
 */
export function installCairn(world: World, entry: CairnEntry): CairnState {
  const id = world.nextId++;
  const col = Math.floor((world.cfg.cols - CAIRN_COLS) / 2);
  const body: Creature = {
    id,
    kind: "cairn",
    col,
    row: world.cfg.cairnRow,
    fromRow: world.cfg.cairnRow,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  };
  world.creatures.push(body);
  return {
    kind: "cairn",
    creatureId: id,
    units: entry.units ?? world.cfg.cairnUnits,
    leftBeat: 0,
    settleCol: pickSettle(world, body),
  };
}

/** The installed pile, or null when this wave has no cairn in it. Asked rather
 * than read off `world.boss` by hand: three callers want it and a tag test
 * written out three times is a tag test that drifts. */
export function cairnState(world: World): CairnState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "cairn" ? boss : null;
}

/**
 * The column the pile will drop its own next rock into.
 *
 * Drawn from the rng the moment the clock restarts rather than when it runs
 * out, and that is the whole of the tell: there is something to say for the
 * `cairnShedBeats` before it happens, which is what makes it an announcement
 * instead of a surprise. Every boss in this game is reactive but announced
 * (`docs/spec/bosses.md` 11.1).
 */
function pickSettle(world: World, body: Creature): number {
  // Any of the pile's columns a two-tile rock still fits in — four of the
  // five, the two a hand would have chosen among them. The pile is allowed
  // the same answers the pair has and two they do not.
  return body.col + nextInt(world.rng, CAIRN_COLS - 1);
}

/**
 * How many beats the pile has stood whole. What `cairnShedBeats` is measured
 * against, and what render/ fills the settling rock with.
 *
 * On `waveBeat` rather than `beat`, like every other clock a boss keeps: a
 * wave the pair lost and is playing again starts its pile's patience over.
 */
export function cairnWaited(world: World, b: CairnState): number {
  return world.waveBeat - b.leftBeat;
}

/**
 * One unit leaves the pile, wherever it was going.
 *
 * The rock takes the field at the pile's **own row**, in the column it came
 * out of, and falls from the next beat — the queen's torch exactly
 * (`spit` in `boss.ts`), and for her reason: what leaves a body is the thing
 * that was already there, not a second one grown beside it. From then on it is
 * an ordinary rock and nothing here knows anything more about it.
 *
 * The last unit takes the pile with it. There is no separate death: a boss
 * made of seven rocks is gone when the seventh is a rock, and the wave ends
 * the way every field wave ends, when the last of them has been warded.
 */
function letGo(world: World, body: Creature, b: CairnState, col: number): void {
  world.creatures.push({
    id: world.nextId++,
    kind: "meteor",
    // **The two-tile rock, which is the one the pile is stacked from.** A unit
    // is drawn at `rockRadius(l, 2)` and leaves at the same width, so nothing
    // shrinks on the way out — the whole fiction rests on the parts being
    // ordinary rocks before anything is pulled (`docs/spec/transfers-bosses.md`),
    // and a lump that halved as it came away would say the opposite.
    span: 2,
    col: clampSpanCol(col, world.cfg.cols, 2),
    row: body.row,
    fromRow: body.row,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  });
  b.units -= 1;
  b.leftBeat = world.waveBeat;
  b.settleCol = pickSettle(world, body);
  if (b.units <= 0) removeCreatures(world, [body.id]);
}

/**
 * A hand carried across the pile, and the unit that comes away with it.
 *
 * **The side is the choice.** Carried left the rock leaves the pile's leftmost
 * column, carried right its rightmost — so a pull is a lane the pair picked
 * out of the two the body offers, and that is the only thing either of them
 * decides about where a rock in this fight comes down. Two lanes rather than
 * seven on purpose: a hand that could place a rock anywhere would be a hand
 * that could feed the shield its own column forever, and the fight would stop
 * being about how much the other seat can absorb.
 *
 * One event per hand that paid for the column, `carry`'s arrangement and its
 * reason: the other seat may have been pulling the other way and lost, and a
 * hand that was charged nothing has done nothing (`spend` in `grip-push.ts`).
 */
export function pullFromCairn(
  world: World,
  body: Creature,
  dir: -1 | 1,
  paid: readonly (1 | 2)[],
): void {
  const b = cairnState(world);
  if (b === null || b.units <= 0) return;
  // The pile's left pair of columns or its right pair — a two-tile rock, so
  // the far edge is two in from the end and the two answers are symmetrical.
  const col = dir === -1 ? body.col : body.col + CAIRN_COLS - 2;
  letGo(world, body, b, col);
  for (const player of paid) {
    world.events.push({ type: "cairnPulled", player, col, row: body.row });
  }
}

/**
 * One beat of the pile, which is one question: has it stood still long enough
 * to let one go by itself?
 *
 * Run on the beat rather than on the tick, unlike the hand that answers it,
 * and that is the seam the whole creature sits on. A pull is a gesture and
 * arrives whenever the finger has travelled far enough; a shed is a *clock*,
 * and a clock the pair is counting against has to land on the beats they are
 * counting. `docs/spec/bosses.md` 11.1 is the rule it obeys — announced a full
 * cycle ahead, fixed, and learnable.
 */
export function stepCairn(world: World, b: CairnState): void {
  const body = world.creatures.find((c) => c.id === b.creatureId);
  if (body === undefined) return; // The last unit came away; it is gone.
  if (cairnWaited(world, b) < world.cfg.cairnShedBeats) return;
  const col = b.settleCol;
  letGo(world, body, b, col);
  world.events.push({ type: "cairnShed", col, row: body.row });
}
