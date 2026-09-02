import {
  type Creature,
  GYRE_MOUNTS,
  GYRE_RADIUS,
  gyreClick,
  gyreSucked,
  mountOffset,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { hazed, nearness } from "./depth.js";
import { halo } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE GYRE's armature: a hub, six spokes and the rim they hold out.
 *
 * **Only the wheel is drawn here.** The six on the rim are `mount`s, which
 * `wornKind` resolves to an ordinary slick or bulb, so `drawCreatures` draws
 * them exactly as it draws a body in a lane — same contour, same colour, same
 * own-motion, same size. That is the creature rather than a saving: what the
 * pair has to read off a wheel is *the colour standing in a column*, which is
 * the sentence they already know, and a mount that looked like anything else
 * would be a new word to learn instead of an old one that expires.
 *
 * **The rim is a hexagon through the bodies, and it cannot be a circle.**
 * The six stand on tiles, and a tile ring is not round: at every position of
 * the turn two of them are two tiles from the hub and the other four are
 * `sqrt(5)`, a quarter of a tile further out (`GYRE_RING` in gyre-rim.ts). No
 * circle holds all six the same way — one through the near pair cuts the far
 * four in half, one through the far four leaves the near pair floating inside
 * it, and one drawn inside all of them puts every body on a stalk of a
 * different length. Each says something different about six bodies that are
 * bolted on identically.
 *
 * A rim through their own centres says the true thing once: every body sits in
 * the middle of the border, and the border is what carries it. It is built
 * from where the bodies are actually *drawn*, so it glides with them between
 * beats and the joint can never come apart — and a shot-away body leaves its
 * corner behind, because losing one costs the wheel an arm and not its shape.
 *
 * It is drawn in a pass of its own, **before** the bodies rather than inside
 * their loop, because a wheel is one object spanning five rows: `byDepth`
 * sorts body by body, so a hub taking its turn in that order would have its
 * spokes over the mounts above it and under the ones below. The armature is
 * structure, it is always behind, and one pass says so.
 */

/** Every wheel on the field. Exported so the armature and the wind ask once. */
export function gyres(world: World): Creature[] {
  return world.creatures.filter((c) => c.kind === "gyre");
}

/** How far the outermost body reaches from the hub, in pixels — the whole
 * footprint of a wheel, and what the wind leaves from. */
export function gyreRadiusPx(l: Layout): number {
  return l.tile * GYRE_RADIUS;
}

/** How far the two rim lines sit either side of the bodies' own centres, as a
 * share of the reach. Small: what makes a band read as metal is having a
 * thickness at all, and wider would show past the contours it is holding. */
const RIM_SPLIT = 0.045;

/**
 * Where the hub is drawn, mid-glide, in tiles rather than pixels.
 *
 * Its own interpolation rather than `creatureCenter`: a hub is not a body and
 * is never scaled by `depthScale` — a wheel that grew as it sank would have
 * its rim leave the columns its own mounts are standing in, and the columns
 * are the whole game.
 */
function hubAt(c: Creature, beatPhase: number): { col: number; row: number } {
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

/**
 * The six corners of the rim, in pixels, in slot order.
 *
 * A body's own drawn centre where there is one, and the tile its slot would be
 * standing on where there is not. Both, rather than one or the other: the live
 * bodies are what the rim has to hold exactly, and a slot whose body has been
 * shot still has a corner — a wheel that changed shape as it was cleared would
 * be a different object every few seconds, and the pair reads its position off
 * that shape.
 */
function corners(
  l: Layout,
  c: Creature,
  carried: readonly Creature[],
  beatPhase: number,
): { x: number; y: number }[] {
  const at = hubAt(c, beatPhase);
  const click = gyreClick(c);
  const out: { x: number; y: number }[] = [];
  for (let slot = 0; slot < GYRE_MOUNTS; slot++) {
    const body = carried.find((m) => m.gyreSlot === slot);
    if (body) {
      out.push(creatureCenter(l, body, beatPhase));
      continue;
    }
    const [dcol, drow] = mountOffset(click, slot);
    out.push({ x: tileCX(l, at.col + dcol), y: tileCY(l, at.row + drow) });
  }
  return out;
}

/**
 * The armature of every wheel on the field. `pull` is 0..1, how hard the ship
 * is dragging on it — the same number `drawGyreWind` brightens with, so the
 * two ends of the pull can never light on different frames.
 */
export function drawGyres(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  const live = gyres(world);
  if (live.length === 0) return;
  const pull = gyreSucked(world) ? 1 : 0;
  for (const c of live) {
    // The bodies this wheel is actually carrying, so the rim is built from the
    // things it holds rather than from an angle they ought to be at.
    const carried = world.creatures.filter((m) => m.gyreId === c.id);
    drawWheel(ctx, l, world.cfg, c, carried, beatPhase, time, pull);
  }
}

/**
 * One wheel: a rim through the six, six spokes out to it, and a hub.
 *
 * Everything is stroked rather than filled. The mounts are the only solid
 * objects on a wheel — they are what has to be read at a glance, in colour,
 * from across a phone screen — and an armature with any weight to it would be
 * competing with the six things the pair is actually looking at.
 */
function drawWheel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  carried: readonly Creature[],
  beatPhase: number,
  time: number,
  pull: number,
): void {
  const { x, y } = gyreCenter(l, c, beatPhase);
  const at = corners(l, c, carried, beatPhase);
  const row = c.fromRow + (c.row - c.fromRow) * beatPhase;
  const near = nearness(l, row);
  // Under a pull the metal is lit the shield's colour, which is the colour the
  // ship's own suck is drawn in — one signal with two ends, the arrangement
  // `claspResonance` already has for the ward.
  const metal = hazed(cfg, pull > 0 ? PALETTE.shield : PALETTE.rock, near);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = metal;

  // The rim, as two lines a hair either side of the bodies' own centres: a
  // band with a thickness, rather than one line that would read as a wire. The
  // bodies are drawn over it afterwards, so what shows in the end is a rim
  // running behind each of them and out to the next.
  ctx.lineWidth = STROKE.inner;
  ctx.globalAlpha = 0.5 + 0.35 * pull;
  for (const k of [1 - RIM_SPLIT, 1 + RIM_SPLIT]) {
    ctx.beginPath();
    for (let i = 0; i < at.length; i++) {
      const p = at[i]!;
      const px = x + (p.x - x) * k;
      const py = y + (p.y - y) * k;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // The spokes, hub to rim, one per slot. They end at the corner rather than
  // short of it, because the corner *is* the middle of a body — the spoke runs
  // under the contour and the contour is drawn over it, which is what a thing
  // bolted through the middle looks like.
  ctx.lineWidth = STROKE.inner;
  ctx.globalAlpha = 0.34 + 0.3 * pull;
  for (const p of at) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  // The hub. It is the one part of the wheel that is not on the grid at all —
  // nothing ever stands in the middle tile and no shot stops there
  // (`firstAlong`) — so it is drawn small and lit rather than as a body, and
  // the halo is what says the thing turning is powered.
  const hub = l.tile * 0.16;
  ctx.globalAlpha = 1;
  halo(ctx, x, y, hub * (3 + pull), metal, 0.1 + 0.16 * pull);
  ctx.lineWidth = STROKE.outline;
  ctx.beginPath();
  ctx.arc(x, y, hub, 0, Math.PI * 2);
  ctx.stroke();

  // A mark on the hub, pointing at the first slot. It turns with the rim
  // because it is aimed at the rim's own first corner rather than at an angle
  // of its own — a hexagon of spokes is six-fold symmetric and says nothing
  // about which way the wheel is going, and which way it is going is exactly
  // what the pair has to read off it to say where a colour will be next.
  const head = at[0];
  if (head) {
    const dx = head.x - x;
    const dy = head.y - y;
    const d = Math.hypot(dx, dy) || 1;
    ctx.lineWidth = STROKE.outline;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (dx / d) * hub * 1.7, y + (dy / d) * hub * 1.7);
    ctx.stroke();
  }

  // A slow shine crawling round the hub, sampled on the wall clock. The wheel's
  // own turn is quantised to the beat — the bodies glide from tile to tile and
  // stand still on the beats it does not advance — so this is the one part of
  // the picture that says the mechanism is running rather than stopped. It is
  // deliberately on the hub and nowhere near the rim: a moving light out where
  // the bodies are would be read as a body.
  ctx.globalAlpha = 0.2 + 0.3 * pull;
  ctx.lineWidth = STROKE.inner;
  ctx.beginPath();
  ctx.arc(x, y, hub * 1.9, time * 1.4, time * 1.4 + 1.1);
  ctx.stroke();

  ctx.restore();
}
