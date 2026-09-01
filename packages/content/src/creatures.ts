import { type Color, type CreatureKind, livingKindForColor } from "@neon-spore/sim";
import { CREATURES } from "./creatures-table.js";

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
  /**
   * True for a kind that carries no colour of its own but whose *arrivals*
   * are each authored one — the body behind the disguise, under the plating,
   * inside the shield, or on the end of the dart's diagonal.
   *
   * Data rather than a rule derived from `color === null`, because the throb
   * is the counter-example and always will be: it carries no colour and none
   * is ever authored for it, since a throb is answered by the beat rather
   * than by a colour at all. A tool that guessed from the blank would offer a
   * colour picker on the one creature that must not have one.
   *
   * The director reads this to decide which cells get a SLICK/BULB choice
   * under the map, and `queueFromWave` is what turns that colour back into a
   * body (`kindForColor`, `shellBecomes`, `claspBecomes`).
   */
  authorsColor?: true;
  /** One sentence. This is what the first-appearance preview says. */
  blurb: string;
}

/**
 * The bestiary itself lives in `creatures-table.ts` and is re-exported here,
 * so every reader still says `CREATURES` from `creatures.ts` and nothing had
 * to be repointed.
 *
 * Split the day THE CLASP took this file past its 250-line limit, along the
 * seam `mechanics.ts` and `mechanics-table.ts` next door already use: a table
 * grows by one entry per creature forever, and the rules around it —
 * `controlsForKinds`, `radarOwner`, `categoryOf` — do not. Adding a creature
 * should cost the file that is a *list* and leave the file that is *logic*
 * untouched.
 */
export { CREATURES } from "./creatures-table.js";

/**
 * The kind that carries a colour. Waves author the colour, because the colour
 * is what the players say out loud and what the cannon has to match; the shape
 * follows from it rather than being chosen next to it.
 */
export function kindForColor(color: Color): CreatureKind {
  return livingKindForColor(color);
}

/**
 * Whether a wave authors this kind's colour on the arrival rather than reading
 * it off the kind. Call this instead of testing `color === null`: a rock and a
 * throb are blank too, and neither takes a colour (`CreatureDef.authorsColor`).
 */
export function authorsBodyColor(kind: CreatureKind): boolean {
  return CREATURES[kind].authorsColor === true;
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
