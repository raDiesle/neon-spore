import { INSTAR_PARTS, type InstarPart, type SimEvent } from "@neon-spore/sim";
import type { InstarFx } from "./instar-fx.js";
import { instarAt, type Point } from "./instar-place.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **What each of THE INSTAR's events does to its fx** — the switch cut out of
 * `instar-fx.ts` when the per-bolt hurt took that class to nineteen lines
 * under the ceiling (27 September 2026). The class holds the state; this
 * says what an event changes in it, one case an event, in the order the
 * body meets them.
 *
 * **The bursts land on the marks.** An event carries a mark's *index* and
 * only the picture knows where that part is drawn, so the places are the
 * ones the drawer handed `InstarFx.place` this frame; a receipt with no mark
 * bursts at the head.
 */

/** Where the marks, the head and its radius were drawn this frame, and what
 * kind of mark each one is — written by `InstarFx.place`, read here. */
export interface InstarSpots {
  marks: Point[];
  /** Whether each mark of this step is a swipe, which is what drops an egg:
   * a tap on the brood squashes it where it lies. */
  swipes: boolean[];
  /** Whether each mark of this step is a shoot mark, whose every counted
   * bolt is a hit the body shows (`BossHurt.jab`). */
  shoots: boolean[];
  head: Point | null;
  headR: number;
}

export function noSpots(): InstarSpots {
  return { marks: [], swipes: [], shoots: [], head: null, headR: 0 };
}

const JOLT_TILES = 0.15;
const FLINCH = 1;

type Burst = (x: number, y: number, n: number, hex: string) => void;

export function ingestInstar(fx: InstarFx, e: SimEvent, l: Layout, burst: Burst): void {
  const spots = fx.spots;
  const head = spots.head ?? instarAt(l, 500, 300);
  const at = (p: Point, n: number, hex: string) => burst(p.x, p.y, n, hex);
  const mark = (i: number): Point => spots.marks[i] ?? head;
  switch (e.type) {
    case "instarEnter":
      at(head, 10, PALETTE.dim);
      break;
    case "instarMorph":
      at(head, 8, PALETTE.hull);
      fx.verdicts.clear();
      fx.strike.soften();
      break;
    case "instarShow":
      for (const p of spots.marks) at(p, 5, PALETTE.red);
      break;
    case "instarRefuse":
      at(mark(e.mark), 4, PALETTE.dim);
      fx.flinch = FLINCH;
      fx.verdicts.mark(e.mark, false);
      break;
    case "instarAnswer":
      at(mark(e.mark), 3, PALETTE.redRim);
      fx.verdicts.mark(e.mark, true);
      if (spots.shoots[e.mark] === true) fx.hurt.jab();
      if (e.part !== "eggs") break;
      if (spots.swipes[e.mark] === false) fx.eggs.squash(mark(e.mark), spots.headR || l.tile);
      else fx.eggs.drop(mark(e.mark), l.hullY, spots.headR || l.tile);
      break;
    case "instarShove":
      fx.shove.hit(e.mark, e.pushMilli);
      break;
    case "instarDone":
      at(mark(e.mark), 8, PALETTE.hullRim);
      fx.jolt = Math.max(fx.jolt, JOLT_TILES * 0.4);
      fx.verdicts.mark(e.mark, true);
      break;
    case "instarSlip":
      at(mark(e.mark), 4, PALETTE.dim);
      fx.flinch = FLINCH * 0.7;
      fx.verdicts.mark(e.mark, false);
      break;
    case "instarLand":
      at(head, 14, PALETTE.hull);
      fx.jolt = JOLT_TILES;
      fx.hurt.hit();
      break;
    case "instarStrike":
      at({ x: tileCX(l, e.col), y: l.hullY }, 16, PALETTE.red);
      // A part THE INSTAR does not have is THE NETTLE's, not this body's.
      if (!isInstarPart(e.part)) break;
      fx.strike.hit(
        e.part,
        e.part === "jaw" || e.part === "fire" ? [head] : spots.marks,
        tileCX(l, e.col),
      );
      fx.jolt = JOLT_TILES * 2;
      break;
    case "instarDown":
      at(head, 30, PALETTE.hullRim);
      fx.jolt = JOLT_TILES * 2;
      fx.hurt.hit();
      break;
    case "instarOut":
      at(head, 12, PALETTE.dim);
      break;
    default:
      break;
  }
}

function isInstarPart(part: string): part is InstarPart {
  return (INSTAR_PARTS as readonly string[]).includes(part);
}
