import { SIDE, type Vec3, type View, view } from "@neon-spore/content";
import { INSTAR_BODY } from "./instar-body-look.js";
import { instarFarEnd } from "./instar-far-end.js";
import { instarAt, type Point } from "./instar-place.js";
import type { Look } from "./instar-plate.js";
import { breathAt, undulate } from "./instar-profile-life.js";
import { swellAt, swimAt } from "./instar-serpent.js";
import type { Layout } from "./layout.js";
import { splineAt } from "./spline.js";

/**
 * **THE INSTAR side-on**: the perspective the owner asked to change to on 25
 * September 2026 — *the perspective has changed so we see him from the side*.
 * Head to the left, the long plated body across the field, the back up with
 * the two nests on it (`instar-eggs.ts`), the near wing raised off the back
 * and the far one behind it, the engines at the rear, the tail out behind or
 * curled over at the ship (`instar-tail.ts`).
 *
 * **The back runs through the nests.** The spine is a spline from the neck,
 * under each nest, to the rear, so wherever a pose puts its nests the eggs
 * sit on the body and not beside it (`instar-poses.ts`) — and the moult's
 * split runs along it too (`instar-moult.ts`).
 *
 * **The body is a tube of the rig** (`solid-tube.ts`, `drawTube`): one ring
 * per sample of the spine, lit across its width as the cylinder it is, with a
 * rim along its edge and a contact shadow wherever something bears on it.
 * What sits on it is placed round those rings (`instar-profile-surface.ts`),
 * and it breathes, swims and rolls on its own clock (`instar-profile-life.ts`).
 * Four legs hang under it, the far pair behind the body (`instar-legs.ts`).
 *
 * This file lays the lines; `instar-profile-draw.ts` draws them.
 */

/** Samples along the spine. */
const N = 32;

/** The body's lines for one frame: the spine through the nests, and the hide's two edges. */
export function profileLines(l: Layout, look: Look) {
  const { f, head, r, time } = look;
  const nest = instarAt(l, f.nestX, f.nestY);
  const eggs = instarAt(l, f.eggsX, f.eggsY);
  // The nearer nest to the head first, whichever it is, so the back does not
  // double on itself when the brood's nests change sides.
  const [near, far] = nest.x <= eggs.x ? [nest, eggs] : [eggs, nest];
  // A Catmull-Rom knot k of four sits at u = k / 3, so that is where the nests are seated.
  const neck = { x: head.x + r * INSTAR_BODY.neck.x, y: head.y + r * INSTAR_BODY.neck.y };
  const end = instarFarEnd(l, f);
  const seats = [seated(near, neck, far, r, 1 / 3), seated(far, near, end, r, 2 / 3)] as const;
  const knots = [neck, ...seats, end];
  const spine = Array.from({ length: N + 1 }, (_, i) => splineAt(knots, i / N));
  undulate(spine, r, time);
  // A wave swims down it from the neck, grown in flight (`instar-serpent.ts`).
  spine.forEach((p, i) => {
    p.y += swimAt(look, i / N);
  });
  const rear = spine[N] as Point;
  const top: Point[] = [];
  const bottom: Point[] = [];
  spine.forEach((p, i) => {
    const u = i / N;
    const q = spine[Math.min(N, i + 1)] ?? p;
    const o = spine[Math.max(0, i - 1)] ?? p;
    const len = Math.hypot(q.x - o.x, q.y - o.y) || 1;
    const nx = (q.y - o.y) / len;
    const ny = -(q.x - o.x) / len;
    const w = r * INSTAR_BODY.girth(u) * swellAt(look, u);
    // The lung fills the belly more than the back.
    const lung = breathAt(u, time);
    const up = w * (1 + (lung - 1) * 0.3);
    top.push({ x: p.x + nx * up, y: p.y + ny * up });
    bottom.push({ x: p.x - nx * w * lung * 0.9, y: p.y - ny * w * lung * 0.9 });
  });
  const swum = seats.map((p, k) => ({ x: p.x, y: p.y + swimAt(look, (k + 1) / 3) }));
  return { spine, top, bottom, near, far, rear, seats: swum };
}

/** Where the spine runs under the nest at `p`, seated `INSTAR_BODY.seat(u)` off the back:
 * straight down the screen, or across the spine running `from` → `to` (`INSTAR_BODY.across`). */
function seated(p: Point, from: Point, to: Point, r: number, u: number): Point {
  const s = r * INSTAR_BODY.seat(u);
  if (!INSTAR_BODY.across) return { x: p.x, y: p.y + s };
  const len = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  return { x: p.x - ((to.y - from.y) / len) * s, y: p.y + ((to.x - from.x) / len) * s };
}

/** Where a wing hangs: its shoulder on the screen, the view it is seen in, its hinge in the rig, its flank. */
export interface WingSeat {
  at: Point;
  w: View;
  hinge: Vec3;
  side: 1 | -1;
}

/** The two wings side-on, the far one first: off the back, as `drawProfile`
 * draws them and a bolt meets them (`instar-limb-stop.ts`). */
export function profileWings(top: readonly Point[], rear: Point, r: number): [WingSeat, WingSeat] {
  const back = (u: number): Point => top[Math.round(u * N)] ?? rear;
  const w = view(SIDE);
  const root = back(0.38);
  return [
    {
      at: { x: root.x - r * 0.25, y: root.y - r * 0.1 },
      w,
      hinge: { x: 0, y: 0, z: -r * 0.3 },
      side: -1,
    },
    { at: back(0.42), w, hinge: { x: 0, y: 0, z: r * 0.3 }, side: 1 },
  ];
}

/** The way the spine runs at its rear, a unit vector. */
export function heading(spine: readonly Point[]): Point {
  const a = spine[N - 2] as Point;
  const b = spine[N] as Point;
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
}
