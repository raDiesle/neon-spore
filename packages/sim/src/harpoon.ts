import { type ClingKind, clingControlCol } from "./cling.js";
import { ticksPerBeat } from "./config.js";
import { hullRow, midCol } from "./config-derived.js";
import { faultOn } from "./fault-placed.js";
import { breachHull } from "./hull-damage.js";
import type { MalfunctionKind } from "./malfunction.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE LEECH and THE LIMPET as malfunctions**: a thing at the top of the
 * field fires a body at a control like a harpoon, it sticks, and the only
 * answer is to keep that control moving until the line is reeled back in.
 *
 * The owner asked for this on 14 September 2026, by name. Both shipped as
 * *creatures* — a body that fell down a lane, took its control and counted a
 * fuse, shaken off by moving enough times (`cling.ts`) — and what he wanted is
 * the same body arriving the way every other fault arrives: from the emitter,
 * placed on the map on a beat row, for as long as the pencil says.
 *
 * **What changed, and what did not.** The body is the same body and it holds
 * its control the same way; `cling.ts` still owns *which column it is on* and
 * whether it is stuck. Three things are new and all three are this file's:
 *
 * 1. **It arrives fired rather than fallen.** No lane, no fall, no landing —
 *    the fault installs it on the control on the beat the pencil starts.
 * 2. **The count is in ticks and it is short.** A control that has not moved
 *    for `harpoonStillBeats` — one and a half, not five — loses the round.
 *    Ticks and not beats because one and a half of a beat is not a beat, and
 *    the simulation counts in whole ticks (`config-derived.ts`).
 * 3. **It leaves on its own.** The fuse is not the only clock any more: the
 *    placement's own `beats` is how long it stays, and when that runs out it
 *    is reeled back to the emitter and the wave goes on.
 *
 * **What is gone is the shake**, and it is gone rather than deleted: a body
 * that could be shaken off by moving enough times is a different creature from
 * one that leaves when its owner calls it back, and the owner asked for the
 * second. The first is written up under NOT BUILT YET (`docs/spec/`).
 */

/** The two fault kinds that put a body on a control. */
export const HARPOON_KINDS = ["leech", "limpet"] as const;
export type HarpoonKind = (typeof HARPOON_KINDS)[number];

export function isHarpoonKind(kind: MalfunctionKind): kind is HarpoonKind {
  return kind === "leech" || kind === "limpet";
}

/**
 * Ticks a control may stand still under a harpoon before it goes off.
 *
 * One number for both, which is the owner's own instruction about THE LIMPET —
 * *the same `SimConfig` field, not a second literal*. At least one tick, so a
 * config dialled to nothing is a round lost on the next tick rather than a
 * division nobody wrote.
 */
export function harpoonStillTicks(world: World): number {
  const beats = Math.max(0, world.cfg.harpoonStillBeats);
  return Math.max(1, Math.round(beats * ticksPerBeat(world.cfg)));
}

/** How still the control under this kind is, in ticks. */
export function harpoonStill(world: World, kind: HarpoonKind): number {
  return kind === "leech" ? world.leechStillTicks : world.limpetStillTicks;
}

/**
 * How near the round is to being lost, in thousandths — nought the tick after
 * a move and a thousand on the tick it goes off.
 *
 * The number the cannon's own glow is drawn from (`render/hull-mood.ts`): the
 * owner asked for a colour that *grows toward about to explode* and starts
 * again from the beginning on every move, and a share is the one shape that
 * says both halves without render/ counting anything of its own.
 */
export function harpoonDangerMilli(world: World, kind: HarpoonKind): number {
  const of = harpoonStillTicks(world);
  return Math.max(0, Math.min(1000, Math.round((harpoonStill(world, kind) * 1000) / of)));
}

/**
 * **The body *this file* put on the control**, if it is still there.
 *
 * By id and not by kind, and that is not fussiness: the same two bodies still
 * arrive as creatures on the waves that spawn them (`cling.ts`), and a file
 * that reeled in whatever it found of the right kind would delete one the
 * moment a wave placed no fault — which is exactly what it did, in fourteen
 * tests, the first time this was written.
 */
export function harpoonBody(world: World, kind: HarpoonKind): Creature | undefined {
  const id = harpoonId(world, kind);
  return id === NO_HARPOON ? undefined : world.creatures.find((c) => c.id === id);
}

/** No body of this kind fired. Zero rather than -1: `nextId` starts at one, so
 * no creature can ever carry it (`world.ts`). */
export const NO_HARPOON = 0;

/**
 * This placement has gone off and will not fire again.
 *
 * A pencil is one harpoon, not a supply of them: without this the fault fires
 * a fresh body on the tick after the round is lost, over and over, for as long
 * as the placement is long. It is only visible at all on a hull that cannot be
 * broken — in a real wave the round ends — and a rule that is right only
 * because something else usually stops first is not a rule.
 */
export const SPENT = -1;

/** The id of the body this kind has out, or `NO_HARPOON`. */
export function harpoonId(world: World, kind: HarpoonKind): number {
  return kind === "leech" ? world.leechHarpoonId : world.limpetHarpoonId;
}

function setId(world: World, kind: HarpoonKind, id: number): void {
  if (kind === "leech") world.leechHarpoonId = id;
  else world.limpetHarpoonId = id;
}

/** Set the stillness of one kind. One writer, so the two fields cannot drift
 * from the kind they belong to. */
function setStill(world: World, kind: HarpoonKind, ticks: number): void {
  if (kind === "leech") world.leechStillTicks = ticks;
  else world.limpetStillTicks = ticks;
}

/**
 * Every harpoon fault, on the tick.
 *
 * A tick and not a beat, which is the whole of point 3: a control that has not
 * moved for a beat and a half has to be judged between beats, and a rule that
 * only looked on the beat would give the pair two whole beats of grace on a
 * count of one and a half.
 *
 * Three things happen here, in the order they can: a body arrives on the beat
 * the pencil starts; a body leaves on the tick the pencil ends; and in between
 * the control is watched.
 */
export function stepHarpoons(world: World): void {
  for (const kind of HARPOON_KINDS) {
    const on = faultOn(world, kind) !== null;
    const body = harpoonBody(world, kind);
    if (!on) {
      // Reeled in: the pencil's own length ran out, so the line goes home and
      // the body with it. Not a hit and not a shake — the thing that fired it
      // called it back (`render/harpoon-line.ts` draws the reel).
      if (body) {
        world.creatures = world.creatures.filter((c) => c !== body);
        world.events.push({ type: "clingFreed", kind, col: body.col, row: body.row });
      }
      setId(world, kind, NO_HARPOON);
      setStill(world, kind, 0);
      continue;
    }
    if (!body) {
      if (harpoonId(world, kind) === SPENT) continue;
      install(world, kind);
      continue;
    }
    watch(world, kind, body);
  }
}

/** The body, fired onto its control and already holding it. */
function install(world: World, kind: HarpoonKind): void {
  const col = clingControlCol(world, kind);
  const row = hullRow(world.cfg);
  const id = world.nextId++;
  world.creatures.push({
    id,
    kind,
    col,
    row,
    // `fromCol` is the emitter's column and `fromRow` the top of the field:
    // the picture draws the line it came down, which is the harpoon
    // (`render/cling.ts` already slides a clinger in from where it came).
    fromCol: midCol(world.cfg),
    fromRow: 0,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: 0,
    clingStuck: true,
    clingLastCol: col,
    clingStill: 0,
    clingMoves: 0,
  });
  setId(world, kind, id);
  setStill(world, kind, 0);
  world.events.push({ type: "clingGrip", id, kind, col, row, from: col });
}

/** One body on its control, watched for a control that has stopped. */
function watch(world: World, kind: HarpoonKind, body: Creature): void {
  const at = clingControlCol(world, kind);
  const moved = at !== (body.clingLastCol ?? at);
  body.clingLastCol = at;
  body.col = at;
  if (moved) {
    setStill(world, kind, 0);
    return;
  }
  const still = harpoonStill(world, kind) + 1;
  setStill(world, kind, still);
  if (still < harpoonStillTicks(world)) return;
  // The round is lost: a heavy hit at the control's own column, which is what
  // the creature did and what `wave-fail.ts` reads.
  world.creatures = world.creatures.filter((k) => k !== body);
  setId(world, kind, SPENT);
  setStill(world, kind, 0);
  breachHull(world, at, kind as ClingKind, body.row, "heavy");
  world.events.push({ type: "clingBlast", kind, col: at, row: body.row });
}
