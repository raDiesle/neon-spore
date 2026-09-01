import type { Point } from "@neon-spore/content";
import { linePath, type Subject } from "../contour.js";

/**
 * One hard body that is two, hinged at the nose and able to swing open.
 *
 * The gap this is drawn at is the first of the two `docs/tower-defence.md`
 * leaves open: a silhouette that changes because of **what the body is
 * doing**, rather than because of what it is. Almost everything in this
 * catalogue is one outline breathing. `shed` steps down as it is damaged and
 * `plated` moves the live plate along its underside, but neither of them stops
 * being the same object; this one comes apart into two and back, and the state
 * is legible from the outline alone at any size — a wedge of field where a
 * body used to be closed.
 *
 * A beetle's elytra, which is the plainest version of the claim in nature and
 * the one that survives being drawn in white on black: the wing cases are hard
 * plates, they are shut and unremarkable most of the time, and they hinge up
 * before anything happens. What that buys a game like ours is a body that says
 * *now* with its shape instead of with a colour or a bar.
 *
 * **Nothing is drawn between the halves, and that is a decision rather than an
 * omission.** A soft core showing through the gap is the obvious next thought
 * and it is two mistakes: the cards are filled with `fill-rule: evenodd`, so a
 * loop inside two others punches a hole in them the moment they close over it
 * — but more than that, `guarded` already draws a body with a separate piece
 * beside it, and adding a core here would make this the same card with an
 * extra step. The claim that is *only* here is the split itself: one hard
 * outline becoming two hard outlines, with the field between them.
 *
 * `gape` is a number or a function of time for the reason `curled`'s `curl`
 * is: a pair of cards showing an open state and a shut one only proves
 * something if both are the same shape with one parameter moved.
 */
export interface ValvedOpts {
  /** Half-length, nose to tail, of the shut body. */
  ry: number;
  /** Half-width of the shut body where it is widest. */
  rx: number;
  /** Facets down the outer edge of one half. Few: a facet has to be visible. */
  facets: number;
  /** How far one half swings at full gape, in radians. */
  swing: number;
  /** 0 shut, 1 open. A number pins the card; a function animates it. */
  gape: number | ((t: number) => number);
  /** Where the hinge sits along the body, 0 at the nose and 1 at the tail. */
  hinge: number;
}

/**
 * The outer edge as a fraction of `rx`, at `f` of the way from nose to tail.
 *
 * Two runs with a corner between them, because that corner is the shoulder and
 * the shoulder is what stops a hard half-shell reading as a leaf. It rounds up
 * to full width over the first third — sampled coarsely, so those samples are
 * the facets — and then falls away in one long, almost straight flank to a
 * blunt tail. A tail that came to a point would draw two halves as two blades.
 */
function flank(f: number): number {
  if (f < 0.3) return 0.16 + 0.84 * Math.sin((f / 0.3) * (Math.PI / 2));
  return 1 - 0.62 * ((f - 0.3) / 0.7) ** 1.35;
}

export function valved(name: string, note: string, o: ValvedOpts): Subject {
  const hinge: Point = { x: 0, y: -o.ry + 2 * o.ry * o.hinge };

  /**
   * One half, mirrored by `side` and swung about the hinge by `angle`.
   *
   * The seam is walked as its own two corners rather than left to the closing
   * `Z`, so a shut body has a real edge down its middle where the two halves
   * meet. That edge is the whole tell in the shut state: without it this is a
   * hard lozenge, and a hard lozenge is a rock.
   */
  const half = (side: number, angle: number, breath: number): Point[] => {
    const raw: Point[] = [];
    for (let i = 0; i <= o.facets; i++) {
      const f = i / o.facets;
      raw.push({ x: side * o.rx * flank(f) * breath, y: (-o.ry + 2 * o.ry * f) * breath });
    }
    raw.push({ x: 0, y: o.ry * breath });
    raw.push({ x: 0, y: -o.ry * breath });
    // Negated: on a page whose y runs downward, a positive turn carries the
    // tail of the right-hand half *across* the seam rather than away from it,
    // and the two halves swap sides instead of opening.
    const c = Math.cos(-angle * side);
    const s = Math.sin(-angle * side);
    return raw.map((p) => {
      const dx = p.x - hinge.x;
      const dy = p.y - hinge.y;
      return { x: hinge.x + dx * c - dy * s, y: hinge.y + dx * s + dy * c };
    });
  };

  const loopsAt = (t: number): Point[][] => {
    const gape = typeof o.gape === "function" ? o.gape(t) : o.gape;
    // A shut body still has to be alive, or the pinned card is a diagram. Two
    // percent is under the wobble every grown shape here carries and is the
    // most a hard thing can breathe without reading as soft.
    const breath = 1 + 0.02 * Math.sin(t * 0.7);
    const angle = gape * o.swing;
    return [half(1, angle, breath), half(-1, angle, breath)];
  };

  return {
    name,
    note,
    open: false,
    loopsAt,
    pointsAt: (t) => loopsAt(t).flat(),
    path: linePath,
  };
}
