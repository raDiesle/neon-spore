import type { BalloonState } from "./creature-state-balloon.js";
import type { BeatboxState } from "./creature-state-beatbox.js";
import type { CrawlerState } from "./creature-state-crawler.js";
import type { FenceState } from "./creature-state-fence.js";
import type { GyreState } from "./creature-state-gyre.js";
import type { HeadingState } from "./creature-state-heading.js";
import type { HeldState } from "./creature-state-held.js";
import type { StrandState } from "./creature-state-strand.js";
import type { VeerState } from "./creature-state-veer.js";

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
 * **Eight groups have gone next door**, each a set of fields that only mean
 * anything against each other and each with its own argument in its own
 * header: `creature-state-held.ts` (the four a hand writes),
 * `creature-state-strand.ts`, `creature-state-crawler.ts`,
 * `creature-state-fence.ts`, `creature-state-gyre.ts`,
 * `creature-state-heading.ts` (the four kinds that carry a direction),
 * `creature-state-beatbox.ts` (the count, the run and the beat it stands on)
 * and `creature-state-balloon.ts` (the one body two hands write at once).
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
export interface CreatureState
  extends BalloonState,
    BeatboxState,
    CrawlerState,
    FenceState,
    GyreState,
    HeadingState,
    HeldState,
    StrandState,
    VeerState {
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
   * The tick THE CHOIR's gesture landed on, or absent on a membrane nobody has
   * opened yet and on every other kind. While it is inside `choirFuseBeats`
   * the two bodies are drawing together, the film is still grey and no shot
   * reaches it; when it runs out the kind becomes a slick or a bulb and the
   * colour arrives with it (`choirFused`, choir.ts).
   *
   * A tick and not a countdown, for `veilStruckTick`'s reason above: a window
   * is a moment plus a length, and a number that ticks down is a second copy
   * of the length that can disagree with the config it came from.
   *
   * **It is why the merge is not instant, and that is a rule rather than a
   * flourish.** The owner asked to watch two become one and *then* see the
   * colour arrive — so if the kind flipped on the instant of the gesture, the
   * body would be shootable for a third of a second while it still looked
   * like something no shot can reach. The picture and the rule agree because
   * they are the same number.
   */
  choirFuseTick?: number;
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
  /**
   * The beat a hand last carried this body a column sideways, absent on one
   * that has never been carried (`grip-push.ts`).
   *
   * It is on the body and not on the hand that did it, which is the whole of
   * what the pause means: two hands on one rock, taking turns, would otherwise
   * walk it across the field at twice the speed either could alone. Read it
   * through `carryGrips`, never directly — absent means "ready", and a site
   * that spelled that fallback again is a site where the rule and the picture
   * can disagree about whether a rock may move yet.
   */
  pushBeat?: number;
}
