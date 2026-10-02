import { INSTAR_HEAD } from "./instar-head-look.js";
import type { Look } from "./instar-plate.js";

/** A smooth curve through `knots` (u, value), flat at each knot. */
function through(knots: readonly (readonly [number, number])[]): (u: number) => number {
  return (u) => {
    const x = Math.max(0, Math.min(1, u));
    for (let i = 1; i < knots.length; i++) {
      const [u1, v1] = knots[i] as readonly [number, number];
      if (x > u1 && i < knots.length - 1) continue;
      const [u0, v0] = knots[i - 1] as readonly [number, number];
      const t = (x - u0) / (u1 - u0 || 1);
      return v0 + (v1 - v0) * (0.5 - 0.5 * Math.cos(Math.PI * t));
    }
    return (knots[0] as readonly [number, number])[1];
  };
}

/** A dragon's line: a slender neck out of the skull, swelling to a deep chest
 * over the shoulders, drawn in at the waist, full again over the haunches, and
 * narrowing into the tail. */
const girth = through([
  [0, 0.32],
  [0.16, 0.4],
  [0.4, 0.9],
  [0.62, 0.64],
  [0.8, 0.72],
  [1, 0.36],
]);

/**
 * **THE INSTAR's side-on body, as the one record its widths are read from**
 * (`docs/spec/living-bosses.md` §2). Every length is in head radii and every
 * `u` runs 0 at the neck to 1 at the rear (or, for the tail, root to blade).
 *
 * **It has a dragon's weight**, picked by the owner from VERSUS on 2 October
 * 2026 after three rounds — *the body is too thin and does not look cool*,
 * then *each body piece looks like it does not belong together*, then *make
 * body more natural shape of a dragon*. So the spine starts inside the skull,
 * a slender neck swells to a deep chest over the shoulders, draws in at the
 * waist and fills again over the haunches; the tail's root is the rear's own
 * width and leaves along the spine before it turns up (`flow`), thinning to a
 * fine blade; the ridge stands tallest over the chest. Each nest is seated
 * across the spine by the girth there, so the eggs sit on the back in every
 * pose, the upright rise too. A paler band runs along the belly
 * (`drawBelly`, `instar-profile-surface.ts`).
 *
 * `head` is here, and not only in `INSTAR_HEAD`, because a body candidate is
 * offered with the rig head on it while the `instar:head` slot owns that
 * record's fields: the profile draws through `INSTAR_BODY.head`, which by
 * default is `INSTAR_HEAD.side` itself.
 */
export const INSTAR_BODY: {
  /** Where the spine leaves the head, in head radii off its centre: a neck
   * started inside the skull runs into it rather than ending under it. */
  neck: { readonly x: number; readonly y: number };
  /** The body's half-width over the spine, back side; the belly side is 0.9 of it. */
  girth: (u: number) => number;
  /** How far under each nest the spine runs, so the nest sits on the back. */
  seat: (u: number) => number;
  /** Whether the seat runs across the spine (shipped), or straight down the
   * screen — which leaves the nests beside the back once it stands upright. */
  across: boolean;
  /** The tail's radius, root to blade. */
  tail: (u: number) => number;
  /** How far the tail leaves the rear along the spine's own heading before it
   * turns up to the fork, 0 to 1: at 0 it rises straight off the rear. */
  flow: number;
  /** How far the dorsal ridge's spines stand off the back, as a share of the old thin body's. */
  ridge: (u: number) => number;
  head: (ctx: CanvasRenderingContext2D, look: Look) => void;
} = {
  neck: { x: 0.3, y: 0.05 },
  girth,
  // The nest is sunk a little into the back: the spine runs under it at the girth less 0.15.
  seat: (u) => girth(u) - 0.15,
  across: true,
  tail: through([
    [0, 0.34],
    [0.5, 0.17],
    [1, 0.05],
  ]),
  flow: 0.8,
  // Half the old spines' stand-off, since the rings they stand on are twice as wide — more over the chest.
  ridge: (u) => 0.5 * (1 - 0.35 * u) * (1 + 0.6 * Math.exp(-(((u - 0.4) / 0.14) ** 2))),
  head: (ctx, look) => INSTAR_HEAD.side(ctx, look),
};
