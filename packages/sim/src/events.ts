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
  /**
   * A lure was shot — a mistake, not a kill (`resolveLure`, bullet-hit.ts).
   * Its own event because the ear has to tell this apart from an ordinary
   * `destroy`: the same reflex that pays off everywhere else on the field is
   * wrong here, and a sound identical to a kill is the one that would hide
   * that from the pair.
   */
  | { type: "lureHit"; col: number; row: number }
  /**
   * A lure came onto the field. Player 2's alarm cue hangs off this and player
   * 1's device plays nothing for it: a chime both phones make would carry the
   * disguise straight through the speaker, in a room where the two of them are
   * sitting next to each other.
   */
  | { type: "lureSeen"; col: number }
  /**
   * A lure left the field on its own, `lureVanishRows` short of the hull. The
   * one moment of this creature both screens show identically, and player 1's
   * vindication: the body they were told to leave alone resolved itself.
   *
   * `color` is the disguise's — the only colour either player has ever seen it
   * in — so what fades is what was standing there, and nothing is revealed at
   * the last instant that was hidden a moment before it.
   */
  | { type: "lureVanished"; col: number; row: number; color: Color }
  /**
   * A piece of THE SHELL came off, in the column it was struck. `left` is how
   * many are still on, which is what the pair now has to name: after the first
   * break the two columns of one body stop being interchangeable.
   */
  | { type: "shellBreak"; col: number; row: number; left: number }
  /**
   * The last piece went and the body under it carries a colour for the first
   * time. `col` is the body's own leftmost column rather than the struck one,
   * because this is about the whole arrival and not about the tile a shot
   * landed in. Nothing knew this colour a tick ago — it is drawn at the break
   * (`shell-round.ts`), which is the only honest way to say so.
   */
  | { type: "shellBare"; col: number; row: number; color: Color }
  /**
   * A clasp was opened by the ward and is now the body it was hiding. `kind`
   * is what it *became*, not what it was: by the time anything reads this the
   * creature is already a slick or a bulb, and an event naming the old kind
   * would be describing something that no longer exists on the field.
   *
   * `color` is the body's, and it was never a secret — a clasp is visibly red
   * or cyan through its shield the whole way down, so that player 2 can be
   * told which trigger to load before the shield is anywhere near it. Absent
   * only for a colourless clasp, which nothing authors.
   */
  | { type: "claspBreak"; col: number; row: number; kind: CreatureKind; color?: Color };
