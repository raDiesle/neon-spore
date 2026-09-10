import {
  type Creature,
  coilChargeAge,
  coilHeading,
  coilWardReaches,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { CLASP_RADIUS_MUL, drawClaspShield } from "./clasp.js";
import { COIL_LOOK } from "./coil-look.js";
import { hazed } from "./depth.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE COIL's dome: the shell a rock crosses the field inside, and the three
 * studs the charge leaves it by.
 *
 * **The dome is THE CLASP's, called rather than copied**, and that is the
 * owner's own instruction — *"it has a shield around like clasp"*. So
 * `drawClaspShield` draws it, hand-painted frames and procedural floor alike,
 * and this file adds only what is true of a coil and not of a clasp. Two
 * membranes drawn by two files would be two answers to one picture, and the
 * day the frames are re-baked one of them would not know.
 *
 * What tells the two apart is not the shell. It is what is inside — a clasp
 * holds a slick or a bulb and a coil holds a *rock*, which `drawMeteor` has
 * already put down (`creature-body.ts`) — and it is that the thing is crossing
 * the field sideways rather than falling. A pair says "clasp" or "coil" off the
 * body and the path, never off the bubble, which is exactly the rule the
 * bestiary keeps about colours and silhouettes.
 *
 * **The studs are new, and they are the chain made visible.** Three of them on
 * the rim, and they are where a bolt leaves and where one lands
 * (`coil-jump.ts`) — a dome that discharged from nowhere in particular would
 * make the chain read as a coincidence between two bodies rather than as one
 * thing passing between them. They and the bolt are the coil's own picture,
 * and both go through `COIL_LOOK` (`coil-look.ts`) so a candidate can offer
 * another; the dome and the rock are other creatures' and do not.
 *
 * **And the charge is drawn on player 1's screen only.** That is the whole
 * split: the navigator holds the only plate and is shown a dome that looks
 * exactly as it did a beat ago, so which one opens next is a thing they can
 * only be *told*. `showsCoilCharge` is the one gate, and it is the sentence
 * `showsGhostBody` and `showsVeilCore` already make, aimed at this seat.
 */

/**
 * Whether this screen shows the charge sitting in a dome at all — player 1's,
 * the same half as the cannon and the trigger, and deliberately *not* the seat
 * that can move the plate.
 *
 * The mirror image of `showsShield`, and the same sentence `showsGhostBody`
 * makes for the other seat: `test` sees everything because it is both halves
 * at once on one screen and a rig that hid one of them could not be played.
 */
export function showsCoilCharge(l: Layout): boolean {
  return l.role !== "p2";
}

/**
 * How far the charge has come towards this dome, 0 at rest and 1 on the frame
 * it opens. Zero for a coil no chain has reached, which is right: nothing is
 * on its way, so nothing is drawn.
 *
 * Derived from `coilLit` and the beat rather than stored, for `ghostRage`'s
 * reason: the bolt in flight, the dome brightening and the beat the thing
 * actually comes open are three readings of one number, and a second copy of
 * the length would let the picture finish before the rule did.
 */
export function coilCharge(cfg: SimConfig, world: World, c: Creature, beatPhase: number): number {
  const age = coilChargeAge(world, c);
  if (age < 0) return 0;
  return Math.min(1, (age + beatPhase) / Math.max(1, cfg.coilJumpBeats));
}

/**
 * The dome, over a rock that is already drawn. `charge` is `coilCharge` on the
 * screen that gets it and zero on the one that does not.
 *
 * `lit` is the louder of two things: the ship's own plate answering this dome,
 * which **both** screens show — it is a fact about where the plate is, and the
 * navigator is the one who put it there — and the charge, which only the
 * pilot's screen ever passes in. So the two seats see the same dome answer the
 * same plate, and only one of them sees it about to fail.
 *
 * **`coilWardReaches` and not `claspResonance`**, which is the whole of the
 * difference between the two bubbles: a clasp is answered by the column alone,
 * and a dome is answered by the column *and* a clear lane below it. A rock
 * crossing under the coil takes the reach, and a dome that lit anyway would be
 * the picture promising an opening the rule is not going to give — the pair
 * would hold a lane on the strength of it and watch nothing happen. It is the
 * simulation's own rule called rather than a second copy drawn from the
 * shield's column (`copies-table.ts` holds the row).
 */
export function drawCoilDome(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  x: number,
  y: number,
  time: number,
  near: number,
  charge: number,
  image: CanvasImageSource | null,
): void {
  const lit = Math.max(coilWardReaches(world, c) ? 1 : 0, charge);
  drawClaspShield(ctx, l, world.cfg, x, y, time, near, lit, image);
  drawStuds(ctx, l, world, c, x, y, time, near, charge);
}

/**
 * The three studs on the rim, turning slowly with the body's own id so that no
 * two domes on the field are standing at the same angle. What they are drawn
 * *as* is `COIL_LOOK.studs`'s (`coil-look.ts`); this gathers what the field
 * knows about the dome and hands it over.
 */
function drawStuds(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  x: number,
  y: number,
  time: number,
  near: number,
  charge: number,
): void {
  const cfg = world.cfg;
  // Slow, and turning the other way for odd ids: a field of domes all spinning
  // together reads as one object rotating rather than as several bodies.
  const spin = time * 0.35 * (c.id % 2 === 0 ? 1 : -1) + c.id;
  COIL_LOOK.studs({
    ctx,
    x,
    y,
    r: l.tile * CLASP_RADIUS_MUL,
    tile: l.tile,
    spin,
    time,
    charge,
    dir: coilHeading(c),
    rim: hazed(cfg, PALETTE.claspShieldRim, near),
    hot: hazed(cfg, PALETTE.shieldRim, near),
    lit: coilWardReaches(world, c),
  });
}
