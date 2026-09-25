import { type LedgerState, ledgerPhase, type World } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlow } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawLedgerCord } from "./ledger-cord.js";
import type { LedgerFx } from "./ledger-fx.js";
import { paintPlate } from "./ledger-metal.js";
import { drawLedgerPulls } from "./ledger-pull.js";
import { drawLedgerBeads } from "./ledger-read.js";
import {
  LEDGER_HALF_W,
  ledgerBodyY,
  ledgerCordAt,
  ledgerGap,
  ledgerHalfPath,
  ledgerRootPoint,
  ledgerSeamX,
  ledgerSocketPoint,
  ledgerTaut,
} from "./ledger-shape.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsLedgerSocket } from "./view-role-clocks.js";

/**
 * **THE LEDGER**: a tall split body high in the field on a single thick cord
 * running down into the pair's own hull, with every hit they land coming back
 * down it (`sim/ledger.ts`, `docs/spec/bosses.md` §11.27).
 *
 * **Everything here is read off the world every frame.** How far the halves
 * stand apart is the seam; how straight the cord is, is the seam; where every
 * bead is, is its own landing beat and span; where the cord is rooted is the
 * socket. What outlives a frame is three moments and they are
 * `ledger-fx.ts`': the whip going back up, the shock through the plating and
 * the flash of the tear.
 *
 * **The order is the order the eye reads it**: the cord first, so the body
 * stands on the end of it rather than the cord being laid over the body; then
 * the two halves; then the seam's colour between them; then what each seat is
 * shown of the cord (`ledger-read.ts`).
 *
 * **Health is the silhouette and there is no bar**: one body, then a body with
 * a line down it, then two. The seam widens a share of the way per hit and the
 * halves are thrown apart when the cord comes out.
 *
 * **Colour says whose damage it is.** The body is metal — `rockDark` plating
 * with its seams and rivets in `rock` (`ledger-metal.ts`), the same material as
 * THE TASTER's blades — the cord and its
 * beads are the hull's violet, because what travels the cord is the ship's
 * own, and the seam carries the ammunition colour it is showing. The one white
 * mark on the field is the navigator's lock, which is interface and not body.
 */

/** How much of the way down a bead has to be before the cord starts to strain. */
const STRAIN_FROM = 0.72;

/** The cord's strain, 0..1: the soonest return taking its last stretch. */
function strainOf(t: LedgerState, beat: number, beatPhase: number): number {
  let most = 0;
  for (const b of t.beads) {
    const left = b.beat - beat - beatPhase;
    const u = Math.max(0, Math.min(1, 1 - left / Math.max(1, b.span)));
    if (u > most) most = u;
  }
  return Math.max(0, (most - STRAIN_FROM) / (1 - STRAIN_FROM));
}

/**
 * One half of the body: plating (`ledger-metal.ts`), with the seam's colour
 * lit down its cut face.
 *
 * The colour is on the **face** rather than through the body for THE TASTER's
 * reason arrived at from the other side: there a blade filled in its own
 * colour would have read as *shoot me with this* when the rule was the
 * opposite, and here the rule *is* that colour — so the one surface that
 * carries it is the one surface a bolt up the seam's column actually meets.
 */
function drawHalf(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  seamX: number,
  side: -1 | 1,
  gap: number,
  time: number,
  hex: string,
  lit: number,
  hurt: number,
): void {
  // The boss's fade going out is on the context (`drawLedger`), and
  // `strokeGlow` neither reads it nor puts it back: handed on and set again, or
  // the cut face and the whole second half were drawn whole as it went.
  const fade = ctx.globalAlpha;
  const path = ledgerHalfPath(l, seamX, side, gap, time);
  const { top, bottom } = ledgerBodyY(l);
  const x = seamX + side * gap * 0.5;
  paintPlate(ctx, path, { inner: x, side, w: l.tile * LEDGER_HALF_W, top, bottom, tile: l.tile });
  drawHurt(ctx, path, hurt * fade);
  ctx.globalAlpha = fade;
  // The cut face, in the colour the seam is showing.
  const face = new Path2D();
  face.moveTo(x, top);
  face.lineTo(x, bottom);
  strokeGlow(ctx, face, hex, STROKE.inner, 0.5 + 0.5 * lit, fade);
  ctx.globalAlpha = fade;
}

export function drawLedger(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  t: LedgerState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: LedgerFx,
): void {
  if (l.tile <= 0) return;
  const { cfg } = world;
  const phase = ledgerPhase(t, cfg, beat);
  const seamX = ledgerSeamX(l, cfg, t);
  const gap = ledgerGap(l, cfg, t, beat, beatPhase);
  const taut = ledgerTaut(cfg, t);
  const root = ledgerRootPoint(l, cfg, t);
  const socket = ledgerSocketPoint(l, t);
  const strain = strainOf(t, beat, beatPhase);
  // Out: the halves part and fade over the beats the boss stands before it
  // goes, and the cord has gone with the ship's plating (`ledgerTear`).
  const out = phase === "out";
  const fade = out
    ? Math.max(0, 1 - (beat - t.outBeat + beatPhase) / Math.max(1, cfg.ledgerOutBeats))
    : 1;
  if (fade <= 0) return;

  ctx.save();
  ctx.globalAlpha = fade;
  if (!out) {
    // The cord pays out as it roots, so the first two beats are the thing
    // arriving rather than a boss that was always there (`ledgerRootBeats`).
    const paid =
      phase === "rooting"
        ? Math.min(1, (beat - t.rootBeat + beatPhase) / Math.max(1, cfg.ledgerRootBeats))
        : 1;
    const end =
      paid >= 1 ? socket : ledgerCordAt(l, root, socket, taut, time, Math.max(0.02, paid));
    drawLedgerCord(ctx, l, root, end, taut, time, showsLedgerSocket(l.role), strain);
    drawWhip(ctx, l, root, socket, taut, time, fx.whipU);
  }

  const hex = t.want === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = t.want === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  const lit = phase === "rooting" ? 0 : 1;
  // The blow of a widened seam shakes the halves and not the cord: its foot
  // is in the ship's plating, and the plating does not shake.
  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  drawHalf(ctx, l, seamX, -1, gap, time, hex, lit, fx.hurt.value);
  drawHalf(ctx, l, seamX, 1, gap, time, hex, lit, fx.hurt.value);
  // And what is between them, once there is anything between them: the split
  // itself, lit in the colour that widens it, brighter the wider it is.
  if (gap > l.tile * 0.02 && !out) drawSeam(ctx, l, seamX, gap, rim, taut);
  ctx.restore();

  // And the pilot's read, with his two hands under it. **Hers is not here**:
  // the grommet, the lock and her one ring are drawn on the finished ship,
  // because this pass is painted over by it (`ledger-root.ts`).
  //
  // The rings go down **before** the beads: one of them rides a bead and
  // `drawHandleRing` fills opaquely, so the other order would leave him
  // holding a disc with no return in it (`ledger-pull.ts`).
  if (!out) {
    drawLedgerPulls(ctx, l, world, t, beatPhase, time);
    drawLedgerBeads(ctx, l, t, root, socket, taut, time, beat, beatPhase);
  }
  ctx.restore();
}

/** The split between the halves: the one place a bolt can reach the body. */
function drawSeam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  seamX: number,
  gap: number,
  rim: string,
  taut: number,
): void {
  const { top, bottom } = ledgerBodyY(l);
  const slot = new Path2D();
  slot.rect(seamX - gap * 0.5, top, gap, bottom - top);
  ctx.save();
  ctx.fillStyle = rgba(mixHex(PALETTE.background, rim, 0.25), 0.9);
  ctx.fill(slot);
  ctx.restore();
  const line = new Path2D();
  line.moveTo(seamX, top);
  line.lineTo(seamX, bottom);
  strokeGlow(ctx, line, rim, STROKE.inner, 0.45 + 0.4 * taut);
}

/**
 * **The whip**: a warded return going back up the cord, which is the one thing
 * on this screen that travels the other way.
 *
 * Drawn here rather than in `ledger-fx.ts` because the cord's geometry is the
 * drawer's — the transient keeps only how far up it has got, the way THE
 * SINEW's keeps only how far the mass has swung (`ledger-fx.ts`, `whipU`).
 */
function drawWhip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  root: { x: number; y: number },
  socket: { x: number; y: number },
  taut: number,
  time: number,
  u: number,
): void {
  if (u < 0) return;
  const at = ledgerCordAt(l, root, socket, taut, time, u);
  const r = l.tile * 0.2 * (1 - u * 0.4);
  const flare = new Path2D();
  flare.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.4 * u);
  ctx.fill(flare);
  ctx.restore();
  strokeGlow(ctx, flare, PALETTE.hullRim, STROKE.inner, 0.7, u);
}
