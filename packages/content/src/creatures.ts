import type { CreatureKind } from "@neon-spore/sim";

/** The control groups a creature demands. Principle A, see docs/spec/systems.md. */
export type ControlGroup = "aim" | "guard";

export interface CreatureDef {
  kind: CreatureKind;
  /** Which controls a wave containing this creature must show. */
  controls: ControlGroup[];
  /** Whether it carries a colour that can be resonated. */
  colored: boolean;
  /** One sentence. This is what the first-appearance preview says. */
  blurb: string;
}

/**
 * Adding a creature means adding one entry here. Waves are not touched —
 * a wave shows the union of its creatures' control groups, nothing else.
 */
export const CREATURES: Record<CreatureKind, CreatureDef> = {
  slick: {
    kind: "slick",
    controls: ["aim"],
    colored: true,
    blurb: "Flat and wide. Glides, tilts and ripples. Holds its lane. Match its colour.",
  },
  bulb: {
    kind: "bulb",
    controls: ["aim"],
    colored: true,
    blurb: "Round and swollen. Sways in its lane and pumps. Match its colour.",
  },
  meteor: {
    kind: "meteor",
    controls: ["guard"],
    colored: false,
    blurb: "Dead rock. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
};

export function controlsForKinds(kinds: readonly CreatureKind[]): ControlGroup[] {
  const set = new Set<ControlGroup>();
  for (const k of kinds) for (const g of CREATURES[k].controls) set.add(g);
  return [...set];
}
