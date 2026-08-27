import type { SimEvent } from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";
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
    case "tetherTorn":
      return at(l, e.col, e.row, 10, PALETTE.rock);
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
    case "runtHit":
      return at(l, e.col, e.row, 8, PALETTE.sparkDim);

    // Everything below is drawn some other way, or not drawn as a burst at
    // all, and says so rather than falling through a default that could not
    // tell the difference between "decided" and "forgotten".
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
    case "eyeOpen": // The pupil's dilation is derived from `openBeat`, not an event.
    case "vent": // The rock leaving the socket is the boss's own draw, not a spark.
    case "mirrorShow": // THE MIRROR's ghost shot — `simon-fx.ts` owns the whole sequence.
    case "mirrorEcho":
    case "mirrorVerdict":
    case "mirrorDown":
    case "forkWait": // The fork's whole picture is `hud.ts`'s `drawFork`, driven by state.
      return null;
    default:
      return assertNever(e);
  }
}

function assertNever(x: never): never {
  throw new Error(`burstFor: unhandled SimEvent ${JSON.stringify(x)}`);
}

function at(l: Layout, col: number, row: number, n: number, hex: string): Burst {
  return { x: tileCX(l, col), y: tileCY(l, row), n, hex };
}
