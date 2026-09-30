import { instarBoss, instarStep, type World } from "@neon-spore/sim";
import { bossCues } from "./boss-cue.js";
import { instarMarksUp } from "./instar-marks.js";
import { instarMarkPoint, instarMarkRadius } from "./instar-place.js";
import { instarThreat } from "./instar-shape.js";
import { instarBody } from "./instar-sway.js";
import { instarTrack } from "./instar-track.js";
import type { Layout } from "./layout.js";
import type { Aim } from "./slow-intake-aim.js";

/**
 * **Where the fuse stands: across the screen under the boss, or over it when
 * the boss is down on the hull, and clear of every mark.**
 *
 * The owner, 27 September 2026: *below the boss and between the ship hull*.
 * And on the 30th: *there are two positions, either below the boss (the
 * default) and when it is a boss very near the ship hull and there is more
 * space above boss, then above it*. So the body is read as a band of height
 * only — where it starts and where it ends (`slow-intake-aim.ts` already says
 * where it stands) — and the fuse is as long as the screen whatever the body's
 * width, so it starts the same length on every boss (`slow-fuse.ts`).
 *
 * **Below, while there is room.** Halfway between the bottom of the body and
 * the top of the hull, when that gap holds the fuse and `NEAR` tiles more. A
 * gap thinner than that is a boss down on the hull.
 *
 * **Above, when the boss is down on the hull** and the field over it is taller
 * than the gap under it: just over the top of the body, walking up from there.
 *
 * **It never lies over a live mark.** A ring the pair is asked to press is the
 * one thing on the field a line must not cross, and THE INSTAR's tail marks sit
 * low, in exactly the gap the fuse wants. So the first height is tried and not
 * the only one: it walks a few pixels at a time and takes the nearest height
 * that crosses nothing.
 *
 * **Where neither has room**, it drops to just above the hull, and a fuse
 * dropped onto a ring walks up from there to the first height clear of every
 * mark — over a ring is the one place the fuse may not be.
 *
 * Read fresh every frame and never remembered, like the aim it stands by.
 */

/** A rectangle in canvas pixels. */
export interface Box {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

/** Where the fuse is drawn this frame: its middle, and half its whole length. */
export interface FusePlace {
  readonly x: number;
  readonly y: number;
  readonly half: number;
}

/** How thick the fuse is, in tiles. It was 0.45 from 25 September 2026 and
 * the owner asked for *less height* on the 30th; the glow round it is what
 * makes it read (`slow-fuse.ts`). Pinned by `slow-fuse.test.ts`. */
export const FUSE_THICK = 0.2;

/** Tiles of field the gap under the body must hold beyond the fuse itself for
 * the fuse to stand there; a thinner gap is a boss down on the hull. */
export const FUSE_NEAR = 0.6;

/** Pixels between the top of the body and a fuse stood over it. */
const OVER_BODY = 6;

/** How far each end stands in from the side of the screen, in tiles: past the
 * round cap and the spark, so the fuse is whole and almost the screen's width. */
const SIDE = 0.5;

/** Pixels between the fuse and the hull when it has dropped onto it. */
export const FUSE_OVER_HULL = 4;

/** Pixels the search moves the fuse per try. */
const STEP = 3;

/** THE INSTAR's window ring at its widest, as a share of the mark's radius
 * (`instar-together.ts` `drawInstarWindow`). */
const WINDOW_RING = 2.85;

/** The body's own box: the aim's capsule, head to the far end of its axis. */
export function bodyBox(at: Aim): Box {
  return {
    left: Math.min(at.x, at.ax) - at.r,
    right: Math.max(at.x, at.ax) + at.r,
    top: Math.min(at.y, at.ay) - at.r,
    bottom: Math.max(at.y, at.ay) + at.r,
  };
}

/**
 * **The band of height the body takes**, which is all the fuse asks of it: it
 * is as long as the screen, so where the body stands across the field is not
 * its question.
 */
export interface Under {
  readonly top: number;
  readonly bottom: number;
}

/** The aim's body, head to the far end of its axis. */
export function underAim(at: Aim): Under {
  return { top: Math.min(at.y, at.ay) - at.r, bottom: Math.max(at.y, at.ay) + at.r };
}

/** A box, stood by whole: THE REPRISE's sac. */
export function underBox(b: Box): Under {
  return { top: b.top, bottom: b.bottom };
}

/** Half the fuse's height, in pixels: the line and the bright inner stroke of
 * its glow, twice as wide — the fainter glow past it may lie over a ring. */
export function fuseHalfHeight(l: Layout): number {
  return l.tile * FUSE_THICK;
}

/** The fuse's own box at a place, whole: the bright line and its round caps. */
export function fuseBox(l: Layout, p: FusePlace): Box {
  const h = fuseHalfHeight(l);
  return { left: p.x - p.half - h, right: p.x + p.half + h, top: p.y - h, bottom: p.y + h };
}

const crosses = (a: Box, b: Box): boolean =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/**
 * **Every mark on the field that is asking for a thumb this frame**, each as
 * the box its ring takes. THE INSTAR's marks are its own (`instar-marks.ts`);
 * every other boss's are the cues it would give (`boss-cue.ts`), on both
 * seats, because the fuse is drawn on both screens.
 */
export function liveMarks(l: Layout, world: World, beatPhase: number): Box[] {
  const s = instarBoss(world);
  if (s !== null) {
    const step = instarStep(s);
    if (step === null || !instarMarksUp(world, s)) return [];
    const { sway } = instarBody(s, world.cfg, world, world.beat, beatPhase);
    const along = instarThreat(s, world.beat, beatPhase);
    const r = instarMarkRadius(l, world.cfg);
    const ring = r * WINDOW_RING;
    return step.marks.map((m) => {
      const at = instarMarkPoint(l, m, sway, along);
      const bottom =
        m.gesture === "swipeDown"
          ? instarTrack(at.x, at.y, r, (l.tile * world.cfg.instarSwipeMilli) / 1000).bottom
          : at.y;
      return { left: at.x - ring, right: at.x + ring, top: at.y - ring, bottom: bottom + ring };
    });
  }
  return bossCues(l, world, beatPhase, () => l.hullY).map((c) => ({
    left: c.x - c.halfW,
    right: c.x + c.halfW,
    top: c.y - c.halfH,
    bottom: c.y + c.halfH,
  }));
}

/** Whether the gap under `body` is room for the fuse (see the header). */
export function roomUnder(l: Layout, body: Under): boolean {
  const h = fuseHalfHeight(l);
  return l.hullY - FUSE_OVER_HULL - body.bottom >= 2 * h + l.tile * FUSE_NEAR;
}

/** The fuse by `body`, clear of `marks`: see the header. */
export function fusePlace(l: Layout, body: Under, marks: readonly Box[]): FusePlace {
  const side = l.tile * SIDE;
  const x = l.width / 2;
  const half = Math.max(0, x - side);
  const h = fuseHalfHeight(l);
  const floor = l.hullY - FUSE_OVER_HULL - h;
  const roof = l.gridTop + h;
  const low = { x, y: floor, half };
  const clear = (y: number): boolean => {
    const box = fuseBox(l, { x, y, half });
    return !marks.some((m) => crosses(box, m));
  };
  if (roomUnder(l, body)) {
    const ceiling = body.bottom + h;
    const mid = (ceiling + floor) / 2;
    for (let d = 0; mid - d >= ceiling || mid + d <= floor; d += STEP) {
      if (mid + d <= floor && clear(mid + d)) return { x, y: mid + d, half };
      if (mid - d >= ceiling && clear(mid - d)) return { x, y: mid - d, half };
    }
    return low;
  }
  const over = body.top - OVER_BODY - h;
  if (over - roof > floor - body.bottom) {
    for (let y = over; y >= roof; y -= STEP) if (clear(y)) return { x, y, half };
  }
  for (let y = floor; y >= roof; y -= STEP) if (clear(y)) return { x, y, half };
  return low;
}

/** The fuse for this frame, by `body`, clear of this frame's marks. */
export function fuseAt(l: Layout, world: World, beatPhase: number, body: Under): FusePlace {
  return fusePlace(l, body, liveMarks(l, world, beatPhase));
}
