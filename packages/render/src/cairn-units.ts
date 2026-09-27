import { CAIRN_BITE_ACROSS, CAIRN_BITE_UP, CAIRN_COURSES } from "@neon-spore/content";
import { CAIRN_COLS, type Creature } from "@neon-spore/sim";
import { rocked, type Shift, seatOf, stoneRock } from "./cairn-rock.js";
import { signedHash } from "./hash.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { rockRadius } from "./rock-size.js";

/**
 * Where THE CAIRN's stones stand, and the outline they make together.
 *
 * The geometry alone — no paint. It was the top half of `cairn.ts` until the
 * pile's picture became a record a candidate can patch (`cairn-look.ts`): the
 * shipped pile, a candidate pile, the tell that points at the next stone
 * (`cairn-settle.ts`) and the hand on one (`cairn-hand.ts`) all place their
 * marks off this file, so a second spelling of the stack in any of them is a
 * mark standing beside a stone rather than on it.
 */

/**
 * The courses and the seam depths are `content/cairn-shape.ts`'s, read here and
 * by the shape sheet's card alike — so the picture the owner judges the
 * silhouette from is the stack the field draws. Bottom first, which is also
 * the order the units leave in: the first `units` of the stack are drawn, so a
 * shrinking pile loses its apex and keeps its base.
 */
const COURSES = CAIRN_COURSES;
const BITE_ACROSS = CAIRN_BITE_ACROSS;
const BITE_UP = CAIRN_BITE_UP;

/** Facets on a rock, which is `METEOR.sides` — named here only because the
 * inradius is what the spacing is written in, and a seven-sided rock reaches
 * `cos(pi/7)` of its circumradius at the middle of a facet. */
const INNER = Math.cos(Math.PI / 7);

export interface CairnUnit {
  x: number;
  y: number;
  r: number;
  /** Its place in the stack, which seeds the settle and the pits. */
  slot: number;
  /** How far it has rocked on its seat, radians clockwise (`cairn-rock.ts`). */
  rock: number;
}

/**
 * Where every stacked unit stands, in pixels.
 *
 * Exported because the picture is asked about twice: the pile itself, and the
 * tell that has to point at the rock the pile is about to let go of
 * (`cairn-settle.ts`). Two copies of this arithmetic is a mark standing beside
 * a stone rather than on it.
 *
 * The settle is a drift of a fiftieth of a rock, per unit, out of step with
 * its neighbours — **a pile settles, it does not breathe**. One clock for all
 * seven would pulse the whole stack like a body, and the seams would stop
 * working against each other, which is the only thing keeping them countable.
 * Over it, each stone rocks on the ones under it, far enough to be seen, and
 * carries what stands on it (`cairn-rock.ts`).
 */
export function cairnUnits(
  l: Layout,
  body: Creature,
  units: number,
  time: number,
  /** `outlineHush`'s, which stills the rocking in THE SLOW; 0 is the stack at rest. */
  hush: number,
): CairnUnit[] {
  const r = rockRadius(l, 2);
  const inner = r * INNER;
  const across = 2 * inner * (1 - BITE_ACROSS);
  const step = 2 * inner * (1 - BITE_UP);
  const cx = tileCX(l, body.col + (CAIRN_COLS - 1) / 2);
  const cy = tileCY(l, body.row);
  const lift = ((COURSES.length - 1) * step) / 2;
  const height = (2 * r) / l.tile;
  const out: CairnUnit[] = [];
  let under: { x: number; top: Shift }[] = [];
  let slot = 0;
  for (let c = 0; c < COURSES.length && slot < units; c++) {
    const n = COURSES[c] as number;
    const course: { x: number; top: Shift }[] = [];
    for (let i = 0; i < n && slot < units; i++) {
      const drift = r * 0.02;
      const x = cx + (i - (n - 1) / 2) * across;
      // Screen y grows downward, so course 0 — the widest — sits at the
      // bottom and the apex is the one taken off first.
      const y = cy - (c * step - lift);
      const seat = seatOf(x, under, across);
      const rock = stoneRock(slot, time, hush, height);
      const moved = rocked(rock, r);
      course.push({ x, top: { x: seat.x + moved.top.x, y: seat.y + moved.top.y } });
      out.push({
        x:
          x +
          seat.x +
          moved.mid.x +
          Math.sin(time * 1.7 + slot * 2.1) * drift +
          signedHash(body.id, slot, 1) * r * 0.05,
        y:
          y +
          seat.y +
          moved.mid.y +
          Math.cos(time * 1.3 + slot * 1.7) * drift +
          signedHash(body.id, slot, 2) * r * 0.04,
        r,
        slot,
        rock,
      });
      slot++;
    }
    under = course;
  }
  return out;
}

/** Every unit's facets as one path, which is the pile's outline and its seams
 * at once. `drawRockBody` draws its own stone; this is only the boundary, so
 * it is a plain polygon rather than the wobbled contour underneath — a clip
 * that tracked every facet's wobble would shave the stones it is holding. */
export function pilePath(units: readonly CairnUnit[]): Path2D {
  const path = new Path2D();
  for (const u of units) unitInto(path, u);
  return path;
}

/** One unit's facets on their own: the seam it makes with what is under it. */
export function unitPath(u: CairnUnit): Path2D {
  const path = new Path2D();
  unitInto(path, u);
  return path;
}

function unitInto(path: Path2D, u: CairnUnit): void {
  const spin = signedHash(u.slot, 3) * Math.PI + u.rock;
  for (let k = 0; k < 7; k++) {
    const a = spin + (k / 7) * Math.PI * 2;
    const x = u.x + Math.cos(a) * u.r;
    const y = u.y + Math.sin(a) * u.r;
    if (k === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  path.closePath();
}

/**
 * The foot of the pile, the middle of its bottom course, where its lean
 * turns about (`outline-drift.ts`), and how far its apex reaches from it — the
 * corner of the bottom course's end stone is nearer — which caps the lean.
 */
export function cairnRoot(l: Layout, body: Creature): { x: number; y: number; reach: number } {
  const r = rockRadius(l, 2);
  const step = 2 * r * INNER * (1 - BITE_UP);
  const across = 2 * r * INNER * (1 - BITE_ACROSS);
  const lift = ((COURSES.length - 1) * step) / 2;
  const x = tileCX(l, body.col + (CAIRN_COLS - 1) / 2);
  const foot = tileCY(l, body.row) + lift + r;
  const apex = (COURSES.length - 1) * step + 2 * r;
  const wide = ((COURSES[0] as number) - 1) * across * 0.5 + r;
  return { x, y: foot, reach: Math.max(apex, Math.hypot(wide, 2 * r)) };
}
