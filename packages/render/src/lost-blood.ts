import { smoothstep } from "./ease.js";
import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import type { LostPaint } from "./lost-look.js";
import { PALETTE } from "./palette.js";

/**
 * What runs down the lost screen: the ship's own fluid, from the top edge to
 * the foot, the whole width of the phone.
 *
 * The owner asked for it by name on 16 September 2026 — *some cool effect like
 * alien blood is flowing from top to bottom screen all across the full width*
 * — which is the first of the three look exemptions, and why it is on the
 * field rather than in a slot.
 *
 * **Whose blood it is.** The hull's violet, not the bodies' red and not green.
 * Green is the one thing in this game that goes right and nothing else is ever
 * allowed to be it (`palette.ts`); red is what the bodies are and what WAVE
 * LOST is already written in, so a red running down behind red type is a
 * screen with one colour on it. Violet is the ship, the ship is what was
 * broken, and a screen about losing should be bleeding the thing that lost.
 * If the owner wants the enemy's red instead it is `HUE` and nothing else.
 *
 * **It is a function of `age` and nothing else.** No state, no `Effects` entry,
 * nothing that outlives a frame (`restart.test.ts`'s rule) — every rivulet's
 * place is computed from its index and the clock each time, so the screen can
 * be drawn twice on one tick and look the same both times.
 */

/** How many rivulets run at once. */
const RUNS = 13;
/** Seconds one rivulet takes to cross the screen, before its own variation. */
const FALL = 3.4;
/** The widest a rivulet gets, in pixels, at its head. */
const WIDE = 12;
/** How far a rivulet wanders sideways on the way down, in pixels. */
const WANDER = 9;
/**
 * The head's glow, at one radius for all thirteen rather than at each one's
 * own thickness.
 *
 * `halo` bakes a sprite per colour and radius and keeps it
 * (`glow.ts`), so a radius computed from a rivulet's own width is thirteen
 * sprites held for the length of the session for a screen the pair sees on a
 * loss. `baked-growth.test.ts` counts exactly this and said so.
 */
const HALO = WIDE * 2;
const HUE = PALETTE.hull;
const RIM = PALETTE.hullRim;

/**
 * One rivulet's state at `age`, from its index alone.
 *
 * Each has its own period, so the fifteen never fall into step: a screen where
 * every trail restarts on the same second is rain on a window and not a body
 * losing what is in it.
 */
function run(i: number, age: number, w: number, h: number) {
  const period = FALL * (0.7 + sinHash(i, 1) * 1.1);
  const phase = ((age + sinHash(i, 2) * period) % period) / period;
  const x = w * ((i + 0.5) / RUNS) + sinHash(i, 3) * (w / RUNS) * 0.4;
  // Eased at the start: a drop gathers before it goes, and a linear one reads
  // as a scanline.
  const head = h * smoothstep(phase);
  return { x, head, thick: WIDE * (0.35 + sinHash(i, 4) * 0.65), phase };
}

/** A rivulet's own sideways wander at a height down it. */
function wander(i: number, t: number): number {
  return Math.sin(t * 5.1 + i * 2.3) * WANDER * t;
}

/**
 * The blood, over whatever was drawn before it.
 *
 * **It thins below the hull's line.** The one rule this screen has is that the
 * pair must still be able to see where the ship was broken (`lost-look.ts`),
 * so a full-width curtain that ran at one strength all the way down would take
 * the lesson away to make a mood. Below `hullY` every rivulet is a third of
 * itself.
 */
export function bleed(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  const { width: w, height: h } = p.l;
  for (let i = 0; i < RUNS; i++) {
    const r = run(i, p.age, w, h);
    if (r.head <= 2) continue;
    const fade = 1 - Math.max(0, (r.phase - 0.75) / 0.25) * 0.85;

    // The trail: a tapering ribbon from the top edge down to the head, drawn
    // as two walked sides rather than as a line, so it can be thin where it
    // started and full where it is going.
    ctx.beginPath();
    const steps = 9;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const y = r.head * t;
      const half = (r.thick * t * t) / 2;
      ctx.lineTo(r.x + wander(i, t) - half, y);
    }
    for (let s = steps; s >= 0; s--) {
      const t = s / steps;
      const y = r.head * t;
      const half = (r.thick * t * t) / 2;
      ctx.lineTo(r.x + wander(i, t) + half, y);
    }
    ctx.closePath();
    ctx.fillStyle = rgba(HUE, 0.42 * fade);
    ctx.fill();

    // The head: the bead that is actually falling, and the only part of a
    // rivulet with a lit edge on it.
    const hx = r.x + wander(i, 1);
    const below = r.head > p.hullY ? 0.34 : 1;
    ctx.fillStyle = rgba(HUE, 0.6 * fade * below);
    ctx.beginPath();
    ctx.ellipse(hx, r.head, r.thick * 0.72, r.thick * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(RIM, 0.5 * fade * below);
    ctx.lineWidth = 1;
    ctx.stroke();
    halo(ctx, hx, r.head, HALO, HUE, 0.22 * fade * below);
  }
}
