import {
  CRAWLER,
  CRAWLER_PULSE,
  type CrawlerSilhouette,
  type CreatureSilhouette,
  catmullRomToBezierPath,
  crawlerOutline,
  GHOST,
  type GhostSilhouette,
  GUM,
  ghostOutline,
  LID,
  type LidSilhouette,
  lidOutline,
  livingBodyKinds,
  livingPoints,
  livingSilhouette,
  MAGNET_SHAPE,
  magnetOutline,
  POD,
  type Point,
} from "@neon-spore/content";
import type { CreatureKind } from "@neon-spore/sim";
import type { Subject } from "./contour.js";
import { hull } from "./hull-subjects.js";
import { WARDEN_POSES } from "./ring.js";
import { ROCK_SUBJECTS } from "./rock-subjects.js";

export { hullArc } from "./hull-subjects.js";
// The faceted builder lives with the four cards that use it now
// (`rock-subjects.ts`); the drafts and the free contours import it from
// here, where it always was.
export { crystal } from "./rock-subjects.js";

/**
 * Every silhouette in the game, as a function of time.
 *
 * The shape sheet, the motion sheet and the metrics report all read this list,
 * so a shape is described once. Each subject samples its contour through the
 * *same* contour builders the canvas calls — `livingPoints` for anything that
 * lives, `crystalRadiusMul` for the rock — which is the no-drift property the
 * sheet was built for, extended to the tools that measure rather than draw.
 *
 * `Subject` itself lives in `contour.ts`, beside the one function that knows
 * how its optional pieces — a hole, several loops — go together into an
 * outline.
 */

/**
 * A lobed body — or, where the silhouette wears one, a lobed body with a rim of
 * clubs on it. Both come out of `livingPoints`, which is the same walk the
 * canvas draws, so the sheet cannot judge a body the game does not have.
 *
 * The note defaults to the figures, which is what a shape being measured wants;
 * a draft passes its own, because "3 lobes · depth 0.24" says nothing about why
 * the shape was drawn that way.
 */
export function blob(name: string, s: CreatureSilhouette, note?: string): Subject {
  // `sizeMul` is the Runt's whole "tiny" — render/creatures.ts folds it into
  // the draw scale, and a subject that dropped it would show the Runt at the
  // Bulb's size on the one sheet built to answer "how big does it actually
  // read" — THE SHAPE SHEET CANNOT SEE HALF THE BESTIARY, the ask this answers.
  const sizeMul = s.sizeMul ?? 1;
  return {
    name,
    // A clubbed body's core lobes are under its rim and nobody counts them, so
    // the card says the number an eye finds (`rimCount`) and drops the other.
    note:
      note ??
      `${s.clubs ? `${s.clubs.clubs} clubs` : `${s.lobes} lobes`} · depth ${s.depth}${
        s.clubs ? "" : ` · wobble ${s.wobble}`
      }${s.sizeMul ? ` · ${s.sizeMul}× size` : ""}`,
    open: false,
    pointsAt(t) {
      return livingPoints(s, t).map((p) => ({ x: p.x * sizeMul, y: p.y * sizeMul }));
    },
    path: catmullRomToBezierPath,
  };
}

/**
 * Every `CreatureKind` `render/creatures.ts` draws through `drawLiving` — a
 * contour plus own-motion, as opposed to a crystal, a body with its own draw
 * path, or one drawn as the body it wears.
 *
 * **This used to be the exclusion list, and that is the point of the change.**
 * It named `tether`, `lure`, `clasp`, `shell` and `veil` by hand and then asked
 * two predicates about the rest — seven clauses, kept in step with render's own
 * branch by nothing but attention. A kind added to the bestiary and not to this
 * list got a card drawing the fallback silhouette, which is to say a slick on
 * the sheet under another name; `nameability.ts` caught the lure and the clasp
 * that way, after they were already on it, and only because their shapes
 * happened to collide with one already there.
 *
 * It asks `living-look.ts` now, which is the same table the field draws from,
 * so the sheet and the game cannot disagree about what has a body — and a new
 * kind reaches the sheet, or stays off it, without anything here being edited.
 * The reasoning for each `null` is written beside that kind's row.
 */
export function livingKinds(): CreatureKind[] {
  return livingBodyKinds();
}

/**
 * A dome over a hanging hem — THE GHOST, and the third contour family the
 * sheet knows about.
 *
 * It samples `ghostOutline` itself rather than a radius function, which is
 * exactly what the two builders either side of it do with theirs: the same
 * geometry the canvas strokes, so a shape judged here is the shape that
 * ships. There is no radial `…RadiusMul` for it to call because a ghost is
 * not radial — `content/ghost-shape.ts` is the whole of that argument.
 */
export function ghost(name: string, s: GhostSilhouette, note: string): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt: (t) => ghostOutline(s.rx, s.ry, s.tails, s.skirt, s.wobble, t, s.seed),
    path: catmullRomToBezierPath,
  };
}

/**
 * Two arcs meeting at a corner either side — THE LID, and the fourth contour
 * family the sheet knows about.
 *
 * It samples `lidOutline` for `ghost`'s reason one shape along: the same
 * geometry the canvas strokes, so what is judged here is what ships. There is
 * no radial `…RadiusMul` for it to call, because an eye is not radial —
 * `content/lid-shape.ts` is the whole of that argument.
 */
export function lid(name: string, s: LidSilhouette, note: string): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt: (t) => lidOutline(s.rx, s.ry, s.droop, s.wobble, t, s.seed),
    path: catmullRomToBezierPath,
  };
}

/**
 * One link of THE CRAWLER. `t` is a wall clock everywhere else on this sheet
 * and here it is read as beats, which is right rather than convenient: the
 * contraction is on the shared clock (`CRAWLER_PULSE`), because a wave the
 * pair counts links along has to run at the same rate on both phones.
 */
/**
 * THE MAGNET, and the one contour here with a straight edge in it. Walked from
 * `magnetOutline` for THE LID's reason — the same geometry the canvas strokes
 * — and joined with straight lines rather than through the spline, because a
 * slab's corner rounded on the way to a sheet is a corner nobody gets to judge.
 */
export function magnet(name: string, note: string): Subject {
  const at = (p: Point): string => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  return {
    name,
    note,
    open: false,
    pointsAt: () => magnetOutline(46),
    path: (pts) =>
      `M ${at(pts[0] ?? { x: 0, y: 0 })} ${pts
        .slice(1)
        .map((p) => `L ${at(p)} `)
        .join("")}Z`,
  };
}

export function crawler(name: string, s: CrawlerSilhouette, note: string): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt: (t) => crawlerOutline(s.rx, s.ry, s.taper, s.pulse, CRAWLER_PULSE.squeezeAt(t, 0)),
    path: catmullRomToBezierPath,
  };
}

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
  // Not in `LIVING_SUBJECTS`, because that list is every kind `drawLiving`
  // draws and this one is drawn by `render/ghost.ts` — the same reason the
  // rock and the queen's shell are named by hand below.
  ghost("GHOST", GHOST, `${GHOST.tails} tails · dome over a hanging hem`),
  // Off `LIVING_SUBJECTS` for THE GHOST's reason: it is drawn by
  // `render/lid.ts` rather than by `drawLiving`, so `living-look.ts` gives it
  // no row and nothing here is generated for it.
  lid("LID", LID, `${LID.lashes} lashes · two arcs meeting at a corner`),
  // Off `LIVING_SUBJECTS` once more: a horseshoe with a hole through it is no
  // radius sampled round a centre, so `living-look.ts` gives it no row.
  magnet("MAGNET", `an arch on two poles · a plate slung ${MAGNET_SHAPE.plateDrop} radii under it`),
  // Off `LIVING_SUBJECTS` for THE LID's reason again: one link of a worm is
  // drawn by `render/crawler.ts` rather than by `drawLiving`, so
  // `living-look.ts` gives it no row. Drawn at the top of its contraction, so
  // the card shows the widest a link ever is — which is the one measurement
  // that decides whether a run of them reads as an animal or as a stack.
  crawler("CRAWLER", CRAWLER, `an egg on its side · ${CRAWLER.taper} taper · overlapping rings`),
  blob("POD", POD),
  // THE GUM's body in the air — THE WEIGHT's sac, brought over from the drafts
  // (`content/silhouettes-gum.ts`). Off `LIVING_SUBJECTS` because
  // `living-look.ts` gives it no row: `render/gum.ts` draws it, and on the
  // ship it is a smear rather than this contour at all.
  blob("GUM", GUM, "a sac hung heavy, narrow at the top · THE WEIGHT's draft, on the field"),
  // The faceted four, in one list of their own: the rock, the same rock with
  // its rider on it, the torch and the queen's shell (`rock-subjects.ts`).
  ...ROCK_SUBJECTS,
  hull(false),
  hull(true),
  hull(true, 0.05),
  hull(false, 0, 1),
  ...WARDEN_POSES,
];
