import { instarAt, instarHeadAt, type Point } from "./instar-place.js";
import type { Figure } from "./instar-shape.js";
import { instarHandover, instarNeck, instarTurn, turnedFarEnd } from "./instar-turn.js";
import type { Layout } from "./layout.js";

/**
 * **Where THE INSTAR's body goes away to**: the far end of it, the root of
 * the tail. Seen face-on the body runs back and up into the dark above the
 * head, and side-on it is the end of the back. `slow-intake-aim.ts` stops
 * the slow's light along the line from here to the head, so the light stands
 * round the whole body rather than crossing it.
 *
 * **It is always on the screen.** The owner, 9 October 2026: *make sure the
 * graphics of boss specifically the tail is not cut from borders of game
 * screen*. A pose puts the far end where its figure says, and turned a third
 * of the way round (`instar-turn.ts`) a far end near the right-hand corner was
 * carried past it, and the tail with it. So where the end is *seen* — turned
 * as far as the face-on view turns it, and handed over to the profile as the
 * profile takes the body — is kept `EDGE` in from either side and `TOP` down
 * from the top, and the face-on rear is moved by what it takes to get it
 * there. Every drawer, stopper and light asks here, so all of them move it
 * together; the marks are the script's and never move.
 */

/** How far in from either side, and down from the top, the seen far end is kept: shares of the screen. */
const EDGE = 0.12;
const TOP = 0.07;
/** How many times the rear is moved toward where it is kept. */
const TRIES = 3;

/** Where the far end is seen with the face-on rear at `rear`: the turned end, handed over to the profile's. */
function seenFrom(l: Layout, f: Figure, rear: Point): Point {
  const { head, r } = instarHeadAt(l, f);
  const t = turnedFarEnd(instarNeck(head, r), rear, r, instarTurn(f.side));
  const k = instarHandover(f.side);
  return { x: t.x + (rear.x - t.x) * k, y: t.y + (rear.y - t.y) * k };
}

/** How far a seen point is off the part of the screen the far end is kept in, in pixels. */
function outside(l: Layout, p: Point): Point {
  const lo = EDGE * l.width;
  const hi = l.width - lo;
  const top = TOP * l.height;
  return { x: p.x > hi ? hi - p.x : p.x < lo ? lo - p.x : 0, y: p.y < top ? top - p.y : 0 };
}

/** The far end as the face-on drawers lay it: the figure's, moved until it is seen on the screen. */
export function instarFarEnd(l: Layout, f: Figure): Point {
  const rear = instarAt(l, f.rearX, f.rearY);
  for (let i = 0; i < TRIES; i++) {
    const seen = seenFrom(l, f, rear);
    const off = outside(l, seen);
    if (off.x === 0 && off.y === 0) break;
    // How far the seen end goes for a pixel of rear, each way — under one, as the turn foreshortens it.
    const gx = seenFrom(l, f, { x: rear.x + 1, y: rear.y }).x - seen.x;
    const gy = seenFrom(l, f, { x: rear.x, y: rear.y + 1 }).y - seen.y;
    rear.x += off.x / Math.max(gx, 0.1);
    rear.y += off.y / Math.max(gy, 0.1);
  }
  return rear;
}

/** Where the engines burn in this frame's figure: in whichever view has the body. */
export function instarEnginesAt(l: Layout, f: Figure): Point {
  return seenFrom(l, f, instarFarEnd(l, f));
}
