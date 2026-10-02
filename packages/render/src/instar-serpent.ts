import { type InstarState, instarStep, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import type { Look } from "./instar-plate.js";
import { INSTAR_FLIGHT_ENDS } from "./instar-shape.js";
import { instarLive } from "./instar-sway.js";
import type { Layout } from "./layout.js";
import { phaseInto } from "./phase-into.js";
import type { SlowSpan } from "./slow-hush.js";
import { chainAt } from "./solid-motion.js";

/**
 * **THE INSTAR swims like a serpent** — `docs/spec/living-bosses.md` §1: the
 * long body should swim through the air, not be carried stiff. A slow wave
 * runs down the spine from the neck to the engines, a crest and a quarter
 * along it at once, small at the neck and growing to the rear, so the head
 * leads and the tail follows; a crest toward the players swells the body as
 * it passes.
 *
 * **It swims on every step, seen from either end.** The owner, 2 October
 * 2026, on the first offer: *make it slower and not so strong path of
 * movement and also have it in all perspective of boss level*. So the wave
 * is half the size it was and a crest takes four beats rather than two, the
 * shiver on top of it is gone, and it no longer runs only in flight: perched,
 * standing and turning it swims at `REST` of its flight's size, side-on down
 * the profile (`instar-profile.ts`) and face-on down the tube going back into
 * the dark (`instar-front-body.ts`). Its clock is the beat itself, so a
 * flight's wave is the perch's wave grown, and nothing jumps where a phase
 * changes.
 *
 * **In flight it grows to the whole and the wings beat on it**, once a crest
 * at the shoulders rather than on their own clock (`fly`); the growth is
 * nought at the flight's first beat and its last, so the landing is the
 * perch's swim again.
 *
 * **It holds still under a thumb**: it takes the weave's hush
 * (`instar-sway.ts` `instarLive`), a twentieth while THE SLOW is open — when
 * the marks are up — and none once the body is beaten, so a mark on a nest
 * stays where its circle is drawn.
 *
 * **It is offered, not shipped**: `amount` is 0 on the field and VERSUS's
 * candidate (`tools/versus/candidates/instar-flight/serpent`) sets it to 1.
 * At 0 `instarSerpent` answers `undefined` and the body is drawn as before.
 */
export const INSTAR_SERPENT: { amount: number } = { amount: 0 };

/** What the profile reads off the wave this frame. */
export interface InstarSerpent {
  /** How much of the wave is drawn, 0..1: `REST` on a perch, the whole in flight, hushed under THE SLOW. */
  env: number;
  /** How far into a flight the body is, 0..1: the share of the wings' beat the wave takes. */
  fly: number;
  /** How far the spine at `u` (0 the neck, 1 the rear) is carried down, in head radii. */
  across: (u: number) => number;
  /** How much the body at `u` swells toward the players, as a share of its girth. */
  deep: (u: number) => number;
  /** The wing's beat, -1..1, read off the wave at the shoulders. */
  flap: number;
}

/** Beats a crest takes to come round, and how many crests the body holds at once —
 * four and a quarter, on the owner's *slower*, 2 October 2026. */
const PERIOD = 4;
const CRESTS = 1.25;
/** The wave at the neck and at the rear, in head radii, in full flight — half
 * what it was, on the owner's *not so strong path of movement*, 2 October 2026. */
const AT_NECK = 1 / 4;
const AT_REAR = 3 / 4;
/** How far a crest toward the players swells the girth. */
const SWELL = 0.14;
/** The share of the flight's wave the body swims with when it is not flying. */
export const REST = 0.5;
/** Where the wings' shoulders are along the body (`instar-profile.ts` `back(0.42)`). */
const SHOULDERS = 0.42;
/** Beats a flight's wave takes to grow at the start and to die at the end. */
const GROW = 1;
/** The spine's samples the chain is reckoned over (`instar-profile.ts` `N`). */
const LINKS = 32;

const TAU = Math.PI * 2;
const LAG = (CRESTS * PERIOD) / LINKS;
const FALLOFF = (AT_REAR / AT_NECK) ** (1 / LINKS);

/** How far a flight `end` beats long has grown its wave `b` beats in: 0 at either end. */
export function flightGrown(b: number, end: number): number {
  if (b <= 0 || b >= end) return 0;
  return smoothstep(b / GROW) * smoothstep((end - b) / GROW);
}

/** The wave on the beat clock `clock`, `fly` of the way into a flight and with `live` of
 * the body's motion left; `undefined` with the candidate off or nothing left. */
export function serpentAt(clock: number, fly: number, live = 1): InstarSerpent | undefined {
  const env = (REST + (1 - REST) * fly) * live * INSTAR_SERPENT.amount;
  if (env <= 0) return undefined;
  const wave = (shift: number) => (u: number) =>
    AT_NECK * chainAt((t) => Math.sin((t / PERIOD) * TAU + shift), clock, u * LINKS, LAG, FALLOFF);
  const across = wave(0);
  const quarter = wave(Math.PI / 2);
  return {
    env,
    fly,
    across,
    deep: (u) => SWELL * quarter(u),
    flap: across(SHOULDERS) / (AT_NECK * FALLOFF ** (SHOULDERS * LINKS)),
  };
}

/** The wave this frame: on every step, grown while the body flies in, passes or crosses. */
export function instarSerpent(
  s: InstarState,
  cfg: SimConfig,
  slow: SlowSpan,
  beat: number,
  beatPhase: number,
): InstarSerpent | undefined {
  if (INSTAR_SERPENT.amount <= 0) return undefined;
  const step = instarStep(s);
  const fly =
    s.phase === "morph" && step !== null && step.arrive !== "stay"
      ? flightGrown(phaseInto(s, beat, beatPhase), step.morphBeats * INSTAR_FLIGHT_ENDS)
      : 0;
  return serpentAt(beat + beatPhase, fly, instarLive(s, cfg, slow, beat, beatPhase));
}

/** How far the spine `u` along is carried down this frame, in pixels; nought with no wave. */
export function swimAt(look: Pick<Look, "r" | "serpent">, u: number): number {
  const sw = look.serpent;
  return sw ? look.r * sw.across(u) * sw.env : 0;
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
