import type { BodyEvent } from "./events-body.js";
import type { BossEvent } from "./events-bosses.js";
import type { CreatureEvent } from "./events-creature.js";
import type { FleetEvent } from "./events-fleet.js";
import type { HandEvent } from "./events-hands.js";
import type { PodEvent } from "./events-pod.js";
import type { RoundEvent } from "./events-rounds.js";
import type { Color } from "./types.js";
import type { FailCause } from "./wave-fail.js";

/**
 * Everything the simulation reports about a tick, and the whole of what it
 * says to anybody. render/ and `packages/audio` read this list and nothing
 * writes back: the world does not know either of them exists.
 *
 * Its own file rather than `world.ts`, because it is the sim's *output*
 * vocabulary and not part of a world — the same argument `entries.ts` makes
 * about the input side. `packages/audio/test/bind.test.ts` reads this union
 * out of the source to check that every event has a sound, so a new one here
 * fails that test rather than going quietly silent.
 */
export type SimEvent =
  | { type: "beat"; beat: number }
  | { type: "waveStart"; wave: number }
  /** The host is asked for a wave's queue; `retry` when it is the same wave
   * again after a hit (`wave-fail.ts`), which opens without its guide, and
   * `guide` when that retry is to open with one anyway — the pair asked to
   * watch the tutorial again before playing it. */
  | { type: "needWave"; wave: number; retry?: true; guide?: true }
  /** A hit failed the wave: the field holds, then the pair is asked. */
  | { type: "waveFailed"; wave: number; cause: FailCause }
  /** One seat answered QUIT on the lost screen: the run is over for both,
   * and the other phone is told who it was (`wave-fail.ts`). */
  | { type: "quit"; player: 1 | 2 }
  /** `lance` is true when the shot left a full lobe — see `lance.ts`. */
  | { type: "fire"; col: number; color: Color; lance: boolean }
  /** The lobe came full: from this moment the next shot out of it is a lance. */
  | { type: "lanceFull"; col: number }
  /** A shot went out through a lobe that was not full yet, and took the fill with it. */
  | { type: "lanceSpilled"; col: number }
  /**
   * A shot went past the top of the field and the simulation is done with it
   * (`shot-out.ts`). `atMilli` is where it stood, in thousandths of a row and
   * negative; `taken` is whether a boss hanging above the field had it, and
   * `wasted` whether it lost the wave for meeting nothing (HARD's rule).
   */
  | {
      type: "shotOut";
      col: number;
      driftMilli: number;
      atMilli: number;
      color: Color;
      taken: boolean;
      wasted: boolean;
    }
  // A hand on a body, a body's end, a pod's end: three families next door
  // (`events-hands.ts`, `events-body.ts`, `events-pod.ts`), cut out when
  // `destroy` gaining an `id` left this file one line under its limit.
  | HandEvent
  | BodyEvent
  | PodEvent
  // THE BULB QUEEN's petal and fall, and THE WARDEN's line, plate and fall,
  // are with the rest of each boss's (`events-queen.ts`, `events-warden.ts`).
  // THE MIRROR's five and THE MAZE's five, as one union next door
  // (`events-rounds.ts`): a round's coordinates are its own, and these were
  // the last rows on the page when THE BELLOWS put it within three lines of
  // its limit.
  | RoundEvent
  | CreatureEvent
  /**
   * A salvo into open water on THE FLEET's chart, in the field's coordinates.
   * Its own event and not a `reject`: a splash spends the square, a press onto
   * a square already fired at spends nothing. THE FLEET's five: `events-fleet.ts`.
   */
  | FleetEvent
  // The choreographed bosses' own arms, as one union next door: this file has
  // been at its 250-line limit for four bosses running, and each of them cost
  // three lines of it (`events-bosses.ts`). Only the union crosses; the twelve
  // member types used to be re-exported below it and nothing imported one
  // through here, so that block was fourteen lines of this file's limit spent
  // on a road nobody drove.
  | BossEvent;

export type { FleetEvent } from "./events-fleet.js";
