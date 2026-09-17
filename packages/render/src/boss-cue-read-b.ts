import {
  type BatonState,
  batonLaunchable,
  batonLocked,
  type TasterState,
  tasterPhase,
  tasterStanding,
  type UndertowState,
  undertowUnseated,
  type World,
} from "@neon-spore/sim";
import { beadPoint } from "./baton-bead-draw.js";
import type { BossCue } from "./boss-cue.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { tasterCrestY } from "./taster-draw.js";

/**
 * **What THE TASTER, THE UNDERTOW and THE BATON are asking for** — page two
 * of the readings, on the seam `boss-draw-clocks-b.ts` draws for the same
 * reason: this is the half of the list that grows, and the file next door was
 * written to be read in one sitting.
 *
 * Every rule is `boss-cue.ts`'s. The one that does the most work in this
 * file is *a cue is drawn on the seat that can act*: all three of these
 * fights alternate between the two seats beat by beat, so a cue on the wrong
 * phone is not merely noise — it is the fight telling the pilot to do the
 * navigator's job on the one beat she is waiting to be told to do it.
 */

/** THE CHOIR's frame, in tiles: the size of this mark wherever it stands. */
const HALF_W = 0.72;
const HALF_H = 0.66;

/** How far above the plating a lobe's mark stands, in tiles: clear of the
 * hull line, and under the swell of the lobe itself (`undertow-lobe.ts`). */
const LOBE_LIFT = 0.8;

function markAt(
  seat: BossCue["seat"],
  kind: BossCue["kind"],
  word: string,
  x: number,
  y: number,
  l: Layout,
  seed: number,
  wide = 1,
): BossCue {
  return { seat, kind, word, x, y, halfW: l.tile * HALF_W * wide, halfH: l.tile * HALF_H, seed };
}

/**
 * THE TASTER. One word while the fan stands and another once it has closed,
 * and both are the navigator's: she chooses the colour, fires it and holds it
 * to fill the lance, which are the only three things this boss answers.
 *
 * **The mark is on the fan and never on a blade.** Which blade is not the
 * question — any standing one falls to the colour it did not grow toward —
 * and a frame around one of them would be the field answering *which*, which
 * is the pair's own sentence (`decisions.md` #34). The colour is never said
 * here at all: `taster-read.ts` gives each seat its half of that, and the
 * word is the verb alone.
 */
export function tasterCues(l: Layout, world: World, t: TasterState): readonly BossCue[] {
  const phase = tasterPhase(t, world.cfg);
  if (phase === "out") return [];
  const x = tileCX(l, t.col + (t.blades.length - 1) / 2);
  const y = tasterCrestY(l);
  if (phase === "closed") return [markAt(2, "HOLD", "BURN", x, y, l, 41, 2)];
  if (tasterStanding(t) === 0) return [];
  return [markAt(2, "PRESS", "SHEAR", x, y, l, 42, 2)];
}

/**
 * THE UNDERTOW. Three things are wanted of this fight and each belongs to one
 * seat: the maw under an ordinary lobe, the beam under a tall one, and the
 * cannon off the plate that has come up under it.
 *
 * `MOVE` is first because it is the one with a hull behind it — the seat is
 * bowing and everything else can wait a beat. It stands on the cannon, which
 * is the pilot's own picture, and says nothing about which way to go.
 *
 * The two lobe words stand on the lobes, which **both** screens are drawn
 * (`undertow-lobe.ts` takes `tall` on either), so neither cue hands a seat
 * the half of the picture the other was given — what is split here is the
 * bow that warns of the push, and no cue is drawn on it (`showsUndertowBow`).
 */
export function undertowCues(
  l: Layout,
  world: World,
  u: UndertowState,
  skinY: SurfaceY,
): readonly BossCue[] {
  if (u.phase === "taken") return [];
  const out: BossCue[] = [];
  if (undertowUnseated(u, world.beat)) {
    out.push(markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 43));
  }
  // The shield standing on a lobe's own column keeps the maw off it
  // (`undertow-press.ts`), and nothing in the picture says so — the pilot
  // holds the maw open over a lobe that will not come in and neither of them
  // learns why. It is her thumb that moves the shield, so it is her word.
  for (const b of u.breaches) {
    if (b.stage === "standing" && !b.tall && world.shieldCol === b.col) {
      out.push(markAt(2, "CARRY", "MOVE", tileCX(l, world.shieldCol), l.hullY, l, 49));
      break;
    }
  }
  for (const b of u.breaches) {
    if (b.stage !== "standing") continue;
    const x = tileCX(l, b.col);
    const y = skinY(x) - l.tile * LOBE_LIFT;
    // A tall lobe is the beam's and the maw would break on it; every other one
    // is the maw's, held open under it (`undertow-press.ts`).
    out.push(
      b.tall
        ? markAt(2, "HOLD", "BURN", x, y, l, 44 + b.col)
        : markAt(1, "HOLD", "OPEN", x, y, l, 44 + b.col),
    );
  }
  return out;
}

/**
 * THE BATON. The fight is a bead passed down an arm by two thumbs taking
 * turns, and the cue is the turn itself: `LAUNCH` on the bead that is sitting
 * and `FIRE` on the one in the air.
 *
 * `FIRE` comes first because a flight is a window and a sitting bead is not:
 * the bead lands whether or not anybody shot it, and the navigator's beat is
 * the shorter of the two.
 *
 * Neither word says a colour, and that is the whole of this encounter — the
 * bead wears the colour it is taken by and the pilot is the seat that can see
 * which (`baton-bead-draw.ts`). A cue reading `FIRE RED` would be the game
 * saying the sentence the pair is supposed to say.
 *
 * A seat locked out of this beat is given nothing (`batonLocked`): an
 * instruction on a phone whose thumb the simulation will refuse is worse than
 * no instruction at all.
 */
export function batonCues(l: Layout, world: World, b: BatonState): readonly BossCue[] {
  if (b.stage === "down" || b.stage === "unfolding") return [];
  const cfg = world.cfg;
  const out: BossCue[] = [];
  for (const bead of b.beads) {
    if (!bead.flying || bead.struck) continue;
    if (batonLocked(b, 2, world.beat)) break;
    const { x, y } = beadPoint(l, cfg, b, bead, world.tick);
    out.push(markAt(2, "PRESS", "FIRE", x, y, l, 45 + bead.socket));
    break;
  }
  const sitting = batonLaunchable(cfg, b);
  if (sitting !== null && !batonLocked(b, 1, world.beat)) {
    const { x, y } = beadPoint(l, cfg, b, sitting, world.tick);
    out.push(markAt(1, "PRESS", "LAUNCH", x, y, l, 48 + sitting.socket));
  }
  return out;
}
