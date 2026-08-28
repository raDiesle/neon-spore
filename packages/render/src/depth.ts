import type { Creature, SimConfig } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE FIELD HAS A NEAR EDGE AND A FAR ONE.
 *
 * Three cues, and they are one system rather than three effects: a body grows
 * as it descends, the rows above it draw hazier, and when two overlap the
 * nearer one is on top. Any of the three alone reads as a trick — bodies that
 * merely get bigger, or a wash somebody put over the top of the field. Taken
 * together they are a space, and the space says something the pair needs: the
 * row about to cost them a hull point is the loudest thing on the screen.
 *
 * **Nothing here is simulation.** `creatureCenter` stays exactly linear, no
 * number below reaches `hashWorld` (`cfg` is outside it by construction), and
 * the tunables are read from `SimConfig` the same way `radarLead` and
 * `bandPct` are. Two devices with different `depthNearScale` draw two
 * different pictures of the same world, and lockstep does not notice.
 */

/**
 * How near a row is, 0 at the top of the grid and 1 on the hull row.
 *
 * The grid's own span, not the hull row from `SimConfig`: a creature is drawn
 * wherever `creatureCenter` puts it, and that is a screen row, so the ramp has
 * to be anchored to the same thing the picture is.
 */
export function nearness(l: Layout, row: number): number {
  const span = Math.max(1, l.rows - 1);
  return Math.max(0, Math.min(1, row / span));
}

/**
 * The row a creature is drawn on, mid-glide. One tile per beat, linear — the
 * same interpolation `creatureCenter` turns into a y, written once so the
 * scale and the position can never come from two different rows.
 */
export function drawnRow(c: Creature, beatPhase: number): number {
  return c.fromRow + (c.row - c.fromRow) * beatPhase;
}

/**
 * How much bigger a body draws for being that near. 1 at the top row, rising
 * linearly to `cfg.depthNearScale` at the hull.
 *
 * Linear, and not the hyperbola a real receding plane would give, because the
 * *position* it partners is linear by simulation constraint — one tile per
 * beat, no easing, so that "it lands on the four" is a statement both players
 * can act on. A hyperbolic size against a linear descent is two pictures of
 * different spaces laid over each other.
 *
 * Why 1.125 and not the 1.15 that was first suggested — two derivations, and
 * they land within 0.008 of each other:
 *
 *  - **The gutter.** A living body is drawn at 0.4 tiles' radius, so it covers
 *    0.8 of a tile and leaves a fifth of one clear between two neighbouring
 *    columns. That gutter *is* the column read the pair talks in. 1.125 spends
 *    exactly half of it (0.8 × 1.125 = 0.9 tiles); 1.25 spends all of it and
 *    puts two adjacent columns' bodies in contact.
 *  - **The third nameability axis.** `tools/shape-sheet` measures effective
 *    drawn radius including `sizeMul`, and SLICK tops out at 26.0 px where
 *    BULB starts at 29.4. A uniform row multiplier stretches every kind's
 *    span upward together, and at 1.1322 those two stop being told apart by
 *    drawn size at all. At 1.125 the gap is +0.2 px — thin, and the right side
 *    of the line.
 *
 * The second derivation comes with a finding, and it is about the gate rather
 * than about this number: the gate cannot go red on a uniform row multiplier
 * at *any* value. Every pair on the living roster is disjoint on the lobe axis
 * as well, and `confusable` needs all three axes at once, so scaling the whole
 * field to 100× leaves it green. Size is load-bearing for no pair today. The
 * TOLD APART BY block still shows the gaps closing, which is the part worth
 * reading; the pass/fail is not watching this.
 */
export function depthScale(cfg: SimConfig, l: Layout, row: number): number {
  return 1 + (cfg.depthNearScale - 1) * nearness(l, row);
}

/**
 * How many steps the haze is quantised into.
 *
 * `haloSprite` caches one canvas per `colour@radius`, so a colour that varies
 * continuously with a gliding row would allocate a canvas per frame and never
 * stop. Six steps over four base colours is a bounded handful. The banding it
 * costs is 5% of a mix every two and a bit rows, which is under what the wash
 * behind it already does.
 */
const HAZE_STEPS = 6;

/**
 * The colour the far rows recede toward: the grid's own colour, which is
 * already the field's far structure. Dark, so luminance falls; blue, so hue
 * cools; and *shared*, so a body's fill and its rim converge as they go — the
 * three things distance owes, out of one mix.
 */
const FAR = PALETTE.grid;

/** A `#rrggbb` mix. Hex out, because `haloSprite` appends an alpha byte to it. */
function mix(a: string, b: string, t: number): string {
  let out = "#";
  for (let i = 1; i < 7; i += 2) {
    const ca = Number.parseInt(a.slice(i, i + 2), 16);
    const cb = Number.parseInt(b.slice(i, i + 2), 16);
    out += Math.round(ca + (cb - ca) * t)
      .toString(16)
      .padStart(2, "0");
  }
  return out;
}

/**
 * A body's colour as it reads from that distance. `near` is `nearness`, so the
 * hull row is untouched and the top row is mixed by `cfg.depthHaze`.
 */
export function hazed(cfg: SimConfig, hex: string, near: number): string {
  const t = (Math.round((1 - near) * HAZE_STEPS) / HAZE_STEPS) * cfg.depthHaze;
  return t <= 0 ? hex : mix(hex, FAR, t);
}

/**
 * The draw order: farthest first, so the nearer of two overlapping bodies is
 * the one on top. `world.creatures` is in spawn order, which decided it by
 * accident before.
 *
 * A copy, never a sort in place — the array belongs to the simulation and
 * render changes nothing. `Array.prototype.sort` is stable, so two bodies on
 * the same row keep their list order and both devices draw the same picture.
 */
export function byDepth(creatures: readonly Creature[], beatPhase: number): Creature[] {
  return [...creatures].sort((a, b) => drawnRow(a, beatPhase) - drawnRow(b, beatPhase));
}
