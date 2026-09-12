import type { SimEvent } from "@neon-spore/sim";
import { handedBurst } from "./effects-spark-handed.js";
import { isSilent } from "./effects-spark-silent.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { assertNever } from "./never.js";
import { PALETTE } from "./palette.js";

/**
 * The events whose whole visible answer is a handful of particles.
 *
 * Most of what happens on the field costs one burst and nothing else: a colour
 * that matched, a colour that did not, a hand landing, a plate coming off a
 * rim. Written as a table rather than as a switch full of one-line cases so
 * `effects.ts` keeps only the events that also change something it remembers —
 * the queen's shudder, the deflection banner, a rock that has not landed yet.
 *
 * A burst here is a request, not a draw. `Effects` owns the particles.
 *
 * The switch is exhaustive **on purpose**, over every case `SimEvent` has —
 * `runtHit` used to fall through a `default: return null` because it reused
 * `destroy`, and the day it stopped reusing `destroy` the burst it drew
 * silently stopped existing. So it is a `default` that only compiles if `e`
 * has narrowed to `never`: add a case to `SimEvent` and forget a line here,
 * and `assertNever` stops type-checking instead of quietly drawing nothing.
 */
export interface Burst {
  x: number;
  y: number;
  /** How many particles. Scale with what it cost, not with what it was. */
  n: number;
  hex: string;
}

export function burstFor(e: SimEvent, l: Layout): Burst | null {
  // The long tail of events that are answered some other way, taken out of the
  // union before the switch sees it (`effects-spark-silent.ts`). The guard
  // narrows, so `assertNever` still catches an event accounted for in neither.
  if (isSilent(e)) return null;
  switch (e.type) {
    case "destroy":
      return at(l, e.col, e.row, 12, e.color === "red" ? PALETTE.red : PALETTE.cyan);
    // A ring off THE CRAWLER, and the largest shower this table throws for
    // anything that is not a boss going down. It is the same kill a `destroy`
    // is and it is worth the same score, so the size is not saying "this was
    // harder" — it is saying what came apart. Every other body in the game
    // goes out; a crawler's ring is a sac under pressure, and the owner asked
    // for it to burst like one. The goo it throws with it is a shape rather
    // than a spray and is drawn in `crawler-fx.ts`.
    case "crawlerBreak":
      return at(l, e.col, e.row, 30, e.color === "red" ? PALETTE.red : PALETTE.cyan);
    case "reject":
      return at(l, e.col, e.row, 5, PALETTE.sparkDim);
    // The moment a hand lands. The hold itself is drawn from the world every
    // frame (grip.ts); this is only the grab.
    case "grip":
      return at(l, e.col, e.row, 7, PALETTE.pod);
    case "hole":
      return at(l, e.col, e.row, 5, PALETTE.rock);
    // A plate off THE WARDEN's rim throws material the way a petal does, in
    // the rim's own colour — which is the colour that took it.
    case "plate":
      return at(l, e.col, e.row, 14, e.color === "red" ? PALETTE.red : PALETTE.cyan);
    case "petal":
      return at(l, e.col, e.row, 12, PALETTE.hullRim);
    case "queenDown":
      return at(l, e.col, e.row, 24, PALETTE.red);
    case "wardenDown":
      return at(l, e.col, e.row, 24, PALETTE.rock);
    // THE GYRE's armature failing, a beat after the last body on it went. The
    // rock's colour and not a body's: nothing living broke here — every mount
    // was already gone, each with its own burst — and what is left is
    // structure letting go. Sized with the two bosses, because it is the end
    // of an arrival. THE STRAND's thread used to share the line and no longer
    // does: it burns (`strand-fuse.ts`), and its big moment is where the two
    // fronts meet, not the beat it parted.
    case "gyreBroke":
      return at(l, e.col, e.row, 24, PALETTE.rock);
    case "podLoose":
      return at(l, e.col, e.row, 10, PALETTE.ember);
    case "podLost":
      return { x: tileCX(l, e.col), y: l.hullY, n: 12, hex: PALETTE.sparkDim };
    // The ignition, at the tile the body stood in. It used to be eight grey
    // particles, smaller than a kill so a shot that felt satisfying to fire
    // read as smaller than it felt; a lure now goes up and takes the hull with
    // it in three places, so it is the other way round on both counts. And a
    // bead swelling back on a thread is the same mistake in the same colour.
    case "lureHit":
    case "strandSwell":
      return at(l, e.col, e.row, 26, e.color === "red" ? PALETTE.red : PALETTE.cyan);
    // A piece coming off THE SHELL: an ordinary burst in the armour's own
    // material colour. The raw edge it leaves behind is not drawn here —
    // that outlives the burst and is redrawn fresh every frame straight off
    // `Creature.shell`, in `shell-draw.ts`, which needs no state of its own.
    case "shellBreak":
      return at(l, e.col, e.row, 8, PALETTE.ember);
    // The last piece: the body's colour exists from this event onward and
    // never before it (`shell-round.ts`'s `bareTheCore`) — the biggest burst
    // this file throws for anything short of a boss going down, because this
    // is the one moment the pair has no way to have seen coming.
    case "shellBare":
      return at(l, e.col, e.row, 20, e.color === "red" ? PALETTE.red : PALETTE.cyan);
    // A clasp opened by the ward. The shield came apart, so the burst is the
    // shield's own colour and not the body's — the body did not break, it was
    // uncovered, and it is standing there in its colour a frame later for
    // anyone who needs reminding which trigger to load. Sized between a
    // shell piece and a bare core: bigger than chipping something, smaller
    // than the reveal `shellBare` is, because nothing was revealed here that
    // was not already visible through the shield the whole way down.
    case "claspBreak":
      return at(l, e.col, e.row, 14, PALETTE.claspShield);

    // THE COIL's dome, and `claspBreak`'s burst word for word: it is the same
    // shell coming off, so it is the same colour and the same size, whichever
    // of the two opened it. Nothing was revealed — a rock was visible through
    // the dome the whole way across — and the lane has not closed either,
    // which is why this is deliberately not a `destroy`'s worth of anything.
    case "coilBreak":
      return at(l, e.col, e.row, 14, PALETTE.claspShield);

    // A layer off THE RIND, and a bead shrivelling on THE STRAND: the body's
    // own colour, because the shot landed and the pair should feel that it did
    // — and half the particles of a `destroy`, because the thing is still
    // there and the burst must not read as the end of it. What each becomes is
    // not drawn here at all: both are read fresh every frame off the body,
    // which is the one thing that cannot go stale across a restart.
    case "rindShed":
    case "strandBead":
      return at(l, e.col, e.row, 10, e.color === "red" ? PALETTE.red : PALETTE.cyan);

    // A recoil bouncing, and the one hit in this table whose burst is **not**
    // a body's colour. Nothing living broke — the cage held and vented — so
    // the particles are the fire's, which is also what the jet under them is
    // drawn in (`recoil-vent.ts`). A red or cyan burst here would be the one
    // misleading thing this file could draw: the colour on the event is the
    // one the body has *become*, and a shower of it at the moment of the hit
    // would read as the shot having matched what is standing there now.
    // Thrown at the tile it was struck in, for the jet's reason.
    case "recoilBounce":
      return at(l, e.col, e.row, 10, PALETTE.ember);

    // A carom's crust coming apart, in the **rock's** colour and not the
    // body's — `recoilBounce`'s argument from the other side. The body is
    // gone and the picture must not say the *column* is: a rock still stands
    // in the lane and somebody has to ward it. So the particles are the
    // shell's, as many as a `shellBare` gets — a covering coming off. And THE
    // CRYSTAL's join breaking: the same shell's colour, on the middle tile.
    case "caromCrack":
    case "crystalSplit":
      return at(l, e.col, e.row, 20, PALETTE.rock);

    // A plate off THE VOLLEY, in the **shield's** colour rather than the
    // shell's — `caromCrack`'s argument from the third side: the shell is off
    // and the lane has not closed, and the one thing worth saying is which
    // control did the work. So the sparks are the dome's, thrown where the
    // body met it — a few, because the shell's own material is real pieces
    // now (`volley-shards.ts`) and squares over fragments is two effects.
    case "volleyReturn":
      return at(l, e.col, e.row, 6, PALETTE.shieldRim);

    // And the shell itself, coming apart in mid-air: a handful of the rock's
    // colour under the fragments `volley-shards.ts` throws. Not the ordinary
    // colours: nothing died, and a red or cyan shower is what this game pays
    // for a lane closing.
    case "volleyHatch":
      return at(l, e.col, e.row, 6, PALETTE.rock);

    // A wrong colour into a cloud. Grey, and fewer particles than a `reject`:
    // the shot did not bounce off anything, it went in and the weather shut
    // over it (`impact.absorb`). The red cloud after is not a burst at all —
    // it is world state for two seconds, read off `veilStruckTick` in `veil.ts`.
    case "veilRebuff":
      return at(l, e.col, e.row, 4, PALETTE.sparkDim);

    // THE FENCE going over the ship. The wall does not touch anything — that
    // is the whole of a pass — but the current earths around the dome on the
    // way through, so the burst is the shield's colour, thrown at the shield's
    // own column. A big one: it is the beat the pair learns whether the number
    // that crossed the room was the right one.
    case "fencePass":
      return at(l, e.col, e.row, 20, PALETTE.shieldRim);

    // A bolt cutting the wire. Fewer particles than a pass and in the fence's
    // own blue rather than the dome's cyan: what came apart is one column of a
    // line that is still there, and a burst the size of a pass would read as
    // the whole thing going out.
    case "fenceBurn":
      return at(l, e.col, e.row, 12, PALETTE.arc);

    // A bolt turned away by the plate under a magnet. Rock grey and few, so
    // nothing about it reads as a hit: a kill is the body's colour and a wrong
    // colour is a `reject`, and this is neither — it is a shot that arrived on
    // the wrong bearing and struck armour. The plate itself goes white under
    // it, which is where the eye is sent (`magnet.ts`).
    case "magnetPlate":
      return at(l, e.col, e.row, 7, PALETTE.rock);

    // THE CHOIR's film finishing, and the colour arriving with it.
    // `claspBreak`'s burst word for word and for its reason — a covering
    // leaving a body that goes on falling — except that this one is thrown in
    // the colour the body has *just* acquired. Nothing was uncovered: the
    // colour did not exist a frame ago, and this is the moment the pair
    // finally learn which trigger to load, so the burst is what tells them.
    //
    // The **start** of the closing throws nothing, and deliberately: the whole
    // screen is shaking on that beat (`choir-quake.ts`), and particles under
    // an earthquake are particles nobody can see.
    case "choirOpen":
      return at(l, e.col, e.row, 14, e.color === "red" ? PALETTE.red : PALETTE.cyan);

    // And the chord. Rock grey and wide, so it reads as the membrane doing
    // something rather than as anything landing: it is deliberately not a
    // `destroy`'s colour and not a `reject`'s tightness — the pair fumbled a
    // gesture, and the hull damage on the `breach` beside it is where the cost
    // is drawn (`sim/choir.ts`).
    case "choirSing":
      return at(l, e.col, e.row, 18, PALETTE.rock);

    // THE BEATBOX's three: a tap's white receipt, the box quiet in the green
    // that means a thing went right, and the discharge in the red of what it
    // costs. The silencing is wide and rides over `beatbox-silence.ts`'s rings.
    case "beatboxTap":
      return at(l, e.col, e.row, 6, PALETTE.text);
    case "beatboxSilent":
      return at(l, e.col, e.row, 30, PALETTE.good);
    case "beatboxWave":
      return at(l, e.col, e.row, 12, PALETTE.red);

    // The bodies answered by hands alone — THE BALLOON, THE GUM, THE CHOKE —
    // in a file of their own when THE CHOKE's three took this one past its
    // limit (`effects-spark-handed.ts`).
    case "balloonSplit":
    case "balloonBurst":
    case "gumStick":
    case "gumFlung":
    case "gumBlock":
    case "chokeGrip":
    case "chokeTap":
    case "chokeFreed":
      return handedBurst(e, l);

    default:
      return assertNever(e);
  }
}

function at(l: Layout, col: number, row: number, n: number, hex: string): Burst {
  return { x: tileCX(l, col), y: tileCY(l, row), n, hex };
}
