import { INSTAR_HEAD } from "./instar-head-look.js";
import type { Look } from "./instar-plate.js";
import type { Body } from "./instar-profile-surface.js";

/**
 * **THE INSTAR's side-on body, as the one record its widths are read from** —
 * so VERSUS can offer a body with weight beside the shipped one
 * (`tools/versus/candidates/instar-body/`, `docs/spec/living-bosses.md` §2).
 * Every length is in head radii and every `u` runs 0 at the neck to 1 at the
 * rear (or, for the tail, root to blade). These defaults are the shipped body.
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
  /** Whether the seat runs across the spine, or (shipped) straight down the screen. */
  across: boolean;
  /** The tail's radius, root to blade. */
  tail: (u: number) => number;
  /** How far the tail leaves the rear along the spine's own heading before it
   * turns up to the fork, 0 to 1: at 0 (shipped) it rises straight off the rear. */
  flow: number;
  /** How far the dorsal ridge's spines stand off the back, as a share of the shipped. */
  ridge: (u: number) => number;
  /** A mark on the hide after the hurt and before the scales; `clip` is the hide. */
  belly: (
    ctx: CanvasRenderingContext2D,
    body: Body,
    clip: Path2D,
    roll: number,
    fade: number,
  ) => void;
  head: (ctx: CanvasRenderingContext2D, look: Look) => void;
} = {
  neck: { x: 0.7, y: 0.15 },
  girth: (u) => (0.34 + 0.2 * Math.sin(Math.PI * Math.min(1, u * 1.3))) * (1 - 0.5 * u),
  seat: () => 0.42,
  across: false,
  tail: (u) => 0.3 - 0.2 * u,
  flow: 0,
  ridge: () => 1,
  belly: () => {},
  head: (ctx, look) => INSTAR_HEAD.side(ctx, look),
};
