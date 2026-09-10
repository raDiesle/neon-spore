import { drawBolt } from "./bolt.js";
import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";

/**
 * THE ONE RECORD A CANDIDATE **COIL** LOOK PATCHES.
 *
 * `carom-look.ts`'s kind and its reasons: a record rather than two named
 * functions, so a candidate look is a field patched onto a live export for
 * the length of one `draw()` and the call site never learns anything about it
 * (`docs/versus.md`). A file of its own because the record needs the paint and
 * a candidate needs the record.
 *
 * **What is in it, and what is deliberately not.** THE COIL is a rock inside a
 * dome, and neither of those is this creature's own: the rock is
 * `drawMeteorBody`'s and the dome is THE CLASP's, called rather than copied on
 * the owner's instruction (`coil.ts`). What a coil draws that nothing else
 * does is the **chain** — three studs on the rim that are where a charge
 * leaves a dome and where one lands, and the bolt that crosses the field
 * between two of them. So the question a pair is asked here is *does the
 * charge read as one thing passing from dome to dome, and do the marks it
 * leaves by read as places on a shell rather than dots beside it* — and that
 * is two fields, `studs` and `charge`, each drawn on its own frame.
 *
 * **The shipped pair came through here with not one pixel moved.** `studs`
 * is the loop `coil.ts` carried as `drawStuds`, and `bolt` is the body of
 * `CoilJumpFx.draw`, each with the arguments gathered into a record and
 * nothing else touched.
 */

/** How many studs sit on the rim. Three: enough that one is always facing
 * whichever way the charge came from, few enough to read at 26 px. */
export const STUDS = 3;

/** How far a stud sits out past the dome's own rim, as a share of it. */
export const STUD_OUT = 1.04;

/**
 * Everything the studs are drawn from, in field pixels — the dome is drawn
 * about `(x, y)` and the studs sit on its rim, so unlike a crust these are
 * places on the field rather than lengths about an origin.
 */
export interface StudDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly x: number;
  readonly y: number;
  /** The dome's rim radius, before `STUD_OUT` pushes a stud past it. */
  readonly r: number;
  readonly tile: number;
  /** How far round the studs have turned: slow, the body's own way, and
   * offset by its id so no two domes stand at the same angle. */
  readonly spin: number;
  /** Seconds on the wall clock, for a look with a gutter of its own. */
  readonly time: number;
  /** How far the charge has come towards this dome, 0 at rest and 1 on the
   * frame it opens (`coilCharge`). Zero on the seat that is not shown it. */
  readonly charge: number;
  /** Which way the body is crossing — +1 right, −1 left (`coilHeading`).
   * Not read by the shipped studs. */
  readonly dir: number;
  /** The dome's own rim colour and the hot one a charge turns it, hazed. */
  readonly rim: string;
  readonly hot: string;
  /** Whether this dome is lit by the ship's own plate this frame. Not read by
   * the shipped studs. */
  readonly lit: boolean;
}

/**
 * Everything a charge in flight is drawn from. `from` is frozen — the tile the
 * charge left, a falling rock by now — and `to` is looked up every frame off
 * the dome it is reaching for (`coil-jump.ts` on why the two ends differ).
 */
export interface ChargeDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly from: { readonly x: number; readonly y: number };
  readonly to: { readonly x: number; readonly y: number };
  /** How far along the flight it is, 0 at the failed dome and 1 arriving. */
  readonly t: number;
  /** Seconds since it left. */
  readonly age: number;
  readonly tile: number;
  /** The dome it is going to, for a seed no other charge shares. */
  readonly id: number;
}

/**
 * The three studs as they ship: discs on the rim, brightening with the charge
 * rather than blinking on at some threshold — the pilot has three beats of a
 * bolt crossing the field and the thing they are being asked to say is
 * *which* dome, so the answer has to be readable from the first frame and
 * unmistakable by the last.
 */
export function studs(d: StudDraw): void {
  const { ctx, x, y, tile, spin, charge, rim, hot } = d;
  const r = d.r * STUD_OUT;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let k = 0; k < STUDS; k++) {
    const a = spin + (k * Math.PI * 2) / STUDS;
    const sx = x + Math.cos(a) * r;
    const sy = y + Math.sin(a) * r;
    const size = tile * (0.06 + 0.05 * charge);
    ctx.globalAlpha = 0.55 + 0.45 * charge;
    ctx.fillStyle = charge > 0 ? hot : rim;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();
    if (charge > 0) halo(ctx, sx, sy, size * 3.2, hot, 0.4 * charge);
  }
  ctx.restore();
}

/** Bolts per charge. Two rather than the strike's three: this one is on screen
 * for three beats instead of a quarter of a second, and three overlapping
 * crackling lines that long read as a rope rather than as a discharge. */
const BOLTS = 2;

/**
 * The charge as it ships: two crackling bolts from the failed dome's tile,
 * reaching only as far as the charge has come — so the pilot is watching
 * something *arrive* rather than a line joining two bodies — with a head that
 * brightens as it closes. The head is the thing the pilot is actually
 * reading: not the line, but which dome it is nearly at.
 */
export function bolt(d: ChargeDraw): void {
  const { ctx, from, to, t, age, tile, id } = d;
  const x1 = from.x + (to.x - from.x) * t;
  const y1 = from.y + (to.y - from.y) * t;
  for (let k = 0; k < BOLTS; k++) {
    // Redrawn from a different seed a few times a second, so the charge
    // crackles along its path instead of holding one shape.
    const seed = k * 211 + Math.floor(age * 60) * 23 + id;
    drawBolt(ctx, from.x, from.y, x1, y1, tile, seed, k === 0 ? 0.9 : 0.55, 1.4);
  }
  halo(ctx, x1, y1, tile * (0.5 + 0.9 * t), PALETTE.shieldRim, 0.3 + 0.45 * t);
}

export interface CoilLook {
  /** The marks on the rim a charge leaves by and lands on, drawn over the
   * dome. */
  studs(d: StudDraw): void;
  /** The charge crossing the field from a failed dome to the next one. */
  charge(d: ChargeDraw): void;
}

/** The shipped chain: three discs on the rim, and two bolts with a bright
 * head between them. */
export const COIL_LOOK: CoilLook = { studs, charge: bolt };
