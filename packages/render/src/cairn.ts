import { CAIRN_BITE_ACROSS, CAIRN_BITE_UP, CAIRN_COURSES } from "@neon-spore/content";
import { CAIRN_COLS, type CairnState, type Creature, type World } from "@neon-spore/sim";
import { signedHash } from "./hash.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { drawRockBody } from "./meteor.js";
import { meteorLookFor } from "./meteor-looks.js";
import { PALETTE } from "./palette.js";
import { rockRadius } from "./torch.js";

/**
 * THE CAIRN, drawn: seven of the field's own rocks stacked four, two and one,
 * held in one outline.
 *
 * **Every unit is the game's two-tile rock and is drawn by the code that draws
 * one** — `drawRockBody`, at `rockRadius(l, 2)`, under the look the pile drew
 * once for the whole of itself. That is not a saving, it is the creature: the
 * boss comes apart into ordinary rocks, so the parts have to *be* ordinary
 * rocks while they are still stacked. A pile painted as one boss-shaped mass
 * would promise a body, and what the pair gets when they pull is a stone.
 *
 * **One look for all seven**, taken from the body's own id rather than each
 * unit's index: three materials mixed in one stack would read as a heap of
 * different things somebody swept together, and this is one thing made of
 * seven of the same thing.
 *
 * **The outline is a clip and the seams are a stroke.** Every unit's polygon
 * goes into one `Path2D`; filling it would be the union, and clipping to it is
 * the same union used the other way round — so the stones are painted inside
 * the pile's own silhouette and nothing, halo included, reaches past it. Then
 * the same path is stroked, which draws every unit's edge: the ones on the
 * outside are the silhouette and the ones buried inside are the seams, and the
 * seams are the point. Counting the units is counting the fight.
 *
 * Nothing here decides anything. How many units are stacked is `CairnState`,
 * which lane the pile is about to drop one into is `cairn-settle.ts` on the
 * one screen that may see it, and both are read rather than derived.
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
 */
export function cairnUnits(l: Layout, body: Creature, units: number, time: number): CairnUnit[] {
  const r = rockRadius(l, 2);
  const inner = r * INNER;
  const across = 2 * inner * (1 - BITE_ACROSS);
  const step = 2 * inner * (1 - BITE_UP);
  const cx = tileCX(l, body.col + (CAIRN_COLS - 1) / 2);
  const cy = tileCY(l, body.row);
  const lift = ((COURSES.length - 1) * step) / 2;
  const out: CairnUnit[] = [];
  let slot = 0;
  for (let c = 0; c < COURSES.length && slot < units; c++) {
    const n = COURSES[c] as number;
    for (let i = 0; i < n && slot < units; i++) {
      const drift = r * 0.02;
      out.push({
        x:
          cx +
          (i - (n - 1) / 2) * across +
          Math.sin(time * 1.7 + slot * 2.1) * drift +
          signedHash(body.id, slot, 1) * r * 0.05,
        // Screen y grows downward, so course 0 — the widest — sits at the
        // bottom and the apex is the one taken off first.
        y:
          cy -
          (c * step - lift) +
          Math.cos(time * 1.3 + slot * 1.7) * drift +
          signedHash(body.id, slot, 2) * r * 0.04,
        r,
        slot,
      });
      slot++;
    }
  }
  return out;
}

/** Every unit's facets as one path, which is the pile's outline and its seams
 * at once. `drawRockBody` draws its own stone; this is only the boundary, so
 * it is a plain polygon rather than the wobbled contour underneath — a clip
 * that tracked every facet's wobble would shave the stones it is holding. */
function pilePath(units: readonly CairnUnit[]): Path2D {
  const path = new Path2D();
  for (const u of units) {
    const spin = signedHash(u.slot, 3) * Math.PI;
    for (let k = 0; k < 7; k++) {
      const a = spin + (k / 7) * Math.PI * 2;
      const x = u.x + Math.cos(a) * u.r;
      const y = u.y + Math.sin(a) * u.r;
      if (k === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    path.closePath();
  }
  return path;
}

/** The pile. `units` is the simulation's count and nothing here may change it. */
export function drawCairn(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  body: Creature,
  boss: CairnState,
  time: number,
): void {
  const stack = cairnUnits(l, body, boss.units, time);
  if (stack.length === 0) return;
  const look = meteorLookFor(body.id);
  const path = pilePath(stack);
  ctx.save();
  ctx.clip(path);
  for (const u of stack) {
    drawRockBody(ctx, u.x, u.y, u.r, time, body.id * 31 + u.slot, 0, look);
  }
  // Inside the clip, so the silhouette's stroke keeps its inner half and the
  // pile does not grow a rim half a line wider than the shape it is.
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.lineWidth = Math.max(1, l.tile * 0.05);
  ctx.stroke(path);
  ctx.restore();
}

/** Whether this world has a pile standing in it, and which. The renderer asks
 * rather than testing the tag itself — three passes want the answer. */
export function cairnBody(world: World, boss: CairnState): Creature | undefined {
  return world.creatures.find((c) => c.id === boss.creatureId);
}
