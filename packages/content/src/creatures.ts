import { type Color, type CreatureKind, livingKindForColor } from "@neon-spore/sim";

/** The control groups a creature demands. Principle A, see docs/spec/systems.md. */
export type ControlGroup = "aim" | "guard";

export interface CreatureDef {
  kind: CreatureKind;
  /** Which controls a wave containing this creature must show. */
  controls: ControlGroup[];
  /**
   * The one colour this kind ever carries, or null if it carries none. A kind
   * is a colour *and* a silhouette, never a silhouette painted twice — see
   * `kindForColor`.
   */
  color: Color | null;
  /** One sentence. This is what the first-appearance preview says. */
  blurb: string;
}

/**
 * Adding a creature means adding one entry here. Waves are not touched —
 * a wave shows the union of its creatures' control groups, nothing else.
 *
 * **One kind, one colour, one shape.** The pair plays across a voice channel
 * with a delay on it, so what one of them says has to be the same word every
 * time: a round cyan thing is a bulb and a bulb is a round cyan thing. A new
 * silhouette is spent on a new *behaviour*, never on recolouring an existing
 * one — the shapes still free (dart, veil, strand, crystal, …) are reserved for
 * creatures that do something the standard ones do not, and one of those has to
 * look clearly different, not merely differently tinted. See docs/spec/bestiary.md.
 */
export const CREATURES: Record<CreatureKind, CreatureDef> = {
  slick: {
    kind: "slick",
    controls: ["aim"],
    color: "red",
    blurb: "Flat and wide, and always red. Glides, tilts and ripples. Holds its lane.",
  },
  bulb: {
    kind: "bulb",
    controls: ["aim"],
    color: "cyan",
    blurb: "Round and swollen, and always cyan. Sways in its lane and pumps.",
  },
  meteor: {
    kind: "meteor",
    controls: ["guard"],
    color: null,
    blurb: "Dead rock. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  queen: {
    kind: "queen",
    controls: ["aim", "guard"],
    color: null,
    blurb:
      "Huge and armoured. She opens for a moment, in one column and one colour — and answers a miss with a rock.",
  },
};

/**
 * The kind that carries a colour. Waves author the colour, because the colour
 * is what the players say out loud and what the cannon has to match; the shape
 * follows from it rather than being chosen next to it.
 */
export function kindForColor(color: Color): CreatureKind {
  return livingKindForColor(color);
}

export function controlsForKinds(kinds: readonly CreatureKind[]): ControlGroup[] {
  const set = new Set<ControlGroup>();
  for (const k of kinds) for (const g of CREATURES[k].controls) set.add(g);
  return [...set];
}
