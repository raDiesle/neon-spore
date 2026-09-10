import { rgba } from "../../../../../packages/render/src/hex.js";
import type { VolleyShell } from "../../../../../packages/render/src/volley-look.js";
import { seamPath } from "../../../../../packages/render/src/volley-seams.js";
import { drawFrame } from "../../../../../packages/render/src/volley-stone.js";

/**
 * EMBER — the seams are the body inside showing through the joints.
 *
 * The shipped seam is the colour painted on the stone: it names the body but
 * it does not *come from* it. This draws every seam as a crack of light with
 * something hot behind it — the stone scorched dark along both sides, the
 * colour spilling out over the scorch, a core inside that goes toward white
 * where the joint is thinnest — and it breathes, because a thing burning
 * does. The claim is in what a ward changes: each sector the shield takes
 * off leaves the body less contained, so the joints burn wider and brighter
 * with `open`, and the skeleton that is left after two wards is glowing at
 * every seam rather than merely outlined. The colour is exactly the shipped
 * one; the white is a core inside it and never wider than half a seam, so
 * a red ball and a cyan ball stay two words.
 *
 * The stone is the shipped one. The rim is the shipped one.
 */

/** The seam's width, as a share of the radius — the shipped seam's. */
const SEAM = 0.07;
/** How far the scorch reaches either side, in seam widths, shut and open. */
const SCORCH_SHUT = 2.2;
const SCORCH_OPEN = 3.4;
/** How far the spill of colour reaches, in seam widths, shut and open. */
const SPILL_SHUT = 2.0;
const SPILL_OPEN = 3.6;
/** The breath: how far the glow swings, and how fast, in radians a second. */
const BREATH = 0.22;
const BREATH_RATE = 4.2;
/** A scorch is cool and never black — `docs/style-guide.md`. */
const SCORCH = "#0B1024";
/** The core: warm white, so it reads as heat and not as a third colour. */
const CORE = "#FFF3E4";

export function emberSeams(s: VolleyShell): void {
  const { ctx, ball, r, turn, glow, open, time, id, kept } = s;
  drawFrame(ctx, ball, turn, s.metal);

  const path = seamPath(r);
  const w = Math.max(1, r * SEAM);
  const heat = 1 - BREATH + BREATH * Math.sin(time * BREATH_RATE + id * 0.7);
  const scorch = SCORCH_SHUT + (SCORCH_OPEN - SCORCH_SHUT) * open;
  const spill = SPILL_SHUT + (SPILL_OPEN - SPILL_SHUT) * open;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // The scorch: stone darkened along both sides of the joint, where the heat
  // has been at it. Widest where the ball is most open — and only on the
  // stone that is still there, because a scorch is a mark on material and a
  // dark band across an emptied sector is a stripe hanging in front of the
  // body.
  ctx.save();
  if (kept) ctx.clip(kept);
  ctx.rotate(turn);
  ctx.clip(ball);
  ctx.strokeStyle = rgba(SCORCH, 0.5 + 0.2 * open);
  ctx.lineWidth = w * scorch;
  ctx.stroke(path);
  ctx.restore();

  ctx.rotate(turn);
  ctx.clip(ball);
  // The spill: the colour over the scorch, breathing.
  ctx.strokeStyle = glow;
  ctx.globalAlpha = (0.3 + 0.25 * open) * heat;
  ctx.lineWidth = w * spill;
  ctx.stroke(path);

  // The seam itself, at full strength: the shipped line, in the shipped
  // colour, a little heavier as the ball opens.
  ctx.globalAlpha = 1;
  ctx.lineWidth = w * (1 + 0.4 * open);
  ctx.stroke(path);

  // The core: warm white inside the colour, never wider than half the seam.
  ctx.strokeStyle = rgba(CORE, (0.45 + 0.4 * open) * heat);
  ctx.lineWidth = Math.max(0.5, w * 0.42);
  ctx.stroke(path);
  ctx.restore();
}
