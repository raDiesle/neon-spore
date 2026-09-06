import {
  type CrystalSilhouette,
  crystalRadiusMul,
  METEOR,
  type Point,
  QUEEN_SHELL,
  TORCH,
} from "@neon-spore/content";
import type { Subject } from "./contour.js";
import { veerSubject } from "./veer-subject.js";

/**
 * Everything on this sheet that is faceted rather than grown: the builder that
 * draws a crystal, and the four cards made with it.
 *
 * Split out of `subjects.ts` when THE VEER's rider took that file past its
 * 250-line limit, and along a seam it already had. Next door is one paragraph
 * per *family* of contour — a lobed body, a dome over a hem, an eye, a link of
 * a worm — and each of those is a builder with no instances beside it, because
 * the bodies that use them are generated from `living-look.ts`. The rocks are
 * the opposite shape of thing: one builder and four hand-written instances,
 * named by hand because no table in `packages/content` lists them.
 *
 * `subjects.ts` re-exports `crystal`, so `free-contours.ts` and the drafts go
 * on importing it from where they always did — the split is about how much of
 * one file a reader has to hold at once, not about who may call what.
 */

export function crystal(name: string, s: CrystalSilhouette, radius: number, note: string): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const pts: Point[] = [];
      for (let i = 0; i < s.sides; i++) {
        const a = (i / s.sides) * Math.PI * 2;
        const m = crystalRadiusMul(a, s.sides, s.depth, s.wobble, t, s.seed);
        pts.push({ x: Math.cos(a) * radius * m, y: Math.sin(a) * radius * m });
      }
      return pts;
    },
    path(pts) {
      const head = `M ${pts[0]!.x.toFixed(2)} ${pts[0]!.y.toFixed(2)} `;
      return `${
        head +
        pts
          .slice(1)
          .map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)} `)
          .join("")
      }Z`;
    },
  };
}

/** The radius the plain rock is drawn at, named because THE VEER is drawn at
 * the same one — a rider fitted to a different stone would be a figure nobody
 * could compare with the one beside it. */
const ROCK_R = 46;

const meteor = crystal("METEOR", METEOR, ROCK_R, `${METEOR.sides} facets · dead rock`);

/**
 * The four, in the order the sheet shows them.
 *
 * THE VEER sits directly after the stone it is made of, and it is the one card
 * here that is not a bare crystal: the same rock with its rider laid over the
 * top, which is a different word from the bare one and had no card until 6
 * September 2026. `veer-subject.ts` argues why it is one at all, and why it is
 * built out of the meteor rather than drawn a second time beside it.
 */
export const ROCK_SUBJECTS: Subject[] = [
  meteor,
  veerSubject(meteor, ROCK_R),
  crystal("TORCH", TORCH, 70, `${TORCH.sides} facets · three tiles wide, burning`),
  crystal("BULB QUEEN", QUEEN_SHELL, 100, `${QUEEN_SHELL.sides} facets · armoured shell`),
];
