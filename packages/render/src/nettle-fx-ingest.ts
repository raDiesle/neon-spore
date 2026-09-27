import { NETTLE_PARTS, type NettlePart, type ScenePart, type SimEvent } from "@neon-spore/sim";
import { instarAt, type Point } from "./instar-place.js";
import { type Layout, tileCX } from "./layout.js";
import type { NettleFx } from "./nettle-fx.js";
import { PALETTE } from "./palette.js";

/**
 * **What each of THE NETTLE's events does to its fx** — THE INSTAR's switch
 * (`instar-fx-ingest.ts`) read for this body: the same engine says the same
 * events, and `effects-boss.ts` hands them here rather than there when the
 * world's boss is THE NETTLE. One case an event, in the order the body
 * meets them.
 *
 * **The bursts land on the marks**, which stand at the script's own places
 * over the parts they undo (`nettle-script.ts`): the places are the ones the
 * drawer handed `NettleFx.place` this frame, and a receipt with no mark
 * bursts at the bell.
 */

/** Where the marks and the bell were drawn this frame, and what each mark is
 * — written by `NettleFx.place`, read here. */
export interface NettleSpots {
  marks: Point[];
  /** The part each mark of this step sits on: the strike comes out of them. */
  parts: ScenePart[];
  /** Whether each mark is a shoot mark, whose every counted bolt the body shows. */
  shoots: boolean[];
  bell: Point | null;
  bellR: number;
}

export function noNettleSpots(): NettleSpots {
  return { marks: [], parts: [], shoots: [], bell: null, bellR: 0 };
}

const JOLT_TILES = 0.15;
const FLINCH = 1;

type Burst = (x: number, y: number, n: number, hex: string) => void;

export function ingestNettle(fx: NettleFx, e: SimEvent, l: Layout, burst: Burst): void {
  const spots = fx.spots;
  const bell = spots.bell ?? instarAt(l, 500, 450);
  const bellR = spots.bellR || l.tile * 3;
  const at = (p: Point, n: number, hex: string) => burst(p.x, p.y, n, hex);
  const mark = (i: number): Point => spots.marks[i] ?? bell;
  switch (e.type) {
    case "instarEnter":
      at(bell, 10, PALETTE.dim);
      break;
    case "instarMorph":
      at(bell, 8, PALETTE.hull);
      fx.verdicts.clear();
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
      at(bell, 14, PALETTE.hull);
      fx.jolt = JOLT_TILES;
      fx.hurt.hit();
      break;
    case "instarStrike": {
      const x = tileCX(l, e.col);
      at({ x, y: l.hullY }, 16, PALETTE.red);
      // A part THE NETTLE does not have is THE INSTAR's, not this body's.
      if (!isNettlePart(e.part)) break;
      const from = spots.marks.filter((_, i) => spots.parts[i] === e.part);
      fx.strike.hit(e.part, from, bell, bellR, x);
      fx.jolt = JOLT_TILES * 2;
      break;
    }
    case "instarDown":
      at(bell, 30, PALETTE.hullRim);
      fx.jolt = JOLT_TILES * 2;
      fx.hurt.hit();
      fx.death.start(bell, bellR);
      break;
    case "instarOut":
      at(bell, 12, PALETTE.dim);
      break;
    default:
      break;
  }
}

function isNettlePart(part: string): part is NettlePart {
  return (NETTLE_PARTS as readonly string[]).includes(part);
}
