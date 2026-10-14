import type { SimConfig } from "./config.js";
import { lidIsHeld, lidIsOpen } from "./lid.js";
import { lidCordAlong, lidCordPath, lidCordTension } from "./lid-bow.js";
import { LID_DOWN, lidFittingWay, lidWayRoom } from "./lid-way.js";
import { type Pull, pullHeard } from "./pull.js";
import { pullPathHeard, pullPathPoint } from "./pull-path.js";
import type { Command, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * The hand on the cord, and the whole of the gesture.
 *
 * **Only player 1 may pull**, for the reason player 2 is the only one who
 * fires: player 2's panel carries both colours, so a lid either seat could open
 * would be a creature one phone could play. It is the rule THE WARDEN's rope
 * and THE MAZE's string are already on.
 *
 * **One cord at a time**, because it is one hand. A grab on a second lid lets
 * the first one shut — stated here rather than left to the lift, because a
 * `drag` on the way in is the only message that arrives when a finger moves
 * from one handle to another without ever leaving the glass.
 *
 * **One path** (`lid-way.ts`): the grab takes the way the field has room
 * for, and the cord bows to one side of it (`lid-bow.ts`); only the hand's
 * progress along the bow counts, the rule THE WARDEN's rope has had since 10
 * October 2026 and bent on the 13th. A thumb a tile off the bow drops the
 * cord (`pullStray`) and holds nothing until it lifts (`lidStrayed`).
 * `fromMilli` and `fromYMilli` are how far the hand has come from where it
 * grabbed, in thousandths of a tile, resolved on the device whose finger it
 * is (`touchDown`, `packages/render/src/touch.ts`) — so a grab reports zero
 * and there is no origin to keep. The travel is cut to taut and to the room
 * the way has, so the handle stays whole on the field.
 */
export function lidHeard(world: World, player: 1 | 2, command: Command): void {
  if (player !== 1 || command.kind !== "drag" || command.target !== "lidString") return;
  if (!command.on) {
    const short = world.creatures.find((c) => c.kind === "lid" && lidIsHeld(c) && !c.lidCounted);
    if (short !== undefined) sayShort(world, short);
    releaseLids(world);
    return;
  }
  const held = world.creatures.find((c) => c.id === command.id && c.kind === "lid");
  if (held === undefined) {
    // A cord whose body has gone — shot, or off the bottom of the field — with
    // a finger still pressed against the glass. Nothing to hold open, and the
    // hand is not on anything else either.
    releaseLids(world);
    return;
  }
  if (held.lidStrayed === true) return;
  const was = lidIsOpen(world.cfg, held);
  for (const c of world.creatures) if (c !== held) letGo(c);
  // The grab chooses the way, by the room the field has from where the cord
  // rests now, and the hold keeps it however the body falls.
  if (held.lidWay === undefined) held.lidWay = lidFittingWay(world.cfg, held);
  const counted = held.lidCounted === true;
  const path = lidCordPath(world.cfg, held);
  const heard = pullPathHeard(
    path,
    counted,
    true,
    command.fromMilli,
    command.fromYMilli ?? 0,
    lidCordAlong(world.cfg, held, held.lidPullMilli ?? 0),
  );
  if (heard.heard === "strayed") {
    world.events.push({ type: "pullStray", col: held.col, player: 1 });
    letGo(held);
    held.lidStrayed = true;
    return;
  }
  // The tension is the straight distance along the way the bow has come,
  // cut to the room the field has that way.
  const along = lidCordTension(world.cfg, held, pullPathPoint(path, heard.travelMilli));
  const travel = Math.max(0, Math.min(along, world.cfg.lidTautMilli));
  held.lidPullMilli = Math.min(travel, lidWayRoom(world.cfg, held, held.lidWay));
  if (pullHeard(cord(world.cfg), counted, true, held.lidPullMilli).heard === "counted") {
    held.lidCounted = true;
  }
  if (!was && lidIsOpen(world.cfg, held) && held.color !== null) {
    world.events.push({ type: "eyeOpen", col: held.col, color: held.color });
  }
}

/** The cord as the one generic PULL: along its way, `lidTautMilli` long. */
function cord(cfg: SimConfig): Pull {
  return { way: "down", reachMilli: cfg.lidTautMilli };
}

/** A cord let go short of taut, past a tap: refused, and said. */
function sayShort(world: World, c: Creature): void {
  if (pullHeard(cord(world.cfg), false, false, c.lidPullMilli ?? 0).heard !== "short") return;
  world.events.push({ type: "pullShort", col: c.col, player: 1 });
}

/** One cord let go of: the pull, its way, its count and a stray. */
function letGo(c: Creature): void {
  c.lidPullMilli = undefined;
  c.lidWay = undefined;
  c.lidCounted = undefined;
  c.lidStrayed = undefined;
}

/** Every cord let go of, however it happened. */
export function releaseLids(world: World): void {
  for (const c of world.creatures) if (c.kind === "lid") letGo(c);
}

/**
 * Every held cord, kept on the field as the body under it falls.
 *
 * The room in `lidHeard` settles how far a handle may go at the instant a
 * finger reports, and the handle rides the lid down a tile a beat afterwards
 * (`lidHandleMilli`) — so one pinned against the bottom of the field would be
 * off it a beat later with no new command to notice. Cutting it to the room
 * again shortens the pull rather than moving the body, which is the honest reading: the handle
 * reached the floor and the lid went on falling, so the cord paid it out and
 * the plates close by themselves. Both seats see it, because both draw the
 * same number. Called from `step` once a beat, after the field has fallen.
 */
export function stepLidPulls(world: World): void {
  for (const c of world.creatures) {
    if (c.kind !== "lid" || c.lidPullMilli === undefined) continue;
    const room = lidWayRoom(world.cfg, c, c.lidWay ?? LID_DOWN);
    c.lidPullMilli = Math.min(c.lidPullMilli, room);
  }
}
