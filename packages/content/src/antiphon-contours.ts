import { blobRadiusMul, crystalRadiusMul } from "./shapes.js";

/**
 * **THE ANTIPHON's table of contours** — the sixteen shapes the body can
 * grow, by the index the simulation knows them as (`sim/config-antiphon.ts`
 * `antiphonShapes`), in the four families the rail closes in on
 * (`antiphonFamily`: four consecutive indices, a lobe apart).
 *
 * The simulation never sees a shape; it grows an index, and this file is
 * what the index looks like. Every family is one draft from
 * `tools/shape-sheet/src/drafts/` — the rule that a new shape is never one
 * the game already draws (`CLAUDE.md`), taken four times: **REVERB** (three
 * lobes), **SMOKE** (six shallow ones under a wobble), **PRISM** (three
 * facets) and **MOULT** (eleven, freed when THE MOULT was built without
 * it). Within a family the four are the draft and three that differ from
 * it by the one thing a sentence can say — *a lobe more*, *pinched*, *the
 * bottom one long* — so the tight rail (`antiphonTightPits`) is a rail
 * where the difference has to be described rather than the shape.
 *
 * A contour is a radius multiplier at an angle, the way every body's is
 * (`blobRadiusMul`, `crystalRadiusMul`), so the renderer walks it the way it
 * walks a creature and the shape sheet could measure it the same way.
 * `aspect` is the height over the width, so *the bottom one long* is an
 * ellipse and not a lobe the family does not have. The organ turning under
 * a hand (the design's one time effect) is not here — `turn` would be its
 * one number, and no gesture turns anything yet.
 */

/** One shape on the table: a lobed blob or a faceted crystal, and how tall it stands for its width. */
export interface AntiphonContour {
  /** The draft it came off, for the sheet; one name per family. */
  family: string;
  /** What separates it from the family's draft, in the words the pilot will need. */
  said: string;
  form: "blob" | "crystal";
  /** Lobes for a blob, facets for a crystal. */
  count: number;
  depth: number;
  wobble: number;
  seed: number;
  /** Height over width. One is round. */
  aspect: number;
}

function blob(
  family: string,
  said: string,
  count: number,
  depth: number,
  wobble: number,
  seed: number,
  aspect = 1,
): AntiphonContour {
  return { family, said, form: "blob", count, depth, wobble, seed, aspect };
}

function crystal(
  family: string,
  said: string,
  count: number,
  depth: number,
  wobble: number,
  seed: number,
  aspect = 1,
): AntiphonContour {
  return { family, said, form: "crystal", count, depth, wobble, seed, aspect };
}

/**
 * The table. Index is identity: a pit remembers the index, and a shape
 * moved would be a pit that lied. Append, never reorder.
 */
export const ANTIPHON_CONTOURS: readonly AntiphonContour[] = [
  // REVERB — three lobes, and what three lobes can be.
  blob("REVERB", "three lobes", 3, 0.24, 0.06, 6.1),
  blob("REVERB", "three lobes, the bottom one long", 3, 0.24, 0.06, 6.1, 1.35),
  blob("REVERB", "three lobes, pinched", 3, 0.42, 0.06, 6.1),
  blob("REVERB", "four lobes", 4, 0.24, 0.06, 6.1),
  // SMOKE — shallow lobes under a wobble that blurs the edge.
  blob("SMOKE", "six soft lobes", 6, 0.07, 0.17, 7.4),
  blob("SMOKE", "five soft lobes", 5, 0.07, 0.17, 7.4),
  blob("SMOKE", "six lobes, cut deep", 6, 0.2, 0.17, 7.4),
  blob("SMOKE", "six soft lobes, wide", 6, 0.07, 0.17, 7.4, 0.7),
  // PRISM — a wedge, and the wedges beside it.
  crystal("PRISM", "three facets", 3, 0.1, 0.01, 2.4),
  crystal("PRISM", "four facets", 4, 0.1, 0.01, 2.4),
  crystal("PRISM", "three facets, sharp", 3, 0.28, 0.01, 2.4),
  crystal("PRISM", "three facets, tall", 3, 0.1, 0.01, 2.4, 1.4),
  // MOULT — a shell under pressure, and the shells beside it.
  crystal("MOULT", "eleven facets", 11, 0.26, 0.03, 12.0),
  crystal("MOULT", "nine facets", 9, 0.26, 0.03, 12.0),
  crystal("MOULT", "eleven facets, shallow", 11, 0.12, 0.03, 12.0),
  crystal("MOULT", "eleven facets, squat", 11, 0.26, 0.03, 12.0, 0.75),
];

/** The radius multiplier of contour `shape` at angle `a` and time `t`; a shape off the table is round. */
export function antiphonRadiusMul(shape: number, a: number, t: number): number {
  const c = ANTIPHON_CONTOURS[shape];
  if (c === undefined) return 1;
  const m =
    c.form === "blob"
      ? blobRadiusMul(a, c.count, c.depth, c.wobble, t, c.seed)
      : crystalRadiusMul(a, c.count, c.depth, c.wobble, t, c.seed);
  // The aspect stretches the height: the multiplier at `a` is scaled by the
  // ellipse's own radius there, so a tall one is tall and its lobes stay put.
  const s = Math.sin(a);
  const cs = Math.cos(a);
  return m * Math.sqrt(cs * cs + s * s * c.aspect * c.aspect);
}
