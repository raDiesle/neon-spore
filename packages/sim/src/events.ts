import type { MirrorStep, MirrorVerdictReason } from "./simon.js";
import type { Color, Creature, PodKind } from "./types.js";
import type { WardenControl } from "./warden-cycle.js";

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
   * THE WARDEN put a line on one of the pair's controls. `control` says which
   * of them is helpless for the next few beats and `color` is what the rim
   * will carry until it lets go — the same colour the one shot at the core
   * has to be.
   */
  | { type: "tether"; col: number; control: WardenControl; color: Color }
  /** The other player pulled it out of the rim, and which of them did. */
  | { type: "tetherTorn"; col: number; row: number; player: 1 | 2 }
  /** The recoil snapped the pupil wide. Two beats, one shot. */
  | { type: "eyeOpen"; col: number; color: Color }
  /** The iris shut and squeezed a rock out of the column it shut on. */
  | { type: "vent"; col: number; kind: Creature["kind"] }
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
   * THE FORK opened: the rest between waves ran out and the run has stopped,
   * waiting on both thumbs (`fork.ts`). No column — it belongs to the whole
   * field, not a tile in it — and no timeout follows it, so this fires once
   * on the way in and nothing repeats it while the pair stands there.
   */
  | { type: "forkWait" }
  /**
   * The Runt was shot — a mistake, not a kill (`resolveRunt`, bullet-hit.ts).
   * Its own event because the ear has to tell this apart from an ordinary
   * `destroy`: the same reflex that pays off everywhere else on the field is
   * wrong here, and a sound identical to a kill is the one that would hide
   * that from the pair.
   */
  | { type: "runtHit"; col: number; row: number }
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
  | { type: "shellBare"; col: number; row: number; color: Color };
