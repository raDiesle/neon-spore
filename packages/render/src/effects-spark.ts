import type { SimEvent } from "@neon-spore/sim";
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
 * The switch is exhaustive **on purpose**, over every case `SimEvent` has that
 * is not accounted for in `effects-spark-silent.ts` — `runtHit` used to fall
 * through a `default: return null` because it reused `destroy`, and the day it
 * stopped reusing `destroy` the burst it drew silently stopped existing.
 * Nothing failed: the type checker was satisfied by a branch that also covered
 * every event nobody had thought about yet. The fix is the same one
 * `content/briefings.ts` already leans on for `BriefingId` — a form that
 * cannot compile while something is unaccounted for. A `switch` cannot be a
 * `Record`, so here it is a `default` that only compiles if `e` has narrowed to
 * `never`, meaning every other case matched: add a case to `SimEvent`, account
 * for it in neither file, and `assertNever` stops type-checking instead of
 * quietly drawing nothing.
 *
 * **The events that are silent live next door**, with the paragraph each one
 * needs to say what draws it instead. They were here, and adding one `case`
 * and one clause of comment for THE CHUTE's cut put this file over its
 * 250-line limit — landable only by rewording two comments belonging to other
 * creatures until five lines came back. `isSilent` is a type guard, so moving
 * them out cost the exhaustiveness nothing.
 */
export interface Burst {
  x: number;
  y: number;
  /** How many particles. Scale with what it cost, not with what it was. */
  n: number;
  hex: string;
}

export function burstFor(e: SimEvent, l: Layout): Burst | null {
  // The long tail first, and it is a *guard*: an event drawn some other way is
  // taken out of the union before the switch sees it, so what is left below is
  // the bursting half alone and `assertNever` still catches an event that is
  // in neither file (`effects-spark-silent.ts`).
  if (isSilent(e)) return null;
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
    // THE GYRE's armature failing, a beat after the last body came off it.
    // The rock's colour and not a body's: nothing living broke here — the six
    // were already gone, each with its own burst — and this is a mechanism
    // letting go. Sized with the two bosses for the reason they are: it is the
    // end of the wave, and the pair has earned being shown one.
    case "gyreBroke":
      return at(l, e.col, e.row, 24, PALETTE.rock);
    case "podLoose":
      return at(l, e.col, e.row, 10, PALETTE.ember);
    case "podLost":
      return { x: tileCX(l, e.col), y: l.hullY, n: 12, hex: PALETTE.sparkDim };
    // The ignition, at the tile the body stood in. It used to be eight grey
    // particles, smaller than a kill so a shot that felt satisfying to fire
    // read as smaller than it felt; a lure now goes up and takes the hull with
    // it in three places (`resolveLure`), so it is the other way round on both
    // counts. The rest of it is `lure-blast.ts`, over the whole stage.
    case "lureHit":
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

    // A layer off THE RIND: the body's own colour, because the shot landed and
    // the pair should feel that it did — and half the particles of a `destroy`,
    // because the thing is still coming and the burst must not read as the end
    // of it. The size it steps down to is not drawn here at all: that is read
    // fresh every frame off `rindLayers` (`livingBodyMul`), which is the one
    // thing that cannot go stale across a restart.
    case "rindShed":
      return at(l, e.col, e.row, 10, e.color === "red" ? PALETTE.red : PALETTE.cyan);

    // A recoil bouncing, and the one hit in this table whose burst is **not**
    // a body's colour. Nothing living broke — the cage held and vented — so
    // the particles are the fire's, which is also what the jet under them is
    // drawn in (`recoil-vent.ts`). A red or cyan burst here would be the one
    // misleading thing this file could draw: the colour on the event is the
    // one the body has *become*, and a shower of it at the moment of the hit
    // would read as the shot having matched what is standing there now.
    // Thrown at the tile it was struck in and not the one it landed in, for
    // the jet's reason: that is where the pair were looking.
    case "recoilBounce":
      return at(l, e.col, e.row, 10, PALETTE.ember);

    // A carom's crust coming apart, in the **rock's** colour and not the
    // body's — `recoilBounce`'s argument arrived at from the other side. There
    // the body survived and the picture must not say a kill; here the body is
    // gone and the picture must not say the *column* is. A red or cyan shower
    // is what this game spends on a lane closing, and the lane has not closed:
    // a rock is standing in it and somebody has to ward it. So the particles
    // are the shell's, and there are as many of them as a `shellBare` gets,
    // because it is the same moment — a covering coming off, at the size of
    // the thing it came off (`e.span`).
    case "caromCrack":
      return at(l, e.col, e.row, 20, PALETTE.rock);

    // A plate off THE VOLLEY, in the **shield's** colour rather than the
    // shell's — `caromCrack`'s argument arrived at from the third side. There
    // the shell came off and what mattered was that the lane had not closed;
    // here the shell has come off *and* the lane has not closed, and the one
    // thing worth saying is which control just did the work. So the sparks are
    // the dome's, thrown where the body met it, and the shell's own material
    // is spent on the burst below.
    case "volleyReturn":
      return at(l, e.col, e.row, 14, PALETTE.shieldRim);

    // And the shell itself, coming apart in mid-air. The rock's colour and a
    // `caromCrack`'s worth of it, because it is the same moment at the same
    // size — a covering leaving a body that goes on falling. The ordinary
    // colours are deliberately not spent here: nothing died, and a red or cyan
    // shower is what this game pays for a lane closing.
    case "volleyHatch":
      return at(l, e.col, e.row, 20, PALETTE.rock);

    // A wrong colour into a cloud. Grey, and fewer particles than a `reject`,
    // because the shot did not bounce off anything — it went in and the
    // weather shut over it (`impact.absorb` is the ear's half of the same
    // sentence). The red cloud that follows is not a burst at all: it is
    // world state for two seconds, read fresh every frame off
    // `veilStruckTick` in `veil.ts`.
    case "veilRebuff":
      return at(l, e.col, e.row, 4, PALETTE.sparkDim);

    // THE FLEET's three answers, and their sizes are the whole of what the
    // navigator learns about a square they cannot see. A chart square is a
    // field tile — same width, same origin (`fleet-chart.ts`) — so `at` puts
    // the burst exactly where the mark is drawn.
    case "fleetSplash":
      return at(l, e.col, e.row, 6, PALETTE.shield);
    case "fleetHit":
      return at(l, e.col, e.row, 14, PALETTE.red);
    // A hull going under. The biggest burst on the chart, because it is the
    // one moment both seats are looking at the same thing.
    case "fleetSunk":
      return at(l, e.col, e.row, 26, PALETTE.ember);

    default:
      return assertNever(e);
  }
}

function at(l: Layout, col: number, row: number, n: number, hex: string): Burst {
  return { x: tileCX(l, col), y: tileCY(l, row), n, hex };
}
