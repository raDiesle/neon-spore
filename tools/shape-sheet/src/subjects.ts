import {
  CREATURES,
  type CreatureSilhouette,
  type CrystalSilhouette,
  catmullRomToBezierPath,
  crystalRadiusMul,
  hullRadiusMul,
  livingSilhouette,
  METEOR,
  POD,
  type Point,
  QUEEN_SHELL,
  TORCH,
} from "@neon-spore/content";
import { type CreatureKind, isBossBody, isMeteorKind } from "@neon-spore/sim";
import type { Subject } from "./contour.js";
import { hull } from "./hull-subjects.js";
import { WARDEN_POSES } from "./ring.js";

export { hullArc } from "./hull-subjects.js";

/**
 * Every silhouette in the game, as a function of time.
 *
 * The shape sheet, the motion sheet and the metrics report all read this list,
 * so a shape is described once. Each subject samples its contour through the
 * *same* radius functions the canvas calls — `hullRadiusMul` for anything that
 * lives, `crystalRadiusMul` for the rock — which is the no-drift property the
 * sheet was built for, extended to the tools that measure rather than draw.
 *
 * `Subject` itself lives in `contour.ts`, beside the one function that knows
 * how its optional pieces — a hole, several loops — go together into an
 * outline.
 */

/**
 * A lobed body. The note defaults to the figures, which is what a shape being
 * measured wants; a draft passes its own, because "3 lobes · depth 0.24" says
 * nothing about why the shape was drawn that way.
 */
export function blob(name: string, s: CreatureSilhouette, note?: string): Subject {
  // `sizeMul` is the Runt's whole "tiny" — render/creatures.ts folds it into
  // the draw scale, and a subject that dropped it would show the Runt at the
  // Bulb's size on the one sheet built to answer "how big does it actually
  // read" (docs/queue.md, THE SHAPE SHEET CANNOT SEE HALF THE BESTIARY).
  const sizeMul = s.sizeMul ?? 1;
  return {
    name,
    note:
      note ??
      `${s.lobes} lobes · depth ${s.depth} · wobble ${s.wobble}${
        s.sizeMul ? ` · ${s.sizeMul}× size` : ""
      }`,
    open: false,
    pointsAt(t) {
      const pts: Point[] = [];
      const N = 40;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const m = hullRadiusMul(a, s.lobes, s.depth, s.wobble, t, s.seed) * sizeMul;
        pts.push({ x: Math.cos(a) * s.rx * m, y: Math.sin(a) * s.ry * m });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}

/**
 * Every `CreatureKind` `render/creatures.ts` draws through `drawLiving` — a
 * contour plus own-motion, as opposed to a crystal (`isMeteorKind`) or a body
 * with its own draw path (`isBossBody`, and the tether, which has no body at
 * all). Read off `CREATURES` and the same predicates `drawCreatures` calls, so
 * a kind added to the bestiary reaches the sheet without a second list here
 * drifting from render's own branch on what to draw.
 *
 * **`lure` is excluded, and its exclusion is the sheet agreeing with the
 * game.** A lure has no contour of its own: `drawLiving` resolves `wornKind`
 * first and draws a slick or a bulb. A card for it would be a second card
 * drawing a shape already on the sheet, and `nameability.ts` said so the
 * moment it was let in — it found the lure and the slick identical on all
 * three axes, which is not a defect in the shape but the whole creature.
 *
 * **`clasp` is excluded for the same reason and a different creature.** It
 * also draws through `wornKind`, so its body is a slick or a bulb; what makes
 * it a clasp is the shield laid over the top, which `render/clasp.ts` draws
 * after `drawLiving` has finished and which is not a contour at all. The
 * catalogue is a sheet of *silhouettes*, and a membrane around one is not a
 * second silhouette. `nameability.ts` found this one too, on the same three
 * axes and within a minute of it existing.
 */
export function livingKinds(): CreatureKind[] {
  return (Object.keys(CREATURES) as CreatureKind[]).filter(
    (kind) =>
      kind !== "tether" &&
      kind !== "lure" &&
      kind !== "clasp" &&
      kind !== "shell" &&
      // And THE VEIL, for the same reason as the three above it: the cloud is
      // weather laid over a slick or a bulb, and weather is a picture rather
      // than a contour (`render/veil.ts`). A VEIL card here would draw the
      // fallback silhouette and put a slick on the sheet under another name.
      kind !== "veil" &&
      !isBossBody(kind) &&
      !isMeteorKind(kind),
  );
}

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

const meteor = crystal("METEOR", METEOR, 46, `${METEOR.sides} facets · dead rock`);
const torch = crystal("TORCH", TORCH, 70, `${TORCH.sides} facets · three tiles wide, burning`);

/**
 * One subject per living kind, in bestiary order — `slick` and `bulb` first,
 * because that is where `CREATURES` puts them, then whatever is added after.
 * Named by the kind itself (`"RUNT"`, `"THROB"`) rather than by a label chosen
 * here, so the name on the sheet is never a second spelling of the one in
 * `packages/content/src/creatures.ts`.
 */
const LIVING_SUBJECTS: Subject[] = livingKinds().map((kind) =>
  blob(kind.toUpperCase(), livingSilhouette(kind)),
);

export const SUBJECTS: Subject[] = [
  ...LIVING_SUBJECTS,
  blob("POD", POD),
  meteor,
  torch,
  crystal("BULB QUEEN", QUEEN_SHELL, 100, `${QUEEN_SHELL.sides} facets · armoured shell`),
  hull(false),
  hull(true),
  hull(true, 0.05),
  hull(false, 0, 1),
  ...WARDEN_POSES,
];
