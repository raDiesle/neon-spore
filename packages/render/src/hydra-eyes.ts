import { LIGHT_HALF } from "@neon-spore/content";
import { hydraGone, hydraHeadOf, hydraPerSide } from "@neon-spore/sim";
import { smoothClosed } from "./chrysalis-shape.js";
import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import { glow } from "./hydra-head.js";
import { grown, type HeadsFrame } from "./hydra-heads.js";
import { drawNeck } from "./hydra-neck.js";
import {
  type At,
  EYE_HEAD_TILES,
  hydraEyeAt,
  hydraEyeHeadAt,
  hydraEyeSize,
  hydraRoot,
  hydraSideSign,
} from "./hydra-shape.js";
import { litRound } from "./key-light.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE HYDRA's heads of eyes** (§11.64): on each side a great bulb of a head
 * on a thick neck, its eyes set round it in a ring. **One eye at a time is
 * awake**: it opens — the lids drawing apart on an amber iris with a slit
 * pupil turned down at the ship, glowing — stares, and blinks shut again;
 * the rest sleep under their lids. An eye tapped while open is put out for
 * good, a seared scar stitched across, so the ring of eyes is the answer's
 * progress.
 */

/** Beats an eye takes to open, and to blink shut. */
const OPENING = 0.3;
const SHUTTING = 0.2;

export function drawEyeHeads(f: HeadsFrame): void {
  const { l, cfg, s, step, p, time } = f;
  const tile = l.tile;
  const n = hydraPerSide(step);
  const now = f.now;
  for (const seat of [0, 1] as const) {
    const side = hydraSideSign(l, cfg, seat);
    const root = hydraRoot(p.c, p.rx, side, 0, 1);
    const head = grown(root, hydraEyeHeadAt(l, cfg, seat), p.grow);
    drawNeck(
      f.ctx,
      {
        from: root,
        to: head,
        out: { x: side * tile * 0.8, y: tile * 0.8 },
        into: { x: 0, y: -tile * 1.0 },
        w0: tile * 0.62,
        w1: tile * 0.8,
      },
      tile,
      time,
    );
    const r = EYE_HEAD_TILES * tile * p.grow;
    const bulb = bulbPath(head, r, time + seat);
    f.ctx.save();
    f.ctx.translate(0, tile * 0.12);
    f.ctx.fillStyle = PALETTE.hydraHideDark;
    f.ctx.fill(bulb);
    f.ctx.restore();
    f.ctx.fillStyle = PALETTE.hydraHide;
    f.ctx.fill(bulb);
    f.ctx.save();
    f.ctx.clip(bulb);
    litRound(f.ctx, head.x, head.y, r, LIGHT_HALF.creature);
    f.ctx.restore();
    strokeGlowFaded(f.ctx, bulb, PALETTE.hydraScale, STROKE.outline, 1);
    const awake = hydraHeadOf(s, seat);
    for (let k = 0; k < n; k++) {
      const i = seat * n + k;
      const at = hydraEyeAt(l, head, side, k, n);
      const e = hydraEyeSize(n) * tile * p.grow;
      if (hydraGone(s, i)) {
        drawScar(f.ctx, at, e);
        continue;
      }
      const lid = i === awake ? openness(f, seat, now) : 0;
      drawEye(f.ctx, at, e, lid);
      if (i === awake) f.note(i, at, 0);
    }
  }
}

/** How far the side's waking eye is open, 0..1: opening after it opens, shutting as it blinks. */
function openness(f: HeadsFrame, seat: 0 | 1, now: number): number {
  const { s, cfg } = f;
  if (s.phase !== "heads" || s.blinkBeat[seat] < 0) return 0;
  if (s.lidOpen[seat]) {
    const since = now - (s.blinkBeat[seat] - cfg.hydraStareBeats);
    return Math.max(0, Math.min(1, since / OPENING));
  }
  const since = now - (s.blinkBeat[seat] - cfg.hydraBlinkBeats);
  return Math.max(0, 1 - since / SHUTTING);
}

/** An eye `e` across, open `lid` (0 shut, 1 wide): the sclera, the iris, the pupil, and the lids over them. */
function drawEye(ctx: CanvasRenderingContext2D, at: At, e: number, lid: number): void {
  const eye = new Path2D();
  eye.ellipse(at.x, at.y, e, e * 0.78, 0, 0, Math.PI * 2);
  if (lid > 0) glow(ctx, at, e * 4, PALETTE.hydraIris, 0.6 * lid);
  ctx.save();
  ctx.clip(eye);
  ctx.fillStyle = PALETTE.hydraFang;
  ctx.fill(eye);
  ctx.fillStyle = PALETTE.hydraIris;
  ctx.beginPath();
  ctx.arc(at.x, at.y + e * 0.18, e * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.hydraHideDark;
  ctx.beginPath();
  ctx.ellipse(at.x, at.y + e * 0.22, e * 0.12, e * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();
  // The lids, meeting in the middle as it shuts.
  const cover = (1 - lid) * e * 0.8;
  ctx.fillStyle = PALETTE.hydraHide;
  ctx.fillRect(at.x - e, at.y - e, e * 2, cover);
  ctx.fillRect(at.x - e, at.y + e - cover, e * 2, cover);
  ctx.restore();
  ctx.strokeStyle = PALETTE.hydraHideDark;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(eye);
  if (lid < 1) {
    ctx.strokeStyle = rgba(PALETTE.hydraIris, 0.35 + 0.3 * lid);
    ctx.lineWidth = STROKE.inner;
    ctx.beginPath();
    ctx.moveTo(at.x - e * 0.8, at.y);
    ctx.quadraticCurveTo(at.x, at.y + e * 0.25, at.x + e * 0.8, at.y);
    ctx.stroke();
  }
}

/** An eye put out: a seared hollow, stitched across, weeping ichor. */
function drawScar(ctx: CanvasRenderingContext2D, at: At, e: number): void {
  ctx.fillStyle = PALETTE.hydraStump;
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, e * 0.9, e * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.hydraIchor;
  ctx.lineWidth = STROKE.outline;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(at.x - e * 0.7, at.y);
  ctx.lineTo(at.x + e * 0.7, at.y);
  for (const x of [-0.4, 0, 0.4]) {
    ctx.moveTo(at.x + x * e - e * 0.12, at.y - e * 0.3);
    ctx.lineTo(at.x + x * e + e * 0.12, at.y + e * 0.3);
  }
  ctx.stroke();
}

/** The bulb of a head: round, lobed, breathing. */
function bulbPath(c: At, r: number, time: number): Path2D {
  const pts: At[] = [];
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    const lobe = 1 + 0.05 * Math.sin(5 * a + time * 1.2) + 0.03 * Math.sin(3 * a - time);
    pts.push({ x: c.x + Math.cos(a) * r * lobe, y: c.y + Math.sin(a) * r * 0.92 * lobe });
  }
  return smoothClosed(pts);
}
