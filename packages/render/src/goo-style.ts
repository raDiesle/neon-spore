/**
 * **What a GOO drop is made of.** The owner, 10 October 2026, on the first
 * four GOO looks: *I guess I like "tar" colour most, but of "jelly" the tail
 * shape and animation* — so there is one body now: TAR's black with its hot
 * magenta neon edge and oily sheen, lumped and wobbling as JELLY did. The
 * GOO looks differ in how a count ends (`goo-fizz.ts`), not in this.
 *
 * **Its neon is ACID YELLOW since 12 October 2026**: the magenta read as
 * THE SLOW's own pink sparks and red-and-blue tear on THE LAMPREY's tow, and
 * of six colours tried there in the PULL LAB the owner chose *"Acid yellow"
 * the most*. TAR's make is kept — a body dark in the neon's own hue, a deeper
 * edge, a lit core.
 */
export interface GooStyle {
  /** The slime's own colour, its dark edge, its lit core, and the neon its rim glows. */
  readonly body: string;
  readonly deep: string;
  readonly core: string;
  readonly neon: string;
  /** How lumpy the rim is, and how fast its lumps creep. */
  readonly lumpy: number;
  readonly creep: number;
  /** How strongly the drop jiggles when it is let go or lands. */
  readonly jiggle: number;
}

/** TAR's make in ACID YELLOW, on JELLY's lumps, creep and wobble. */
export const GOO: GooStyle = {
  body: "#2B2606",
  deep: "#0A0902",
  core: "#A39A3C",
  neon: "#FFF01F",
  lumpy: 0.14,
  creep: 1.4,
  jiggle: 1.3,
};
