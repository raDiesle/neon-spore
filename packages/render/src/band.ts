import { BULB, blobPath, SLICK } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Circle, type Layout, showsCannon, showsShield, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * The control band. Two strips over the full width, each snapping to column
 * centres, plus the trigger and the two colours.
 *
 * The split is the game: player 1 slides the cannon, triggers the shield and
 * opens the maw; player 2 slides the shield and fires. Neither can carry a
 * defence alone, and the band shows that by never giving one player both halves
 * of anything.
 *
 * A screen only draws the half it owns. The test view owns both, which is why
 * the four buttons have to fit beside each other at all.
 *
 * It is drawn on the canvas rather than in the DOM because every element is
 * per-column and has to line up with the grid exactly — see docs/decisions.md.
 */
export function drawBand(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  armed: boolean,
  open: boolean,
): void {
  ctx.fillStyle = "#0E0A22";
  ctx.fillRect(0, l.bandTop, l.width, l.bandHeight);
  ctx.strokeStyle = "#33295C";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, l.bandTop);
  ctx.lineTo(l.width, l.bandTop);
  ctx.stroke();

  ctx.font = '9px "Courier New",monospace';
  ctx.textAlign = "center";

  if (showsCannon(l.role)) {
    strip(
      ctx,
      l,
      l.cannonStrip.y,
      l.cannonStrip.height,
      world.cannonCol,
      PALETTE.hull,
      "PLAYER 1 · CANNON",
    );
    // Both lit for exactly as long as their window is open, so player 1 can see
    // what they are spending.
    action(ctx, l.guardButton, armed, PALETTE.shield, "#08131A", "SHIELD");
    action(ctx, l.intakeButton, open, PALETTE.pod, "#2C1C05", "SUCK");
  }
  if (!showsShield(l.role)) {
    ctx.textAlign = "left";
    return;
  }

  strip(
    ctx,
    l,
    l.shieldStrip.y,
    l.shieldStrip.height,
    world.shieldCol,
    PALETTE.shield,
    "PLAYER 2 · SHIELD",
  );

  for (const b of l.fireButtons) {
    const hex = b.color === "red" ? PALETTE.red : PALETTE.cyan;
    const dark = b.color === "red" ? PALETTE.redDark : PALETTE.cyanDark;
    const shape = b.color === "red" ? SLICK : BULB;
    halo(ctx, b.circle.x, b.circle.y, b.circle.r * 1.6, hex, 0.45);
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(b.circle.x, b.circle.y, b.circle.r, 0, Math.PI * 2);
    ctx.fill();

    // The button shows what the colour is *for*: the silhouette it resonates.
    const s = (b.circle.r * 0.62) / Math.max(shape.rx, shape.ry);
    ctx.save();
    ctx.translate(b.circle.x, b.circle.y);
    ctx.scale(s, s);
    ctx.fillStyle = dark;
    ctx.fill(
      new Path2D(
        blobPath(0, 0, shape.rx, shape.ry, shape.lobes, shape.depth, shape.wobble, 0, shape.seed),
      ),
    );
    ctx.restore();
    reticle(
      ctx,
      b.circle.x,
      b.circle.y,
      b.circle.r,
      b.color === "red" ? PALETTE.redRim : PALETTE.cyanRim,
    );
  }
  ctx.textAlign = "left";
}

/** One of player 1's two actions. Same button, different colour and word. */
function action(
  ctx: CanvasRenderingContext2D,
  c: Circle,
  lit: boolean,
  hex: string,
  litText: string,
  label: string,
): void {
  ctx.fillStyle = lit ? hex : "#2A1F4E";
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
  ctx.fill();
  if (lit) halo(ctx, c.x, c.y, c.r * 1.8, hex, 0.5);
  ctx.strokeStyle = hex;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = lit ? litText : hex;
  ctx.fillText(label, c.x, c.y + 3);
}

/** Scope-style crosshair on a fire button, so it reads as a target. */
function reticle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  hex: string,
): void {
  const inner = r * 0.55;
  const outer = r * 0.78;
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline;
  ctx.beginPath();
  ctx.arc(x, y, outer, 0, Math.PI * 2);
  ctx.stroke();
  // Four ticks, leaving the centre clear for the silhouette.
  ctx.beginPath();
  ctx.moveTo(x, y - outer);
  ctx.lineTo(x, y - inner);
  ctx.moveTo(x, y + inner);
  ctx.lineTo(x, y + outer);
  ctx.moveTo(x - outer, y);
  ctx.lineTo(x - inner, y);
  ctx.moveTo(x + inner, y);
  ctx.lineTo(x + outer, y);
  ctx.stroke();
  ctx.restore();
}

function strip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  y: number,
  h: number,
  col: number,
  hex: string,
  label: string,
): void {
  ctx.fillStyle = hex;
  ctx.fillText(label, l.width / 2, y - h / 2 - 4);
  ctx.fillStyle = "rgba(36,27,79,.55)";
  ctx.fillRect(l.gridLeft, y - h / 2, l.gridWidth, h);

  for (let c = 0; c < l.cols; c++) {
    const x = tileCX(l, c);
    if (c === col) {
      halo(ctx, x, y, h * 1.1, hex, 0.5);
      ctx.fillStyle = hex;
      ctx.fillRect(x - l.tile * 0.4, y - h / 2 + 2, l.tile * 0.8, h - 4);
    } else {
      ctx.fillStyle = "#3B3163";
      ctx.fillRect(x - 1, y - h * 0.22, 2, h * 0.44);
    }
  }
}
