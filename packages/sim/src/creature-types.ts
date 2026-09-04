import type { CreatureKind } from "./creature-kinds.js";
import type { DartDir } from "./dart.js";
import type { GhostDir } from "./ghost.js";
import type { Color } from "./types.js";

/**
 * What a **body on the field** is made of.
 *
 * Split out of `types.ts` when THE RECOIL's own field took that file past its
 * 250-line limit for the fifth time, and along the seam that file had already
 * written down: it grows in exactly one place, and the place is this. Nearly
 * every kind added to the bestiary since THE DART has brought a field with it,
 * and four halves have been carried out of `types.ts` already —
 * `hull-types.ts`, `pod-types.ts`, `command-types.ts`, `bullet-types.ts` —
 * each of them the part that was *not* growing. This is the part that was, so
 * it is the last cut that file needs: what is left next door is `Color` and a
 * barrel of re-exports, and neither has changed in a year.
 *
 * `Color` comes back from `types.js`, which is a type-only cycle and the one
 * `bullet-types.ts` already stands in: the two colours are what the whole
 * simulation is written in terms of, so they stay at the door.
 *
 * Re-exported from `types.ts`, so nothing that already reaches for a
 * `Creature` through that file had to move.
 */
export interface Creature {
  id: number;
  kind: CreatureKind;
  /** Column it occupies. Every kind but the dart holds the one it arrived in. */
  col: number;
  /** Row after the most recent beat. Row `hullRow` means it has reached the hull. */
  row: number;
  /** Row before the most recent beat, for interpolation in render/. */
  fromRow: number;
  /**
   * Column before the most recent beat, for the same interpolation — absent on
   * every kind that never changes lanes, which is every kind but the dart.
   *
   * Read through `drawnCol` (render/depth.ts) and nowhere else: absent means
   * "it is where it has always been", and a site that reached for the field
   * directly would slide every other body from column zero on its first beat.
   * Deliberately outside `hashWorld` for `fromRow`'s reason — where a body
   * came from is a fact about the picture, not about the world.
   */
  fromCol?: number;
  /** null for meteors, which cannot be shot. */
  color: Color | null;
  /**
   * Columns this body occupies, when that is not simply its kind's own width.
   * Absent on everything a wave does not size — which is everything but a
   * rock, whose arrival may be authored one tile wide or two (`RockSize`).
   *
   * Never read directly: `spanOf` is the rule, and it is in the fingerprint
   * below because two devices that disagree about how wide a rock is disagree
   * about which columns the shield has to cover.
   */
  span?: number;
  /** The kind a `lure` is drawn as, absent otherwise. Read it via `wornKind` —
   * the ternary by hand is how player 1 gets a tell (creature-rules.ts). */
  wears?: CreatureKind;
  /**
   * Craters left by shots. A meteor keeps its size and stays indestructible —
   * the holes are the only trace. render/ places crater `k` from the id.
   */
  holes: number;
  /** Petals left on a queen, 0 on every other kind. */
  petals: number;
  /**
   * Thousandths of a tile a grip has held back and not yet spent. Zero unless
   * a hand is on it — see `grippedFallTiles` in grip.ts, which is the only
   * thing that reads or writes it.
   */
  dragMilli: number;
  /**
   * Whether a `throb` can be hit this beat. False on every other kind. Set
   * once a beat, in `onBeat`, from `throbIsOpen` — never computed a second
   * time from `world.beat` at hit time, so render/ and bullet-hit.ts agree
   * about the same instant without either owning the cycle.
   */
  throbOpen: boolean;
  /**
   * Pieces of shell still on, one bit each, bit `k` for the piece in front of
   * column `col + k`. `NO_SHELL` on every other kind, and on a shell whose
   * last piece is off — which is exactly when `color` stops being null.
   *
   * A mask and not a count, because which of them is gone is what the pair has
   * to say out loud. Never read by hand: `shellHasPiece`, `shellPiecesLeft`
   * and `shellIsBare` in `shell.ts` are the rules, and purity.test.ts holds
   * everything else to calling them.
   */
  shell: number;
  /**
   * The dart's three fields, and `dart.ts` is the whole of what they mean.
   * `dartDir` is the side it is concerned with now (`-1` left, `1` right),
   * `dartNext` the side of the move after that — rolled a beat early, which is
   * what lets a path be previewed while the body is still in the air — and
   * `dartFloat` says which beat of the two it is on: true while it hangs.
   *
   * Read the two sides through `dartHeading` and `dartNextHeading`, never
   * directly: the lean, the jet, the arrow and the previewed legs are five
   * pictures of two numbers, and a second copy of the fallback is how they
   * come to disagree.
   */
  dartDir?: DartDir;
  dartFloat?: boolean;
  dartNext?: DartDir;
  /**
   * The tile THE WISP will stand on after its next hop, packed as
   * `row * cols + col`, absent on every other kind. **Rolled on the beat it
   * lands, not the beat it leaves** — `dartNext`'s arrangement, and `wisp.ts`
   * carries the argument: it is what lets render mark the square from the
   * moment the last jump ends, so the pair has a whole dwell to say two
   * characters across the room. Packed because that is the shape it comes off
   * the stream in, so the fingerprint hashes the roll itself; read it through
   * `wispTileAt` and never by dividing it here.
   */
  wispNext?: number;
  /**
   * The tick a wrong colour last struck THE VEIL, or absent on a cloud nobody
   * has missed and on every other kind. While it is inside `veilArmourMs` the
   * cloud is shut and no shot reaches the body inside it.
   *
   * A tick and not a countdown, for `World.guardTick`'s reason: a window is a
   * moment plus a length, and a number that ticks down is a second copy of the
   * length that can disagree with the config it came from. Read it through
   * `veilIsArmoured` and `veilArmourPhase` (veil.ts) and never by hand — the
   * red cloud render/ draws and the shot the simulation refuses are one fact.
   */
  veilStruckTick?: number;
  /**
   * THE GHOST's two fields, and `ghost.ts` is the whole of what they mean.
   * `ghostDir` is which way along its row a *crossing* ghost is going (`-1`
   * left, `1` right) and its presence is the path itself — absent means this
   * ghost falls like every other body. `ghostLaps` is how many walls it has
   * already turned at, which is how angry it is, and at `ghostChargeLaps` it
   * stops prowling and comes down at the hull.
   *
   * Read them through `ghostCrosses`, `ghostLaps` and `ghostIsCharging`, never
   * directly: the picture that drops the camouflage, the step that decides
   * which way the body moves and the damage the hull takes are three readings
   * of one count, and a second copy of the threshold is how they disagree.
   */
  ghostDir?: GhostDir;
  ghostLaps?: number;
  /**
   * How many times THE ECHO still divides, and absent on every other kind. It
   * is the only state this creature carries, and it answers three questions at
   * once: whether this body divides on the next beat, how far apart the two
   * halves stand when it does (`echoSpread`), and what a shot at it is worth
   * (`echoBodies`).
   *
   * Read it through `echoSplitsLeft`, never directly. An echo that has
   * finished dividing carries no field at all — it is a small body falling and
   * nothing else — so absent and zero mean the same thing, and a site that
   * spelled the fallback again is a site where the picture, the fan and the
   * score can disagree about which generation a body belongs to.
   */
  echoSplits?: number;
  /**
   * The beat THE ECHO came into being — the arrival's own, or the beat the
   * division that made it happened on. Absent on every other kind.
   *
   * A moment and not a countdown, for `Creature.veilStruckTick`'s reason and
   * rather more of it: the wait grows with each generation (`echoWaitBeats`),
   * so a stored countdown would be a second copy of a number that is already
   * derived, and the picture render draws of a body straining apart would be
   * able to disagree with the beat it actually comes apart on.
   *
   * Read it through `echoDue` and `echoSplitPhase`, never by hand.
   */
  echoBeat?: number;
  /**
   * How many layers THE RIND still sheds before a shot kills it, and absent on
   * every other kind. It is the only state this creature carries, and it
   * answers two questions at once: whether the next matching shot takes a
   * layer or the body, and how big the thing is drawn — one body's footprint
   * per layer still on (`livingBodyMul` in render).
   *
   * Read it through `rindLayersLeft`, never directly. A rind cut down to size
   * carries no field at all — it is an ordinary body falling and nothing
   * else — so absent and zero mean the same thing, and a site that spelled the
   * fallback again is a site where the picture and the shot can disagree about
   * whether this is the one that finishes it.
   */
  rindLayers?: number;
  /**
   * THE GYRE's two hub fields, and `gyre.ts` is the whole of what they mean.
   * `gyreTurnMilli` is how far the wheel has turned, in thousandths of a rim
   * position, wrapped at `GYRE_TURN_MILLI` so it stays a bounded integer;
   * `gyreStep` is how many beats it has been on the field, which is its route
   * and its speed at once — how far it has fallen, which corner of the diamond
   * it is walking to, how many laps it has sunk and how fast the rim is going
   * are all read off it.
   *
   * Thousandths and not whole clicks, for `dragMilli`'s reason: the rim
   * accelerates, so the turn one beat buys is a fraction of a position and the
   * remainder has to be carried rather than rounded away, or the wheel would
   * have three speeds. Read them through `gyreClick`, `gyreAt` and
   * `gyreSpinPerBeat` (`gyre-rim.ts`) and never by hand — where the six bodies
   * stand, where the spokes are drawn and which column a shot has to be fired
   * up are four readings of the same two numbers.
   */
  gyreTurnMilli?: number;
  gyreStep?: number;
  /**
   * A mount's two, and absent on everything that is not one. `gyreId` is the
   * hub it rides and its presence *is* the attachment — `carryMounts` moves
   * whatever names one and `gyreMountsLeft` counts the same field to decide
   * when the wheel breaks — and `gyreSlot` is which of the six positions on
   * the rim, 0..5, which fixes the mount's colour (`mountColor`) as well as
   * its place, so the alternation around the rim is one fact and not two.
   */
  gyreId?: number;
  gyreSlot?: number;
  /**
   * How far player 1's hand has carried THE LID's cord from where it grabbed,
   * across and down, in thousandths of a tile — and **absent on a lid nobody
   * has hold of**, which is what makes the absence itself the answer to "is a
   * hand on this": a grab reports zero, so nought and nothing are two states.
   * The two together are the pull and its **length** is the tension. Read them
   * through `lidPull`, `lidOpenMilli`, `lidIsOpen` and `lidIsHeld`, never
   * directly; `handle-pull.ts` is what bounds them.
   */
  lidPullMilli?: number;
  lidPullYMilli?: number;
  /** Where the handle was when the hand took it, held there until the hand lets
   * go: the handle is this plus the pull, which is what keeps it under the
   * finger while the body falls away (`lidHandleMilli`). Absent unheld. */
  lidAnchorMilli?: number;
  lidAnchorYMilli?: number;
  /**
   * How many times THE RECOIL still survives a shot, and absent on every other
   * kind. It is the only state this creature carries, and it answers three
   * questions at once: whether the next matching shot throws the body back or
   * kills it, how battered the cage around it is drawn (`render/recoil.ts`),
   * and how many more times the pair has to say the sentence again.
   *
   * Read it through `recoilBouncesLeft`, never directly. A recoil that has
   * spent every bounce carries no field at all — it is an ordinary body inside
   * a broken cage — so absent and zero mean the same thing, and a site that
   * spelled the fallback again is a site where the picture and the shot can
   * disagree about whether this is the one that finishes it.
   */
  recoilBounces?: number;
}
