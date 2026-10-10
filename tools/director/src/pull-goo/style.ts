/**
 * **What a GOO drop is made of.** The owner, 10 October 2026, on the first
 * four GOO looks: *I guess I like "tar" colour most, but of "jelly" the tail
 * shape and animation* — so there is one body now: TAR's black with its hot
 * magenta neon edge and oily sheen, lumped and wobbling as JELLY did. The
 * GOO looks differ in how a count ends (`endings-*.ts`), not in this.
 */
export interface GooStyle {
  /** The slime's own colour, its dark edge, its lit core, and the neon its rim glows. */
  readonly body: string;
  readonly deep: string;
  readonly core: string;
  readonly neon: string;
  /** How much of the field shows through the body, 0..1. */
  readonly clear: number;
  /** How lumpy the rim is, and how fast its lumps creep. */
  readonly lumpy: number;
  readonly creep: number;
  /** Bubbles hung inside the body. */
  readonly bubbles: number;
  /** A wet oily sheen sliding over the top. */
  readonly sheen: boolean;
  /** How strongly the drop jiggles when it is let go or lands. */
  readonly jiggle: number;
}

/** TAR's colours on JELLY's lumps, creep and wobble. */
export const GOO: GooStyle = {
  body: "#24113A",
  deep: "#05030A",
  core: "#7A5A9E",
  neon: "#FF4FE6",
  clear: 0,
  lumpy: 0.14,
  creep: 1.4,
  bubbles: 0,
  sheen: true,
  jiggle: 1.3,
};
