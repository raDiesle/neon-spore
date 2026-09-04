import type { Point } from "@neon-spore/content";
import { eggContour, REST_RX, REST_RY } from "./egg-contour.js";
import { eggBeats } from "./egg-curve.js";
import { drawEggFlareHalo, drawEggSkin, type EggFlare, NO_FLARE } from "./egg-skin.js";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import type { Layout } from "./layout.js";
import { type MouthFrame, muzzleCenterY } from "./muzzle.js";
import { PALETTE } from "./palette.js";

/**
 * Laying the shot: `maw.ts` run backwards.
 *
 * Swallowing a pod is three movements — the inhale, the skin coming apart, the
 * flash. Laying is the body doing the middle one in reverse — a cloaca that
 * swells towards the ship, presses the shot out through a vent at its crown
 * and then goes slack — rather than a second visual vocabulary for the one
 * opening the ship has. A hen laying an egg, only alien; `egg-curve.ts` is
 * the timing, `egg-contour.ts` the shape it strains into, `egg-skin.ts` what
 * it is made of, and `LAY_LOOK.draw` below is only where the three meet a
 * canvas.
 *
 * **It is a tell, and it belongs to the other player.** Player 1 has no fire
 * buttons; until now a press by player 2 reached him only as a bolt already
 * halfway up the field. This is the cannon visibly working before the shot
 * exists, in the one place he is already watching — and, now, working for
 * long enough to actually watch: the strain, the crowning, the slack
 * afterwards, not a rim that merely tightens and cuts.
 *
 * **The wind-up says the moment and not the colour.** The colour is player 2's
 * half of the split (docs/spec/systems.md 5.1), and a wind-up that leaked it
 * would hand player 1 the one thing he is supposed to have to be told. So
 * everything drawn before the departure is in the hull's own light: what it
 * carries is *when*, which both of them need, and nothing else.
 *
 * **The release is the exception, and it costs nothing.** From the tick the
 * shot leaves, the body burns in the ammunition colour and fades back to its
 * own over about a second (`LayEcho.flare`). By then the bolt is on the field
 * in exactly that colour, so there is no read left to give away — and the ship
 * visibly finishing the act it started is the confirmation player 1 otherwise
 * had to take from a dot already twelve tiles up.
 *
 * The picture used to be a function of `chargeMilli` alone — the world's, to
 * the tick, on both devices — and so nothing here outlived a frame. `LayEcho`
 * is the exception and says why it had to be one: the world stops speaking on
 * the tick the shot goes, so the half of the act that comes *after* the
 * departure has no clock but the renderer's. It lives in `Effects` and is
 * cleared in `Effects.reset()`, like everything else that outlives a frame.
 */

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
 * `flare` is a second clock beside it, deliberately not the same one: the body
 * relaxes over six tenths of a beat, and the colour has to outlast that or the
 * one thing that names which ammunition just left is gone before an eye on the
 * other side of the phone has arrived at it.
 */
export interface LayState {
  phase: number;
  /** The renderer's clock, for anything that shivers rather than eases. */
  time: number;
  /** The release burn. Absent is `NO_FLARE` — a mouth that has not just fired. */
  flare?: EggFlare;
}

/** The moving half of the opening: what the shot does to it on its way out. */
export interface LayLook {
  draw(ctx: CanvasRenderingContext2D, m: MouthFrame, s: LayState): void;
}

/**
 * The body itself, laying: a cloaca that strains, presses the shot out and
 * then goes slack — `egg-curve.ts`'s three beats, drawn.
 *
 * This draws on every frame the maw is not busy swallowing a pod
 * (`m.intake > 0.4`), rest included: the egg shape is a body part, and unlike
 * the old wind-up it does not vanish once the shot has gone, it *relaxes* —
 * `eggBeats`'s `relief` beat is exactly that follow-through, easing past rest
 * into slack before settling. Nothing before the departure says which colour
 * is coming: the wind-up is drawn in the hull's own light, because that is
 * player 2's half of the split. After it, the burn is the ammunition's — see
 * the header.
 */
export const LAY_LOOK: LayLook = {
  draw(ctx, m, s) {
    // One hole, one thing at a time — the throat above takes over past this.
    if (m.intake > 0.4) return;
    const { l } = m;
    const b = eggBeats(s.phase, s.time);
    const flare = s.flare ?? NO_FLARE;
    const cy = m.y;
    // The contour's rough half width this frame, so the skin swells with the
    // body instead of sitting still inside a shape straining around it.
    const r = l.tile * REST_RX * (1 + b.bulge * 0.44);

    // Light gathering behind it, and only while something is actually being
    // pressed — the slack half of the follow-through is dark, because nothing
    // is in there any more.
    if (b.strain > 0 && b.relief === 0) {
      halo(ctx, m.x, cy, l.tile * (0.16 + 0.34 * b.strain), PALETTE.hullRim, 0.15 + 0.5 * b.strain);
    }
    drawEggFlareHalo(ctx, m.x, cy, r, flare);

    const path = eggContour(m.x, cy, l.tile, s.time, b);
    ctx.save();
    drawEggSkin(ctx, path, m.x, cy, r, s.time, b, flare);
    // The rim tightens and brightens under load and slackens after: the line
    // weight is doing as much of the reading as the shape is. It is the outer
    // half of the tube `drawEggSkin` lights from within, so it takes the same
    // hue.
    const load = Math.max(0, b.bulge);
    const rim = mixHex(PALETTE.hullRim, flare.color, 0.7 * flare.amount);
    strokeGlow(ctx, path, rim, 1.3 + 2.2 * load, 0.45 + 0.55 * Math.max(load, flare.amount));
    ctx.restore();

    // The vent, at the top of the contour, open only while something is
    // coming through it.
    if (b.vent > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, 0.35 + 0.65 * b.vent);
      ctx.fillStyle = mixHex(PALETTE.hullRim, flare.color, 0.8 * flare.amount);
      ctx.beginPath();
      ctx.ellipse(
        m.x,
        cy - l.tile * REST_RY * (1 + b.bulge * 0.3),
        l.tile * 0.13 * b.vent,
        l.tile * 0.05 * b.vent,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }

    // The shot itself, on its way through. It rides up out of the body and is
    // handed over to `drawBullets` at the tick it becomes live, so this is
    // only ever the part of its travel that is still inside the ship — and it
    // is hull-coloured, because as far as player 1 is concerned it does not
    // exist yet.
    if (b.crown > 0 && b.relief === 0) {
      const ey = cy + l.tile * 0.06 - b.crown * l.tile * 0.44;
      const er = l.tile * 0.12 * (0.45 + 0.55 * b.crown);
      halo(ctx, m.x, ey, er * 2.4, PALETTE.hullRim, 0.35 + 0.5 * b.crown);
      ctx.fillStyle = PALETTE.hullRim;
      ctx.beginPath();
      ctx.arc(m.x, ey, er, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};

/**
 * @param lay the laying phase, 0 → 2. See `LayState`.
 * @param flare the release burn, or nothing on a mouth that has not just fired.
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
  flare: EggFlare = NO_FLARE,
): void {
  const m: MouthFrame = {
    x: cannonX,
    y: muzzleCenterY(l, tipY, intake),
    tipY,
    l,
    intake,
    surface,
  };
  LAY_LOOK.draw(ctx, m, { phase: lay, time, flare });
}
