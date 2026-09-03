import {
  type Creature,
  GYRE_CLICKS,
  GYRE_MOUNTS,
  gyreClick,
  gyreSpinPerBeat,
  gyreSucked,
  mountOffset,
  type World,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * Where THE GYRE's parts are drawn between beats — **the wheel's whole motion,
 * in one file**, because the rim, the six bodies on it and the spokes between
 * them are one object and a second copy of the interpolation is how they come
 * apart.
 *
 * **A body on a rim turns; it does not cross.** `creatureCenter` walks a
 * creature from the tile it left to the tile it is in along a straight line,
 * which is right for everything that falls and wrong for everything that turns:
 * a mount is two tiles from the hub at both ends of that walk and *less* than
 * two in the middle of it, so six bodies crossing their chords together read as
 * a wheel collapsing and springing back. So a mount is placed in two halves
 * carried across differently — the hub translates in a straight line, exactly as
 * everything else on the field does, and the offset from the hub *rotates*, its
 * angle and its radius interpolated separately. The endpoints are identical to
 * the straight walk's; only the path between them is an arc.
 *
 * **The rotation eases and the fall still does not.** `creature-place.ts` is
 * right that a fall is linear: "it lands on the four" is a sentence about a body
 * arriving, and an eased fall arrives at a moment the ear cannot predict. A rim
 * answers a different question. The wheel turns a *fraction* of a click a beat
 * (`gyreSpinMilli` is 350, a click every third beat), so the position it stands
 * on advances on one beat in three and holds on the other two — and a linear
 * glide across the beat it advances on starts and stops dead, which is the
 * picture of a wheel jumping rather than turning.
 *
 * **Both ends land exactly on the tile.** `smoothstep(0)` is 0 and
 * `smoothstep(1)` is 1, and the jam below is multiplied by a sine that is zero
 * at both — so on every beat boundary a mount is on the tile the simulation has
 * it in,
 * which is the promise the pair's whole vocabulary rests on. Nothing in this
 * file may break it: a column read off the picture has to be the column a bullet
 * flies up.
 */

/** Radians one of the twelve rim positions is worth. */
export const CLICK_ANGLE = (Math.PI * 2) / GYRE_CLICKS;

/** A radius below which an offset has no angle worth reading — the frame a
 * wheel is born on, where every mount is still inside the hub. */
const AT_HUB = 0.001;

/** How fast the jam builds and lets go, in cycles a second. */
const JAM_HZ = 3.2;

/** How far back a jam drags the rim, in radians. A sixth of a click: enough to
 * see the wheel fighting, far too little to move a body out of its column. */
const JAM_RADIANS = CLICK_ANGLE / 6;

/**
 * The resistance in the mechanism, 0 free and -1 fully loaded. It builds over
 * seven tenths of its cycle and lets go over the other three, which is a tooth
 * riding up something and slipping off it — not a wobble. A wobble says the
 * wheel is alive, which every creature here already says; this has to say the
 * wheel is *obstructed*, which is the whole of what the maw does to it.
 */
function jam(time: number): number {
  const w = (((time * JAM_HZ) % 1) + 1) % 1;
  return w < 0.7 ? -(w / 0.7) : -(1 - (w - 0.7) / 0.3);
}

/** The angle every part of a wheel is dragged back by on this frame. Zero unless
 * the maw is open, and zero at both ends of every beat whatever the maw is
 * doing — see the promise at the top of this file. */
export function gyreJam(world: World, beatPhase: number, time: number): number {
  if (!gyreSucked(world)) return 0;
  return JAM_RADIANS * jam(time) * Math.sin(Math.PI * beatPhase);
}

/**
 * Where the hub is drawn, mid-glide, in tiles rather than pixels. Its own
 * interpolation rather than `creatureCenter`: a hub is not a body and is never
 * scaled by `depthScale` — a wheel that grew as it sank would have its rim leave
 * the columns its own mounts are standing in, and the columns are the game.
 */
export function hubAt(c: Creature, beatPhase: number): { col: number; row: number } {
  const from = c.fromCol ?? c.col;
  return {
    col: from + (c.col - from) * beatPhase,
    row: c.fromRow + (c.row - c.fromRow) * beatPhase,
  };
}

/** Where the hub is drawn, in pixels. */
export function gyreCenter(l: Layout, c: Creature, beatPhase: number): { x: number; y: number } {
  const at = hubAt(c, beatPhase);
  return { x: tileCX(l, at.col), y: tileCY(l, at.row) };
}

/** One point of the rim, in tiles: the hub's own glide plus an offset carried
 * across as an angle and a radius rather than as a line. */
function rimAt(
  hub: Creature,
  from: readonly [number, number],
  to: readonly [number, number],
  beatPhase: number,
  jamRadians: number,
): { col: number; row: number } {
  const at = hubAt(hub, beatPhase);
  const r0 = Math.hypot(from[0], from[1]);
  const r1 = Math.hypot(to[0], to[1]);
  // A mount on the frame its wheel was born: it is still inside the hub, has no
  // angle to turn from, and the straight walk out is the assembling glide
  // `mountsFor` puts it there for.
  if (r0 < AT_HUB || r1 < AT_HUB) {
    return {
      col: at.col + from[0] + (to[0] - from[0]) * beatPhase,
      row: at.row + from[1] + (to[1] - from[1]) * beatPhase,
    };
  }
  const a0 = Math.atan2(from[1], from[0]);
  let da = Math.atan2(to[1], to[0]) - a0;
  // The short way round. It is always the right way: `gyreSpinCapMilli` is one
  // click a beat, so no part of a rim ever crosses more than a twelfth of a turn
  // between two beats, and half a turn is the only ambiguity there is.
  if (da > Math.PI) da -= Math.PI * 2;
  if (da < -Math.PI) da += Math.PI * 2;
  // `smoothstep` and not a curve of this file's own: it is flat at both ends,
  // which is the whole of what the rotation wants, and `ease.ts` is where that
  // expression lives now (five files used to carry a private copy).
  const p = smoothstep(beatPhase);
  const a = a0 + da * p + jamRadians;
  const r = r0 + (r1 - r0) * p;
  return { col: at.col + Math.cos(a) * r, row: at.row + Math.sin(a) * r };
}

/** The hub of the wheel this body rides, or null for a body that rides none. */
export function hubOf(world: World, c: Creature): Creature | null {
  if (c.gyreId === undefined) return null;
  return world.creatures.find((h) => h.kind === "gyre" && h.id === c.gyreId) ?? null;
}

/**
 * Where a mount is drawn, and the row it is drawn at — which the perspective
 * scale and the draw order both read, so neither can be taken from the straight
 * walk while the body is taken from the arc. Null for anything that is not on a
 * rim, which leaves `drawCreatures` one line rather than a branch.
 */
export function mountPlace(
  l: Layout,
  world: World,
  c: Creature,
  beatPhase: number,
  time: number,
): { x: number; y: number; row: number } | null {
  const hub = hubOf(world, c);
  if (hub === null) return null;
  const hubFrom = hub.fromCol ?? hub.col;
  const at = rimAt(
    hub,
    [(c.fromCol ?? c.col) - hubFrom, c.fromRow - hub.fromRow],
    [c.col - hub.col, c.row - hub.row],
    beatPhase,
    gyreJam(world, beatPhase, time),
  );
  return { x: tileCX(l, at.col), y: tileCY(l, at.row), row: at.row };
}

/**
 * Which rim position the wheel stood on last beat, read back off a body that is
 * still riding it. Nothing stores it — `gyreTurnMilli` carries where the wheel
 * *is* — and a slot whose mount has been shot has to turn with the ones that are
 * left, or the rim would tear on the beat a body is lost.
 */
function previousClick(hub: Creature, carried: readonly Creature[]): number {
  const hubFrom = hub.fromCol ?? hub.col;
  for (const m of carried) {
    const dcol = (m.fromCol ?? m.col) - hubFrom;
    const drow = m.fromRow - hub.fromRow;
    for (let k = 0; k < GYRE_CLICKS; k++) {
      const was = mountOffset(k, m.gyreSlot ?? 0);
      if (was[0] === dcol && was[1] === drow) return k;
    }
  }
  return gyreClick(hub);
}

/**
 * The six corners of the rim, in pixels, in slot order.
 *
 * A body's own drawn centre where there is one, and the tile its slot would be
 * standing on where there is not — both, rather than one or the other. The live
 * bodies are what the rim has to hold exactly, and a slot whose body has been
 * shot still has a corner: a wheel that changed shape as it was cleared would be
 * a different object every few seconds, and the pair reads its position off that
 * shape.
 */
export function gyreCorners(
  l: Layout,
  world: World,
  hub: Creature,
  carried: readonly Creature[],
  beatPhase: number,
  time: number,
): { x: number; y: number }[] {
  const jamRadians = gyreJam(world, beatPhase, time);
  const click = gyreClick(hub);
  const was = previousClick(hub, carried);
  const hubFrom = hub.fromCol ?? hub.col;
  const out: { x: number; y: number }[] = [];
  for (let slot = 0; slot < GYRE_MOUNTS; slot++) {
    const body = carried.find((m) => m.gyreSlot === slot);
    const from: readonly [number, number] = body
      ? [(body.fromCol ?? body.col) - hubFrom, body.fromRow - hub.fromRow]
      : mountOffset(was, slot);
    const to: readonly [number, number] = body
      ? [body.col - hub.col, body.row - hub.row]
      : mountOffset(click, slot);
    const at = rimAt(hub, from, to, beatPhase, jamRadians);
    out.push({ x: tileCX(l, at.col), y: tileCY(l, at.row) });
  }
  return out;
}

/**
 * The angle the wheel's *current* stands at, in radians, continuous and never
 * quantised — what the membrane's flow and the core's swirl are drawn from.
 *
 * The rim itself has to ratchet: six bodies stand on tiles and a tile is a
 * column, so between two clicks there is nowhere for them to be. Nothing is
 * bolted to the fluid, though, so it is free to move at the rate the wheel is
 * actually turning — which is the one thing in the picture that answers *is it
 * slower now*, because a rim that advances on one beat in three and one that
 * advances on one beat in eight both look stopped most of the time.
 *
 * `gyreSpinPerBeat` at draw time rather than the number the beat was stepped
 * with: the two differ only on the beat the maw opens or closes, and on that
 * beat the flow catching up *is* the pull arriving.
 */
export function gyreFlow(world: World, hub: Creature, beatPhase: number, time: number): number {
  const spin = gyreSpinPerBeat(world, hub);
  const milli = (hub.gyreTurnMilli ?? 0) - spin * (1 - beatPhase);
  return (milli / 1000) * CLICK_ANGLE + gyreJam(world, beatPhase, time);
}
