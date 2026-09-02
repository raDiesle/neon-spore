import type { SimEvent } from "@neon-spore/sim";
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
 * silently stopped existing. Nothing failed: the type checker was satisfied
 * by a branch that also covered every event nobody had thought about yet. The
 * fix is the same one `content/briefings.ts` already leans on for `BriefingId`
 * — a form that cannot compile while something is unaccounted for. A `switch`
 * cannot be a `Record`, so here it is a `default` that only compiles if `e` has
 * narrowed to `never`, meaning every other case matched: add a case to
 * `SimEvent` and forget a line here, and `assertNever` stops type-checking
 * instead of quietly drawing nothing.
 */
export interface Burst {
  x: number;
  y: number;
  /** How many particles. Scale with what it cost, not with what it was. */
  n: number;
  hex: string;
}

export function burstFor(e: SimEvent, l: Layout): Burst | null {
  switch (e.type) {
    case "destroy":
      return at(l, e.col, e.row, 12, e.color === "red" ? PALETTE.red : PALETTE.cyan);
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
    case "podLoose":
      return at(l, e.col, e.row, 10, PALETTE.ember);
    case "podLost":
      return { x: tileCX(l, e.col), y: l.hullY, n: 12, hex: PALETTE.sparkDim };
    // Not `destroy`'s red or cyan — the whole point is that it must not look
    // like a kill. `sparkDim` is already the colour this game spends on "not
    // what you wanted" (`reject`, `podLost`), and fewer particles than a real
    // destroy, so a shot that felt satisfying to fire reads as smaller than it
    // felt (`docs/spec/audio.md` makes the same call for the ear).
    case "lureHit":
      return at(l, e.col, e.row, 8, PALETTE.sparkDim);
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

    // A wrong colour into a cloud. Grey, and fewer particles than a `reject`,
    // because the shot did not bounce off anything — it went in and the
    // weather shut over it (`impact.absorb` is the ear's half of the same
    // sentence). The red cloud that follows is not a burst at all: it is
    // world state for two seconds, read fresh every frame off
    // `veilStruckTick` in `veil.ts`.
    case "veilRebuff":
      return at(l, e.col, e.row, 4, PALETTE.sparkDim);

    // Everything below is drawn some other way, or not drawn as a burst at
    // all, and says so rather than falling through a default that could not
    // tell the difference between "decided" and "forgotten".
    // A cloud coming apart and the body inside it showing: `veil-tear.ts`
    // draws the whole of it, and the ordinary `destroy` that rides beside it
    // on the same tick is what throws the particles.
    case "veilTorn":
    // The body inside a cloud turning over. Nothing left the field and
    // nothing arrived — the cloud goes on falling and its lightning goes on
    // striking. A burst here would say something broke.
    case "veilMorph":
    // A lure going is drawn *inward*, by `lure-vanish.ts`, and particles are
    // the whole of what it must not have: every burst in this table throws
    // material away from a body, which is the picture of something being
    // broken. Nothing broke — it left.
    case "lureVanished":
    case "lureSeen": // Player 2's ear and player 2's strip; nothing on the field.
    case "beat": // The click track and the HUD dots; no tile, nothing to burst.
    case "waveStart": // The banner, not a burst — `banner.ts`, driven by the host.
    case "needWave": // Bookkeeping between the host and the sim; nothing on the field.
    case "fire": // The bolt leaving is drawn as a bolt, over the beats it travels.
    case "lanceFull": // The lobe's own fill reads the mark; nothing else to add.
    case "lanceSpilled": // Likewise — the fill emptying is the whole picture.
    case "deflect": // `effects.ts` builds its own bursts once the rock arrives.
    case "podTaken": // `effects.ts` throws sparks inward directly — see `swallow.ts`.
    case "breach": // `effects.ts` waits for a falling rock before it bursts anything.
    case "tether": // The rim's own colour is read off the world every frame.
    case "eyeOpen": // The hatch's openness is the rope's tension, not an event.
    case "mirrorShow": // THE MIRROR's ghost shot — `simon-fx.ts` owns the whole sequence.
    case "mirrorEcho":
    case "mirrorVerdict":
    case "mirrorDown":
    // THE MAZE, all four of them: the shot going down the tangle is the whole
    // picture and it is not a spark on the field. Silent until the lane that
    // draws the lattice says otherwise.
    case "mazeCommit":
    case "mazeProbe":
    case "mazeVerdict":
    case "mazeDown":
    // And the one event in the union that carries no position at all, so a
    // spark could not be put anywhere even if this creature wanted one.
    case "wispHop":
      return null;
    default:
      return assertNever(e);
  }
}

function at(l: Layout, col: number, row: number, n: number, hex: string): Burst {
  return { x: tileCX(l, col), y: tileCY(l, row), n, hex };
}
