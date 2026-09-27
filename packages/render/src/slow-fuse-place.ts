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
 * **Where the fuse stands: level under the boss, above the hull, and clear of
 * every mark.**
 *
 * The owner, 27 September 2026: *make the remaining time in slow state of
 * bosses below the boss and between the ship hull*. So it stands on the boss's
 * own column, halfway between the bottom of the body (`slow-intake-aim.ts`
 * already says where the body stands and how wide it is) and the top of the
 * hull, and as long as the body is wide.
 *
 * **It never lies over a live mark.** A ring the pair is asked to press is the
 * one thing on the field a line must not cross, and THE INSTAR's tail marks sit
 * low, in exactly the gap the fuse wants. So the middle is the first height
 * tried and not the only one: it walks down and up from there, a few pixels at
 * a time, and takes the nearest height that crosses nothing.
 *
 * **Where there is no gap**, it drops to just above the hull. That is a boss
 * standing on the hull — THE UNDERTOW's edge pushes up out of it, and its
 * rings are on the hull line too — so a fuse dropped onto a ring walks up from
 * there to the first height clear of every mark: under the boss is a place
 * the fight does not have, and over a ring is the one place the fuse may not
 * be. A gap with no clear height in it at all takes the hull as well.
 *
 * Read fresh every frame and never remembered, like the aim it stands under.
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

/** How thick the fuse is, in tiles — pinned by `slow-fuse.test.ts`. */
export const FUSE_THICK = 0.45;

/** How far each end stands in from the side of the screen, in tiles: past the
 * round cap, so it is whole under a body as wide as the screen. */
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
 * **The part of the body the fuse stands under**: its column, half its width,
 * and how low it reaches.
 */
export interface Under {
  readonly x: number;
  readonly half: number;
  readonly bottom: number;
}

/**
 * The aim's body, seen from below. A level body — THE HIVE's mass, THE LEAD's
 * stalk laid flat — is stood under whole, at its middle. A body whose axis
 * climbs is stood under at its **lower end**: THE INSTAR's chain runs up and
 * off to its engines, and the middle of head and engines is a column nothing
 * of it hangs in. The head is the column, and the head is the width.
 */
export function underAim(at: Aim): Under {
  const bottom = Math.max(at.y, at.ay) + at.r;
  if (Math.abs(at.y - at.ay) < at.r) {
    return { x: (at.x + at.ax) / 2, half: Math.abs(at.x - at.ax) / 2 + at.r, bottom };
  }
  return { x: at.y > at.ay ? at.x : at.ax, half: at.r, bottom };
}

/** A box, stood under whole: THE REPRISE's sac. */
export function underBox(b: Box): Under {
  return { x: (b.left + b.right) / 2, half: (b.right - b.left) / 2, bottom: b.bottom };
}

/** The fuse's own box at a place, whole: the bright line and its round caps. */
export function fuseBox(l: Layout, p: FusePlace): Box {
  const h = (l.tile * FUSE_THICK * 1.6) / 2;
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

/** The fuse under `body`, clear of `marks`: see the header. */
export function fusePlace(l: Layout, body: Under, marks: readonly Box[]): FusePlace {
  const side = l.tile * SIDE;
  const x = Math.min(l.width - side, Math.max(side, body.x));
  const half = Math.max(0, Math.min(body.half, x - side, l.width - side - x));
  const h = (l.tile * FUSE_THICK * 1.6) / 2;
  const floor = l.hullY - FUSE_OVER_HULL - h;
  const ceiling = body.bottom + h;
  const low = { x, y: floor, half };
  const clear = (y: number): boolean => {
    const box = fuseBox(l, { x, y, half });
    return !marks.some((m) => crosses(box, m));
  };
  if (ceiling > floor) {
    for (let y = floor; y >= l.gridTop + h; y -= STEP) if (clear(y)) return { x, y, half };
    return low;
  }
  const mid = (ceiling + floor) / 2;
  for (let d = 0; mid - d >= ceiling || mid + d <= floor; d += STEP) {
    if (mid + d <= floor && clear(mid + d)) return { x, y: mid + d, half };
    if (mid - d >= ceiling && clear(mid - d)) return { x, y: mid - d, half };
  }
  return low;
}

/** The fuse for this frame, under `body`, clear of this frame's marks. */
export function fuseAt(l: Layout, world: World, beatPhase: number, body: Under): FusePlace {
  return fusePlace(l, body, liveMarks(l, world, beatPhase));
}
