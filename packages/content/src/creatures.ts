import { type Color, type CreatureKind, livingKindForColor } from "@neon-spore/sim";

/** The control groups a creature demands. Principle A, see docs/spec/systems.md. */
export type ControlGroup = "aim" | "guard";

/**
 * Which player's radar strip shows this kind coming. Data, not derived from
 * `controls` — the queen carries both control groups, and a later creature
 * must be able to opt out of both radars (`"none"`) without that reading as
 * "aim and guard, so p2".
 */
export type RadarOwner = "p1" | "p2" | "none";

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
  /**
   * Whose radar strip announces this kind. The rule crosses the controls
   * instead of splitting information types by kind of information: the one
   * who reads the radar is never the one who acts on it, so the pair has to
   * talk (docs/spec/roles.md).
   */
  radar: RadarOwner;
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
    radar: "p2",
    blurb: "Flat and wide, and always red. Glides, tilts and ripples. Holds its lane.",
  },
  bulb: {
    kind: "bulb",
    controls: ["aim"],
    color: "cyan",
    radar: "p2",
    blurb: "Round and swollen, and always cyan. Sways in its lane and pumps.",
  },
  meteor: {
    kind: "meteor",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb: "Dead rock. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  meteorMedium: {
    kind: "meteorMedium",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Dead rock, falling twice as fast. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  meteorFast: {
    kind: "meteorFast",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Dead rock, falling three times as fast. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  meteorFaster: {
    kind: "meteorFaster",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Dead rock, falling four times as fast. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  meteorFastest: {
    kind: "meteorFastest",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Dead rock, falling five times as fast. Cannot be shot. Shield in the right column, triggered at the right moment.",
  },
  torch: {
    kind: "torch",
    controls: ["guard"],
    color: null,
    radar: "p1",
    blurb:
      "Same rock, same colour as a meteor, just twice as wide and the fastest thing in the field. Cannot be shot — and it is what the queen carries on each wing. Shield across both columns, triggered at the right moment.",
  },
  queen: {
    kind: "queen",
    controls: ["aim", "guard"],
    color: null,
    radar: "p2",
    blurb:
      "Huge and armoured. Two marks under her middle, one real and one not: one of you sees what is coming, the other sees which side. Every eight beats one of the two torches she carries drops straight out of its socket.",
  },
  warden: {
    kind: "warden",
    controls: ["aim", "guard"],
    color: null,
    radar: "p2",
    blurb:
      "A ring five columns wide with a hole you can see the field through, and it never moves. The hole slides; the core stands in it for two beats after every line you pull free, and only a shot of the rim's own colour, in the hole's own column, takes a plate.",
  },
  runt: {
    kind: "runt",
    // Same job as any other aim target — the cannon has to be in its column
    // and player 2 has to choose whether to fire — so a wave containing only
    // Runts still shows the controls that make not-firing a real restraint
    // rather than an absent one.
    controls: ["aim"],
    color: null,
    radar: "p2",
    blurb:
      "Tiny and helpless, and carries no colour. Do not shoot it — any shot that lands costs points, whatever colour it was.",
  },
  throb: {
    kind: "throb",
    controls: ["aim"],
    color: null,
    radar: "p2",
    blurb:
      "Swells and shrinks on the shared beat and carries no colour. Only a shot while it is swollen lands — a miss on the beat it is shut is just a miss.",
  },
  shell: {
    kind: "shell",
    // Only ever the cannon. Both phases are answered by a shot — what changes
    // is whether the colour is part of the question, and control visibility
    // has nothing to say about that.
    controls: ["aim"],
    // No colour, and that is the entry doing real work rather than a blank:
    // the body under the armour has one, but it does not exist until the last
    // piece comes off, so there is nothing here for a bestiary page to print.
    color: null,
    radar: "p2",
    blurb:
      "Armoured, two columns wide, one piece of shell in front of each. Any colour chips a piece off. Under the last piece is a body in a colour neither of you has seen — and only that colour finishes it.",
  },
  tether: {
    kind: "tether",
    // The first `special`: answered by neither cannon nor shield. A hand is
    // the only thing that touches it — dragged rather than gripped — so it
    // carries no control group at all and a wave containing one shows the band
    // its other creatures ask for.
    controls: [],
    color: null,
    // Nobody's strip. It is installed by the boss rather than arriving from
    // above, and the boss is already announced — a second warning of a thing
    // that is not travelling anywhere would be noise on a strip that exists
    // to say what is coming.
    radar: "none",
    blurb:
      "A rope lowered out of the middle of THE WARDEN's rim, with a handle on the end of it. Cannot be shot and cannot be warded, and it never falls — the pilot takes the handle and pulls it aside, and the hatch over the eye opens as far as the rope is taut.",
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

/**
 * Whose radar strip announces this kind, straight from `CREATURES`. Call
 * this instead of re-deriving ownership from `controls` by hand — writing
 * `controls.includes("guard") ? "p1" : "p2"` happens to match today's
 * bestiary, but it is a second, undeclared copy of a rule that a mixed
 * creature or a radar-`"none"` one will silently break.
 */
export function radarOwner(kind: CreatureKind): RadarOwner {
  return CREATURES[kind].radar;
}

/**
 * Whether a screen with this role should show a kind coming. `role` is a
 * plain string, not render's `ViewRole` — content must not import render
 * (CLAUDE.md rule 1) — so `"test"` is spelled out here too: it is both
 * halves at once, so it shows everything.
 */
export function showsRadar(role: "p1" | "p2" | "test", kind: CreatureKind): boolean {
  if (role === "test") return true;
  return radarOwner(kind) === role;
}

/**
 * The bestiary grouped by what a player does about it. `"special"` is for a
 * creature answered by neither `aim` nor `guard`, and it stood empty until
 * THE WARDEN's tether: a thing you can only put a hand on is exactly what it
 * was being held open for (docs/spec/bestiary.md).
 */
export type CreatureCategory = "cannon" | "shield" | "mixed" | "special";

/**
 * Derived from `controls`, never re-typed by hand — see purity.test.ts. A
 * second, parallel switch on `CreatureKind` (`kind === "queen" ? "mixed" :
 * ...`) would drift from `controls` the moment a creature's control groups
 * changed without its category following.
 */
export function categoryOf(kind: CreatureKind): CreatureCategory {
  const controls = CREATURES[kind].controls;
  const hasAim = controls.includes("aim");
  const hasGuard = controls.includes("guard");
  if (hasAim && hasGuard) return "mixed";
  if (hasAim) return "cannon";
  if (hasGuard) return "shield";
  return "special";
}

/**
 * Pods (`mend`/`purge`/`ward`) are not a `CreatureKind` and were never in
 * `CREATURES` — they get their own constant rather than a `categoryOf` case
 * that would need a `PodKind` overload for one label.
 */
export const POD_CATEGORY = "suck" as const;
