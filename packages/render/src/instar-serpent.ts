import { type InstarState, instarStep } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import type { Look } from "./instar-plate.js";
import { INSTAR_FLIGHT_ENDS } from "./instar-shape.js";
import type { Layout } from "./layout.js";
import { phaseInto } from "./phase-into.js";
import { chainAt } from "./solid-motion.js";

/**
 * **THE INSTAR flies like a serpent** — `docs/spec/living-bosses.md` §1: on
 * the flight in and the passes the long body should swim through the air,
 * not be carried stiff. A wave runs down the spine from the neck to the
 * engines while the body flies (`instar-flight.ts`), one and a half crests
 * along it at once, small at the neck and growing to the rear, so the head
 * leads and the tail whips; a quicker, smaller shiver runs down on top of it,
 * so the body shakes as it swims; a crest toward the players swells the body
 * as it passes; and the wings beat once a crest on the wave at the shoulders
 * rather than on their own clock.
 *
 * **It grows out of the body at rest and dies back into it**: the envelope is
 * nought at the flight's first beat and at its last, so the body that lands is
 * the body the flight started from, and the landing has nothing to snap.
 *
 * **It is offered, not shipped**: `amount` is 0 on the field and VERSUS's
 * candidate (`tools/versus/candidates/instar-flight/serpent`) sets it to 1.
 * At 0 `instarSerpent` answers `undefined` and the profile is drawn as before.
 */
export const INSTAR_SERPENT: { amount: number } = { amount: 0 };

/** What the profile reads off the wave this frame. */
export interface InstarSerpent {
  /** How far the wave is grown, 0..1. */
  env: number;
  /** How far the spine at `u` (0 the neck, 1 the rear) is carried down, in head radii. */
  across: (u: number) => number;
  /** The shiver on top of the swim at `u`, in head radii: quick and small, toward the rear. */
  shiver: (u: number) => number;
  /** How much the body at `u` swells toward the players, as a share of its girth. */
  deep: (u: number) => number;
  /** The wing's beat, -1..1, read off the wave at the shoulders. */
  flap: number;
}

/** Beats a crest takes to come round, and how many crests the body holds at once. */
const PERIOD = 2;
const CRESTS = 1.5;
/** The wave at the neck and at the rear, in head radii — half as big again as
 * first offered, on the owner's *more movement shake of body*, 1 October 2026. */
const AT_NECK = 1 / 2;
const AT_REAR = 3 / 2;
/** How far a crest toward the players swells the girth. */
const SWELL = 0.28;
/** The shiver: beats one takes, how many the body holds, and its size at the rear in head radii. */
const SHIVER_PERIOD = 1 / 2;
const SHIVERS = 3;
const SHIVER = 0.14;
/** Where the wings' shoulders are along the body (`instar-profile.ts` `back(0.42)`). */
const SHOULDERS = 0.42;
/** Beats the wave takes to grow at the start and to die at the end. */
const GROW = 1;
/** The spine's samples the chain is reckoned over (`instar-profile.ts` `N`). */
const LINKS = 32;

const TAU = Math.PI * 2;
const LAG = (CRESTS * PERIOD) / LINKS;
const FALLOFF = (AT_REAR / AT_NECK) ** (1 / LINKS);
const SHIVER_LAG = (SHIVERS * SHIVER_PERIOD) / LINKS;

/** The wave `b` beats into a flight `end` beats long; `undefined` outside it. */
export function serpentAt(b: number, end: number): InstarSerpent | undefined {
  if (b <= 0 || b >= end) return undefined;
  const env = smoothstep(b / GROW) * smoothstep((end - b) / GROW) * INSTAR_SERPENT.amount;
  if (env <= 0) return undefined;
  const wave = (shift: number) => (u: number) =>
    AT_NECK * chainAt((t) => Math.sin((t / PERIOD) * TAU + shift), b, u * LINKS, LAG, FALLOFF);
  const across = wave(0);
  const quarter = wave(Math.PI / 2);
  return {
    env,
    across,
    shiver: (u) => SHIVER * u * Math.sin(((b - SHIVER_LAG * u * LINKS) / SHIVER_PERIOD) * TAU),
    deep: (u) => SWELL * quarter(u),
    flap: across(SHOULDERS) / (AT_NECK * FALLOFF ** (SHOULDERS * LINKS)),
  };
}

/** The wave this frame: only while the body flies in, passes or crosses. */
export function instarSerpent(
  s: InstarState,
  beat: number,
  beatPhase: number,
): InstarSerpent | undefined {
  if (INSTAR_SERPENT.amount <= 0 || s.phase !== "morph") return undefined;
  const step = instarStep(s);
  if (step === null || step.arrive === "stay") return undefined;
  return serpentAt(phaseInto(s, beat, beatPhase), step.morphBeats * INSTAR_FLIGHT_ENDS);
}

/** How far the spine `u` along is carried down this frame, in pixels; nought with no wave. */
export function swimAt(look: Pick<Look, "r" | "serpent">, u: number): number {
  const sw = look.serpent;
  return sw ? look.r * (sw.across(u) + sw.shiver(u)) * sw.env : 0;
}

/** What the girth `u` along is multiplied by this frame; one with no wave. */
export function swellAt(look: Pick<Look, "serpent">, u: number): number {
  const sw = look.serpent;
  return sw ? 1 + sw.deep(u) * sw.env : 1;
}

/** The look with the head and the two nests carried with the spine under them:
 * the neck at `u = 0`, the nearer nest to the head at a third, the other at two. */
export function swimLook(l: Layout, look: Look): Look {
  if (!look.serpent) return look;
  const { f, head } = look;
  const milli = (u: number) => (swimAt(look, u) * 1000) / l.gridHeight;
  const [nest, eggs] = f.nestX <= f.eggsX ? [1 / 3, 2 / 3] : [2 / 3, 1 / 3];
  return {
    ...look,
    head: { x: head.x, y: head.y + swimAt(look, 0) },
    f: { ...f, nestY: f.nestY + milli(nest), eggsY: f.eggsY + milli(eggs) },
  };
}
