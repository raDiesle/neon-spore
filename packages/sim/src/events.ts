import type { BatonEvent } from "./events-baton.js";
import type { CandleEvent } from "./events-candle.js";
import type { CreatureEvent } from "./events-creature.js";
import type { FleetEvent } from "./events-fleet.js";
import type { GorgeEvent } from "./events-gorge.js";
import type { SpliceEvent } from "./events-splice.js";
import type { StareEvent } from "./events-stare.js";
import type { UndertowEvent } from "./events-undertow.js";
import type { BreachWeight } from "./hull-damage.js";
import type { MazeVerdictReason } from "./maze-verdict.js";
import type { MirrorStep, MirrorVerdictReason } from "./simon.js";
import type { Color, Creature, PodKind } from "./types.js";

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
   * again after a hit (`wave-fail.ts`), which opens without its guide. */
  | { type: "needWave"; wave: number; retry?: true }
  /** A hit failed the wave: the field holds, then the pair is asked. */
  | { type: "waveFailed"; wave: number }
  /** One seat answered QUIT on the lost screen: the run is over for both,
   * and the other phone is told who it was (`wave-fail.ts`). */
  | { type: "quit"; player: 1 | 2 }
  /**
   * THE WEIGHT gave: both seats had a hand on it for `weightCrushMs`.
   *
   * Its own event rather than a `destroy`, because `destroy` carries the colour
   * the body is broken into and a weight has none — nothing can be fired at it,
   * so it never had one. It is also a different picture: a body that has been
   * *pressed* gives inward between two hands rather than bursting outward, and
   * it is the one kill in the game both players earned with the same gesture at
   * the same instant (`sim/weight.ts`).
   */
  | { type: "weightCrushed"; col: number; row: number }
  /**
   * A hand carried across THE CAIRN took a unit out of the pile, on the side
   * the finger went. `player` is the seat charged the column, and there is one
   * of these per hand that paid — two thumbs pulling the same way both earned
   * it, and `carry` next door already settles that question the same way.
   *
   * Its own event rather than `carry`: nothing moved a lane. What happened is
   * that a body stopped being part of a boss, and the rock standing in that
   * column a tick later is the same stone the pair has been looking at
   * (`sim/cairn.ts`).
   */
  | { type: "cairnPulled"; player: 1 | 2; col: number; row: number }
  /**
   * The pile ran out of patience and let one go itself, into the column it had
   * been announcing on player 1's screen. No `player`: this is the one thing in
   * the fight neither of them did, which is the whole of what it says.
   */
  | { type: "cairnShed"; col: number; row: number }
  /** `lance` is true when the shot left a full lobe — see `lance.ts`. */
  | { type: "fire"; col: number; color: Color; lance: boolean }
  /** The lobe came full: from this moment the next shot out of it is a lance. */
  | { type: "lanceFull"; col: number }
  /** A shot went out through a lobe that was not full yet, and took the fill with it. */
  | { type: "lanceSpilled"; col: number }
  /**
   * A body was destroyed. `kind` is what it was **drawn as** and not what it
   * was — `wornKind`, never `c.kind` — because a lure is a full-size slick or
   * bulb in every pixel player 1 owns right up to the beat it goes, and an
   * event naming the real kind would put a tell on that screen the frame it
   * dies.
   *
   * It carries the kind as well as the colour because the colour alone cannot
   * say what died: red is a slick and cyan a bulb, which is right for an
   * ordinary kill and wrong for every body that is neither. `effects-break.ts`
   * cuts the pieces of a broken body out of that body's own contour, and a
   * magnet cut into a slick's wedges is the wrong silhouette at a size where
   * the difference is visible.
   *
   * `of` is the creature it *was*, and it is set by exactly two kills — the
   * echo's and the rind's — because those are the two whose strike
   * (`render/body-hit.ts`, `hitFor`) differs from the worn body's. Neither is
   * a secret: both seats watch an echo divide and a rind shed. A lure never
   * sets it, for the reason above, and a kind whose strike is the worn body's
   * has no cause to.
   */
  | {
      type: "destroy";
      col: number;
      row: number;
      color: Color;
      kind: Creature["kind"];
      of?: Creature["kind"];
    }
  | { type: "hole"; col: number; row: number }
  | { type: "reject"; col: number; row: number }
  /**
   * A bolt turned away by a body that is not stone and cannot be broken — THE
   * GUM, THE LIMPET, THE LEECH, THE WEIGHT (`bullet-hit.ts`).
   *
   * Its own event and not `magnetPlate`, which carries the same three fields:
   * that one is drawn from the plate's own offset on the magnet's shape, and a
   * ricochet starting there would begin a tile below a gum. The *look* is the
   * same one, called rather than copied (`render/magnet-bounce.ts`).
   */
  | { type: "bounce"; col: number; row: number; color: Color }
  /**
   * A rock turned at the shield. `seed` is the creature's id and `holes` its
   * craters — the two numbers `drawRockBody` paints a rock from — so the
   * bounce wears the look the pair watched fall (`render/deflect.ts`).
   */
  | {
      type: "deflect";
      col: number;
      span: number;
      kind: Creature["kind"];
      fromRow: number;
      seed: number;
      holes: number;
    }
  /** A hand took hold. Only the moment it lands — the hold itself is state,
   * not an event, and render/ reads it off the world every frame. */
  | { type: "grip"; player: 1 | 2; col: number; row: number }
  /**
   * THE PUSH: a held body spent a column and stepped it, on the beat. `player`
   * is the hand that spent it, and both are pushed when both hands pulled the
   * same way — two thumbs on one rock is a thing the pair may do, and each of
   * them has earned the sound. `dir` is which way it went.
   *
   * The hold is state and the carry is not, which is the same split `grip`
   * makes: what render/ reads off the world every frame is a hand on a body,
   * and this is the one moment it moved.
   */
  | { type: "carry"; player: 1 | 2; col: number; row: number; dir: -1 | 1 }
  | { type: "podLoose"; col: number; row: number }
  | { type: "podTaken"; col: number; kind: PodKind }
  | { type: "podLost"; col: number }
  /**
   * A husk went in, and the wave with it (`pod-intake.ts`).
   *
   * It carries where it was and what it was wearing, which `podLost` does not:
   * a husk's whole last second is a picture of the thing the pair refused, so
   * what is drawn has to be the body that was hanging there rather than a
   * generic one (`render/src/husk-deflate.ts`).
   */
  | { type: "huskSwallowed"; col: number; row: number; kind: PodKind }
  /** A husk reached the ship, or the far wall, and was refused: it lets its air
   * go and flies off. `row` for the wall — a husk that crossed the field and
   * left was never anywhere near the hull. */
  | { type: "huskRefused"; col: number; row: number; kind: PodKind }
  | {
      type: "breach";
      col: number;
      /** How it sounds: a rock going through the plate, or a body brushing
       * it (`hull-damage.ts`). It used to be the hull points it cost, which
       * `packages/audio` split its cue on; there are no points any more. */
      weight: BreachWeight;
      span: number;
      kind: Creature["kind"];
      fromRow: number;
      /** The body's id and craters, as on `deflect`; 0 and 0 when no body
       * fell — a round that breaks the hull with nothing on the field. */
      seed: number;
      holes: number;
      /**
       * The colour of the body that broke through, so the burst can be thrown
       * in it (`effects-breach.ts`). null for everything colourless — a rock,
       * and the rounds that break the hull with no body on the field at all.
       */
      color: Color | null;
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
  /**
   * Something armoured came open under a hand and the thing behind it can be
   * shot: THE WARDEN's hatch, when the line comes fully taut, and THE LID's
   * plates, when the cord does. **One event for both**, because they are one
   * moment — a gate held open by somebody pulling, in the colour the shot has
   * to carry — and the ear has nothing to gain from telling them apart when
   * the eye already has (`lid.ts`, `warden.ts`).
   */
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
  | { type: "mazeProbe"; ring: number; angleMilli: number; of: number }
  /** A round is settled — right or wrong, why, and the mouth it landed in. */
  | { type: "mazeVerdict"; right: boolean; col: number; reason: MazeVerdictReason }
  | { type: "mazeDown"; col: number }
  | CreatureEvent
  /**
   * A salvo into open water on THE FLEET's chart, in the chart's own
   * coordinates, which are the field's. Its own event and not a `reject`: the
   * ear has to tell "that did nothing" from "that was a square, and it was
   * empty" — a splash spends the square and the rest, a press onto a square
   * already fired at spends neither. Both seats hear it — the chart is the one
   * thing in this fight the two share. THE FLEET's five: `events-fleet.ts`.
   */
  | FleetEvent
  // The bosses' own arms, next door: this file keeps hitting its 250-line limit.
  | SpliceEvent
  | StareEvent
  | BatonEvent
  | UndertowEvent
  | CandleEvent
  | GorgeEvent;

export type { BatonEvent } from "./events-baton.js";
export type { CandleEvent } from "./events-candle.js";
export type { FleetEvent } from "./events-fleet.js";
export type { GorgeEvent } from "./events-gorge.js";
export type { SpliceEvent } from "./events-splice.js";
export type { StareEvent } from "./events-stare.js";
export type { UndertowEvent } from "./events-undertow.js";
