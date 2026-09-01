import type { Point } from "@neon-spore/content";
import { linePath, type Subject } from "../contour.js";

/**
 * A body made of hard plates hinged end to end, which can bend and can close
 * on itself.
 *
 * Written for the thing `docs/tower-defence.md` says the bodies converted off
 * five games before it did not reach: **a hard polygon that is alive.** `crystal` in `subjects.ts`
 * already draws every faceted body those games put on a screen, and every one
 * reads as rock, because a rock is one rigid outline and so is a crystal. What
 * separates a woodlouse from a pebble is not that its edges are softer — they
 * are chitin — it is that there are *several* of them and they are allowed to
 * disagree. So the life is articulation and grading, never smoothing: every
 * edge is straight, drawn corner to corner through `linePath`, and what moves
 * is the angle between one plate and the next.
 *
 * It reaches the other gap by the same machinery rather than by a second idea.
 * `curl` bends the whole chain, and at 1 the chain closes on itself: a long
 * segmented body becomes a hard disc with the seams still notching its rim.
 * That is a silhouette which changes because of **what the body is doing**,
 * and the two states are one parameter apart rather than two drawings. The
 * parameter is a number *or* a function of time: a number pins a card at one
 * state, which is how the shut half of a pair is judged on its own, and the
 * two halves have to be the same shape or the pair proves nothing.
 *
 * The spine is **walked, not solved.** A circular arc parameterised by radius
 * has a singularity where it straightens, and the straight chain is exactly a
 * state this has to draw. Accumulating one turn per seam has no such case: at
 * zero the body is a bar, at `2π / plates` a closed regular polygon, between
 * them a real arc. It is also the honest model, because a seam is where a real
 * one bends and there is nowhere else it can.
 */
export interface CurledOpts {
  /** How many plates the chain is made of. */
  plates: number;
  /** One plate's length along the spine. */
  step: number;
  /** Half-thickness over the spine at the head end. */
  girth: number;
  /** What fraction of `girth` is left at the tail. */
  taper: number;
  /** How far a plate's front edge stands proud of the one it laps over. */
  lap: number;
  /** 0 the chain is straight, 1 it has closed on itself. */
  curl: number | ((t: number) => number);
  /** Radians of flex a travelling wave adds and removes at each seam. */
  snake?: number;
  /** Seconds one flex wave takes to run the length of the body. */
  period?: number;
  /** How much thinner the belly is than the back. */
  belly?: number;
}

/**
 * How far the tail and the nose project past the last and first seam, in that
 * end's own half-thickness — **and only while the body is open**. A woodlouse
 * ends in a plate rather than a point, so both are small, and both go to
 * nothing as it closes: at full curl the head and tail lie against each other,
 * and the first cut, which kept them, drew two long chords across the disc.
 */
const TAIL = 0.55;
const NOSE = 0.45;

/**
 * How close the belly is allowed to come to the middle of a fully closed body,
 * as a fraction of the radius the spine has curled onto.
 *
 * The whole difficulty of this form is here. A fixed inward offset is right
 * for an open body and wrong for a shut one: the spine closes onto a circle of
 * its own, and a fixed offset leaves an annulus — a ring, and this catalogue
 * already has two of those. A real one is not a ring, because its plates slide
 * over each other and fill the middle. So the belly is driven inward as the
 * body curls and stopped just short of the centre, which leaves a hole a
 * couple of units across: invisible at card size, and never a crossing.
 */
const CORE = 0.92;

/**
 * How far the two ends are pulled in toward the spine once the body is shut.
 *
 * A chain curled through a whole turn brings its head back against its tail,
 * and the outline has to get from the rim to the middle and out again between
 * them — a slit. A rolled woodlouse shows a *line* there, not a bite, so both
 * ends tuck as the body closes, which is also what the animal does: the head
 * shield and the tail plate are its two lowest parts.
 */
const TUCK = 0.18;

export function curled(name: string, note: string, o: CurledOpts): Subject {
  const belly = o.belly ?? 0.82;
  const snake = o.snake ?? 0;
  const period = o.period ?? 4.4;

  const outline = (t: number): Point[] => {
    const curl = typeof o.curl === "function" ? o.curl(t) : o.curl;
    const turn = (curl * Math.PI * 2) / o.plates;

    // One heading per plate. The wave perturbs the heading rather than the
    // position, so a plate stays exactly `step` long however hard the body
    // flexes — a segment that stretched is a soft body drawn with corners.
    const spine: Point[] = [{ x: 0, y: 0 }];
    const head: number[] = [];
    let a = 0;
    let x = 0;
    let y = 0;
    for (let i = 0; i < o.plates; i++) {
      const h = a + snake * Math.sin((t / period) * Math.PI * 2 - i * 0.9);
      head.push(h);
      x += Math.cos(h) * o.step;
      y += Math.sin(h) * o.step;
      spine.push({ x, y });
      a += turn;
    }

    // The circle the spine has curled onto, or nothing while it is straight —
    // an infinity rather than a special case, since a chain that is not bent
    // has no centre for the belly's clamp to be measured toward.
    const ring = turn > 1e-3 ? o.step / (2 * Math.sin(turn / 2)) : Number.POSITIVE_INFINITY;

    // Graded from head to tail. The grading is half of what makes this read as
    // alive: a chain of identical plates is a track, and a track is a machine.
    const girthAt = (i: number): number =>
      o.girth * (1 - (1 - o.taper) * (o.plates > 1 ? i / (o.plates - 1) : 0));

    /**
     * The normal at a *joint*, bisecting the two plates that meet there.
     *
     * The belly uses it everywhere and the back only at its two ends, and the
     * asymmetry is the shape. The back is otherwise offset per plate, so two
     * neighbours disagree by the whole joint angle and the rim steps at every
     * seam — that step is the armour. A belly offset the same way puts a star
     * of eighteen spikes where the middle of a tightly curled body should be;
     * one normal per joint gives it a single clean corner, and an underside is
     * smooth on the animal anyway.
     */
    const jointNormal = (i: number): Point => {
      // The two ends have one plate rather than two, and the missing one is
      // *extrapolated* rather than dropped. Using the end plate's own normal
      // fails in exactly the state this form exists for: curled tight, the
      // offset is nearly the whole radius, so a normal half a joint off radial
      // lands on the far side of the middle rather than near it — the belly's
      // two ends came out a hundred and twenty degrees apart and drew the shut
      // disc with a quarter of itself missing. Continuing the turn past each
      // end keeps every joint normal radial, and at `turn` of zero it is the
      // plate's own normal again, so there is no second case to keep in step.
      const h0 = i > 0 ? (head[i - 1] as number) : (head[0] as number) - turn;
      const h1 = i < o.plates ? (head[i] as number) : (head[o.plates - 1] as number) + turn;
      const nx = (Math.sin(h0) + Math.sin(h1)) / 2;
      const ny = (-Math.cos(h0) - Math.cos(h1)) / 2;
      const len = Math.hypot(nx, ny) || 1;
      return { x: nx / len, y: ny / len };
    };

    const pts: Point[] = [];
    // The back, head to tail. Each plate starts `lap` further out than it
    // ends, so the seam is a step rather than a crease — that step is the only
    // thing telling a shut body from a rock, and it survives at 26 px because
    // it is a notch in the outline rather than a line drawn inside it.
    const tuck = 1 - TUCK * curl;
    for (let i = 0; i < o.plates; i++) {
      const h = head[i] as number;
      const nx = Math.sin(h);
      const ny = -Math.cos(h);
      const g = girthAt(i);
      const from = spine[i] as Point;
      const to = spine[i + 1] as Point;
      // Every point on the back stands off its own plate, except the two ends
      // of the chain: those stand off the *joint*, which on a body curled
      // through a whole turn is the same direction at both, so the head's
      // first corner and the tail's last corner arrive at the same place and
      // the slit closes to a line. Off their own plates instead, the two sit a
      // plate-angle apart — a forty-unit bite out of a hundred-and-twenty-unit
      // disc, which is what the first shut card drew.
      const first = i === 0;
      const last = i === o.plates - 1;
      const lead = first ? jointNormal(0) : { x: nx, y: ny };
      const trail = last ? jointNormal(o.plates) : { x: nx, y: ny };
      const outLead = (g + o.lap) * (first ? tuck : 1);
      const outTrail = g * (last ? tuck : 1);
      pts.push({ x: from.x + lead.x * outLead, y: from.y + lead.y * outLead });
      pts.push({ x: to.x + trail.x * outTrail, y: to.y + trail.y * outTrail });
    }
    const last = head[o.plates - 1] as number;
    const end = spine[o.plates] as Point;
    const reachOut = (1 - curl) * girthAt(o.plates - 1) * TAIL;
    if (reachOut > 0.5) {
      pts.push({ x: end.x + Math.cos(last) * reachOut, y: end.y + Math.sin(last) * reachOut });
    }
    // The belly, tail back to head, and thinner: a body with the same profile
    // above and below its spine is a lozenge, and a lozenge has no up. It is
    // driven inward as the body curls so that a shut one is filled rather than
    // hollow, and stopped short of the middle by `CORE`.
    for (let i = o.plates; i >= 0; i--) {
      const n = jointNormal(i);
      // Squared, so the filling happens late. Linear in `curl` drives the
      // belly almost to the middle by a half turn, and the half-rolled frame
      // came out a solid lump with a dent rather than a body bent double.
      const g = Math.min(
        girthAt(Math.min(i, o.plates - 1)) * belly + curl * curl * o.girth,
        ring * CORE,
      );
      const at = spine[i] as Point;
      pts.push({ x: at.x - n.x * g, y: at.y - n.y * g });
    }
    const first = head[0] as number;
    const nose = spine[0] as Point;
    const reachBack = (1 - curl) * o.girth * NOSE;
    if (reachBack > 0.5) {
      pts.push({
        x: nose.x - Math.cos(first) * reachBack,
        y: nose.y - Math.sin(first) * reachBack,
      });
    }

    // Centred on its own box: the walk starts at the head, so a body that
    // curls would otherwise swing across its card as it closes, and that reads
    // as travel — which nothing on this field does.
    let x0 = Number.POSITIVE_INFINITY;
    let x1 = Number.NEGATIVE_INFINITY;
    let y0 = Number.POSITIVE_INFINITY;
    let y1 = Number.NEGATIVE_INFINITY;
    for (const p of pts) {
      if (p.x < x0) x0 = p.x;
      if (p.x > x1) x1 = p.x;
      if (p.y < y0) y0 = p.y;
      if (p.y > y1) y1 = p.y;
    }
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    return pts.map((p) => ({ x: p.x - cx, y: p.y - cy }));
  };

  return {
    name,
    note,
    open: false,
    // One loop, offered as loops on purpose. `drafts.test.ts` guards a
    // radially marched contour against falling onto its own centre, and a body
    // that closes on itself legitimately brings its belly within a few units
    // of the middle. That guard is written for a shape sampled one radius per
    // angle; this one is walked, cannot pinwheel, and is checked for enclosing
    // an area instead — which is the failure a walked outline can actually
    // have.
    loopsAt: (t) => [outline(t)],
    pointsAt: outline,
    path: linePath,
  };
}
