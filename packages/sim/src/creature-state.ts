import type { CaromDir } from "./carom.js";
import type { HeldState } from "./creature-state-held.js";
import type { StrandState } from "./creature-state-strand.js";
import type { VeerState } from "./creature-state-veer.js";
import type { DartDir } from "./dart.js";
import type { GhostDir } from "./ghost.js";

/**
 * **The state one kind carries and no other does.** Every field here is
 * optional, and every one of them is absent on all but a single creature.
 *
 * Split out of `creature-types.ts` when THE CAROM took that file past its
 * 250-line limit, and this is the seam that file was always going to be cut
 * along — its own doc said so, one cut too early. What is left next door is
 * what a body on the field *is*: an id, a kind, a column, a row, a colour, a
 * width, the craters on it. That list is closed and has not changed in a year.
 * This is the list that grows, and it has grown by a field for nearly every
 * creature added since THE DART.
 *
 * **The four fields a hand writes live next door**, in `creature-state-held.ts`.
 * Everything here is written by the beat; those are written by player 1's
 * thumb, and that is the one seam this file has — see that file's own doc, and
 * `config-veer.ts`, which was cut out of `config-creatures.ts` on the same day
 * for the same reason.
 *
 * `Creature extends CreatureState` rather than nesting it under a key, so
 * every call site still reads `c.ghostLaps` and nothing moved. It is the same
 * arrangement `SimConfig` has with `GhostConfig` and `RecoilConfig` next door,
 * and for the same reason: the split is about how much of one file a reader
 * has to hold at once, never about how the thing is addressed.
 *
 * **Absent is a value here, always.** Each field's own paragraph says which
 * rule reads it and what its absence means, and none of them may be read
 * directly — `ghostCrosses`, `recoilBouncesLeft`, `caromHeading` and their
 * siblings are the rules, and a second spelling of a fallback is how the
 * picture and the shot come to disagree about the same body.
 */
export interface CreatureState extends HeldState, StrandState, VeerState {
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
   * The tick a shot of the wrong colour last landed on an *ordinary* body — a
   * slick, a bulb, or anything else that is answered by matching its colour —
   * and absent on one nobody has missed. While it is inside `colourArmourMs`
   * the body refuses every shot, including the right one.
   *
   * Its own field beside `veilStruckTick` rather than a share of it: the two
   * windows are different lengths and are argued about separately, and a
   * single field would make THE VEIL's armour and this penalty one number that
   * could only ever be tuned together. Read it through `colourIsArmoured` and
   * `colourArmourPhase` (colour-armour.ts) and never by hand — the grey body
   * render/ draws and the shot the simulation refuses are one fact.
   */
  colourStruckTick?: number;
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
  /**
   * Which way across the field THE CAROM is going (`-1` left, `1` right), and
   * absent on every other kind. It is the only state this creature carries,
   * and it answers two questions at once: which column the diagonal reaches
   * next, and which of the two side walls it is about to turn at.
   *
   * Read it through `caromHeading`, never directly. A rock made out of a carom
   * carries no heading at all — `caromStruck` clears it, because a body that
   * has stopped crossing has no side to be going to — so absent and "straight
   * down" mean the same thing, and a site that spelled the fallback again is a
   * site where the lean render draws and the column the body lands in can
   * disagree.
   */
  caromDir?: CaromDir;
  /**
   * Whether THE CHUTE's canopy is out, and absent on every other kind. It is
   * the only state this creature carries and it answers two questions at once:
   * which way the body is going — up while it is stowed, down once it is
   * out — and what render draws over it.
   *
   * Read it through `chuteIsOpen`, never directly. Absent and `false` mean the
   * same thing, which is right: a body is thrown out of the hatch with the
   * canopy packed, so "no field yet" *is* "still climbing". A site that
   * spelled the fallback again is a site where the picture and the step can
   * disagree about which direction the thing is travelling.
   */
  chuteOpen?: boolean;
  /**
   * THE VOLLEY's two, and `volley.ts` is the whole of what they mean.
   * `volleyPlates` is how many plates of shell are still on, which is how many
   * wards it still takes and also how much of the ball is drawn filled in; and
   * `volleyRise` is how many beats of the climb a ward has just bought it —
   * absent while it is falling, which is what makes the field's absence the
   * answer to "which way is this body going" and is what `beat.ts` reads to
   * decide whether to let it drop like the rock it otherwise is.
   *
   * Read them through `volleyPlatesLeft` and `volleyClimbLeft`, never
   * directly. A body that has hatched carries neither — `hatchVolley` clears
   * the count and the climb has already run out — so absent and "not a volley"
   * mean the same thing, and a site that spelled a fallback again is a site
   * where the shell drawn and the ward the simulation is holding can disagree
   * about whether this is the last one.
   */
  volleyPlates?: number;
  volleyRise?: number;
}
