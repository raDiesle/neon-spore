import type { CreatureEvent } from "./events-creature.js";
import type { MazeVerdictReason } from "./maze-round.js";
import type { MirrorStep, MirrorVerdictReason } from "./simon.js";
import type { Color, Creature, CreatureKind, PodKind } from "./types.js";

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
  | { type: "needWave"; wave: number }
  /** `lance` is true when the shot left a full lobe — see `lance.ts`. */
  | { type: "fire"; col: number; color: Color; lance: boolean }
  /** The lobe came full: from this moment the next shot out of it is a lance. */
  | { type: "lanceFull"; col: number }
  /** A shot went out through a lobe that was not full yet, and took the fill with it. */
  | { type: "lanceSpilled"; col: number }
  | { type: "destroy"; col: number; row: number; color: Color }
  | { type: "hole"; col: number; row: number }
  | { type: "reject"; col: number; row: number }
  | { type: "deflect"; col: number; span: number; kind: Creature["kind"]; fromRow: number }
  /** A hand took hold. Only the moment it lands — the hold itself is state,
   * not an event, and render/ reads it off the world every frame. */
  | { type: "grip"; player: 1 | 2; col: number; row: number }
  | { type: "podLoose"; col: number; row: number }
  | { type: "podTaken"; col: number; kind: PodKind }
  | { type: "podLost"; col: number }
  | {
      type: "breach";
      col: number;
      damage: number;
      span: number;
      kind: Creature["kind"];
      fromRow: number;
      /** The beat this happened on — matches the `Scar`s it left, so render/
       * can tell a scar's crack apart from one an earlier beat left behind. */
      beat: number;
    }
  | { type: "petal"; col: number; row: number; left: number }
  | { type: "queenDown"; col: number; row: number }
  /**
   * THE WARDEN lowered a line out of the middle of its rim. `color` is what the
   * rim will carry until the line goes — the same colour the one shot into the
   * eye has to be.
   */
  | { type: "tether"; col: number; color: Color }
  /** The line came fully taut and the hatch stands open. One shot counts. */
  | { type: "eyeOpen"; col: number; color: Color }
  /** A plate off the rim. `color` is the rim's, which is what took it. */
  | { type: "plate"; col: number; row: number; left: number; color: Color }
  | { type: "wardenDown"; col: number; row: number }
  /**
   * THE MIRROR performed one step of a sequence. `index` is 1-based, and
   * `col` is the column its own cannon was standing in as it did — which is
   * where render/ drops the ghost of a shot it performed.
   */
  | { type: "mirrorShow"; step: MirrorStep; index: number; of: number; col: number }
  /** The pair answered one step of a sequence correctly. */
  | { type: "mirrorEcho"; step: MirrorStep; index: number; of: number }
  /** A round is settled — right or wrong, why, and where it landed. */
  | { type: "mirrorVerdict"; right: boolean; col: number; reason: MirrorVerdictReason }
  | { type: "mirrorDown"; col: number }
  /**
   * The pair fired into one of THE MAZE's three mouths. `col` is the column
   * that mouth hangs over, which is where the shot went in and — if the strand
   * behind it goes nowhere — where the answer comes back out.
   */
  | { type: "mazeCommit"; mouth: number; col: number }
  /**
   * The shot stands one cell further into the wheel. `ring` counts outward
   * from the mouths and `sector` is around, both in the wheel's own
   * coordinates and never the field's: the wheel is not on the grid.
   */
  | { type: "mazeProbe"; ring: number; sector: number; of: number }
  /** A round is settled — right or wrong, why, and the mouth it landed in. */
  | { type: "mazeVerdict"; right: boolean; col: number; reason: MazeVerdictReason }
  | { type: "mazeDown"; col: number }
  | CreatureEvent
  /**
   * A salvo into open water on THE FLEET's chart. `col` and `row` are the
   * square, in the chart's own coordinates — which are the field's, because
   * the chart stands on the grid rather than beside it.
   *
   * Its own event and not a `reject`, because the ear has to tell "that did
   * nothing" from "that was a square, and it was empty": a splash spends the
   * square and the rest between two salvoes, and a press onto a square already
   * fired at spends neither. Both seats hear it — the chart is the one thing
   * in this fight the two of them share.
   */
  | { type: "fleetSplash"; col: number; row: number }
  /** A salvo that found a hull. The square is now marked on both screens. */
  | { type: "fleetHit"; col: number; row: number }
  /**
   * The last square of one ship. `len` is how long it was and `left` how many
   * are still afloat, so the ear can say how big a thing just went down and
   * how much of the fight is left without either screen being read.
   */
  | { type: "fleetSunk"; col: number; row: number; len: number; left: number }
  /** The last ship of the fleet. The chart is clear and the wave is over. */
  | { type: "fleetDown"; col: number; row: number };
