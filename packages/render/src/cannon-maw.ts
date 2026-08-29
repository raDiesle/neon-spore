import { openSmoothPath, type Point } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { type MouthFrame, muzzleCenterY } from "./muzzle.js";
import { PALETTE } from "./palette.js";

/**
 * Laying the shot: `maw.ts` run backwards.
 *
 * Swallowing a pod is three movements — the inhale, the skin coming apart, the
 * flash. Laying is the last two of those with the direction reversed, and that
 * is deliberate rather than convenient: the ship has exactly one opening, and a
 * second visual vocabulary for it would teach the pair that the same hole means
 * two unrelated things. So the muzzle dilates, the membrane beside it parts
 * with the gaps travelling *outward* instead of inward, and something bright
 * grows behind the opening until it goes. A hen laying an egg, only alien.
 *
 * **It is a tell, and it belongs to the other player.** Player 1 has no fire
 * buttons; until now a press by player 2 reached him only as a bolt already
 * halfway up the field. This is the cannon visibly working before the shot
 * exists, in the one place he is already watching.
 *
 * **It says the moment and not the colour.** The colour is player 2's half of
 * the split (docs/spec/systems.md 5.1), and a wind-up that leaked it would
 * hand player 1 the one thing he is supposed to have to be told. So everything
 * here is drawn in the hull's own light: what it carries is *when*, which both
 * of them need, and nothing else.
 *
 * The picture used to be a function of `chargeMilli` alone — the world's, to
 * the tick, on both devices — and so nothing here outlived a frame. `LayEcho`
 * is the exception and says why it had to be one: the world stops speaking on
 * the tick the shot goes, so the half of the act that comes *after* the
 * departure has no clock but the renderer's. It lives in `Effects` and is
 * cleared in `Effects.reset()`, like everything else that outlives a frame.
 */

/** How far either side of the muzzle the skin parts, in tiles. A fifth of the
 * chew's reach: this is one bolt leaving, not a whole pod going through. */
const PART_TILES = 0.5;
/** Pieces the parted stretch is drawn in. Fewer reads as a dashed border. */
const PART_STEPS = 10;

/**
 * Where the shot is in the act of leaving — the whole clock this file draws
 * on, and the one thing a candidate mouth needs that the world does not hand
 * anybody today.
 *
 * **`phase` runs 0 → 2, not 0 → 1, and the second half is new.** Up to 1 it
 * is exactly `chargeMilli / 1000`: the world's own countdown, to the tick, on
 * both devices, 1 on the tick the shot goes. Past 1 it is the *follow-through*
 * — `Effects.layEcho`, easing 1 → 2 over six tenths of a beat after the shot
 * has gone, then dropping to 0.
 *
 * That half exists because nothing in the draw path could see it. `chargeMilli`
 * snaps 1000 → 0 the tick the shot leaves, so a mouth had no way to know a shot
 * had *just* gone and could not relax after one; every opening in the game was
 * therefore a thing that tightened and then cut. Anything wanting a
 * follow-through — a mouth closing, a recoil, a body settling — needs this and
 * had to invent it. `Effects` owns it, because it outlives a frame.
 *
 * The shipped look ignores everything above 1, which is why the second half
 * could be added without moving a pixel.
 */
export interface LayState {
  phase: number;
  /** The renderer's clock, for anything that shivers rather than eases. */
  time: number;
}

/**
 * The far half of the phase, as the only thing in this file that outlives a
 * frame — so it lives in `Effects` and is cleared by `Effects.reset()`, which
 * is not bookkeeping: a restart builds a fresh `World` and a mouth still
 * relaxing from the abandoned run would be relaxing on the new one's first
 * frame, from a shot nobody fired.
 *
 * A class rather than two fields on `Effects` for the reason `SwallowFx` is
 * one: it is a clock with a life as well as a countdown, and the arithmetic
 * that turns those two into a phase belongs beside the phase's definition.
 */
export class LayEcho {
  private left = 0;
  private life = 0;

  /** 1 the moment the shot goes, easing to 2, then 0. See `LayState`. */
  get phase(): number {
    if (this.left <= 0 || this.life <= 0) return 0;
    return 2 - this.left / this.life;
  }

  /**
   * A shot has left. The relaxation is longer than the half-beat wind-up in
   * front of it on purpose — a release quicker than the strain reads as a
   * flash, and one that outlasts it reads as effort — and it is measured in
   * beats because everything else the ship does is.
   */
  start(beatSeconds: number): void {
    this.life = beatSeconds * 0.6;
    this.left = this.life;
  }

  update(dt: number): void {
    this.left = Math.max(0, this.left - dt);
  }

  clear(): void {
    this.left = 0;
    this.life = 0;
  }
}

/** The moving half of the opening: what the shot does to it on its way out. */
export interface LayLook {
  draw(ctx: CanvasRenderingContext2D, m: MouthFrame, s: LayState): void;
}

/** The wind-up the ship has always had: a gathering bolt, a parting seam, a
 * tightening rim — and nothing at all once the shot is gone. */
export const LAY_LOOK: LayLook = {
  draw(ctx, m, s) {
    // Everything past the departure is somebody else's idea. This mouth stops
    // at the moment the shot leaves, exactly as it did when `phase` could not
    // go above 1 at all.
    const lay = s.phase > 1 ? 0 : s.phase;
    if (lay <= 0.02) return;
    const { l } = m;

    // Behind the opening first, so the parting skin and the rim draw over it: a
    // bolt gathering *inside* the ship, not a light stuck on the outside of it.
    halo(ctx, m.x, m.y, l.tile * (0.12 + 0.3 * lay), PALETTE.hullRim, 0.2 + 0.6 * lay);

    partSkin(ctx, l, lay, s.time, m.x, m.surface);

    // The opening itself, dilating. `drawMuzzle` has already filled it dark and
    // run the ship's own edge round it; this is that edge tightening and
    // brightening as the moment arrives, and it is the part that reads at arm's
    // length on a phone.
    ctx.save();
    ctx.beginPath();
    ctx.arc(m.x, m.y, l.tile * (0.15 + 0.16 * lay), 0, Math.PI * 2);
    ctx.strokeStyle = PALETTE.hullRim;
    ctx.lineWidth = 1.2 + 1.6 * lay;
    ctx.globalAlpha = 0.3 + 0.7 * lay;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  },
};

/**
 * @param lay the laying phase, 0 → 2. See `LayState`.
 */
export function drawLay(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  lay: number,
  time: number,
  cannonX: number,
  tipY: number,
  /** How far the maw is already open for a swallow — the mouth moves with it. */
  intake: number,
  surface: (x: number) => Point,
): void {
  const m: MouthFrame = {
    x: cannonX,
    y: muzzleCenterY(l, tipY, intake),
    tipY,
    l,
    intake,
    surface,
  };
  LAY_LOOK.draw(ctx, m, { phase: lay, time });
}

/**
 * The membrane on either side of the muzzle coming apart — `drawChew`'s
 * technique with two things changed. The gaps travel away from the mouth
 * rather than towards it (the sign on `i` in the phase), because something is
 * being pushed out and not drawn in; and it is the hull's own light rather
 * than the pod's amber, because nothing foreign is passing through.
 */
function partSkin(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  lay: number,
  time: number,
  cannonX: number,
  surface: (x: number) => Point,
): void {
  const half = l.tile * PART_TILES;
  const from = cannonX - half;
  const to = cannonX + half;

  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < PART_STEPS; i++) {
    if (Math.sin(time * 11 - i * 1.7) < -0.2) continue;
    const a = from + ((to - from) * i) / PART_STEPS;
    const b = from + ((to - from) * (i + 0.7)) / PART_STEPS;
    const pts: Point[] = [surface(a), surface((a + b) / 2), surface(b)];
    // Nearest the mouth is brightest, and the whole thing brightens as the
    // shot comes due — the seam opens rather than simply being open.
    const near = Math.max(0, 1 - Math.abs((a + b) / 2 - cannonX) / half);
    const heat = near * lay;
    ctx.globalAlpha = 0.2 + 0.8 * heat;
    strokeGlow(ctx, new Path2D(openSmoothPath(pts)), PALETTE.hullRim, 1.2 + 2.6 * heat, 0.8);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
