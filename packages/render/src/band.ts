import { mirrorHoldsControls, type World } from "@neon-spore/sim";
import { drawActionButton, drawFireButton } from "./controls.js";
import { halo } from "./glow.js";
import { type Layout, showsCannon, showsShield, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

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
  // A boss can take the controls away (`mirrorHoldsControls`). When it has,
  // the band is drawn dead and says so: a control that quietly does nothing
  // is indistinguishable from a control that is broken.
  const locked = mirrorHoldsControls(world);
  ctx.save();
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
    const g = l.guardButton;
    const m = l.intakeButton;
    drawActionButton(ctx, g.x, g.y, g.r, armed, PALETTE.shield, "#08131A", "SHIELD");
    drawActionButton(ctx, m.x, m.y, m.r, open, PALETTE.pod, "#2C1C05", "SUCK");
  }
  if (!showsShield(l.role)) {
    ctx.restore();
    if (locked) drawLock(ctx, l);
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
    drawFireButton(ctx, b.circle.x, b.circle.y, b.circle.r, b.color);
  }
  ctx.restore();
  if (locked) drawLock(ctx, l);
  ctx.textAlign = "left";
}

/**
 * The band, put out.
 *
 * A scrim over the finished drawing rather than an alpha set before it: every
 * button in here reaches for `halo` or `reticle`, and both of those set
 * `globalAlpha` outright. Canvas alpha does not multiply, so anything set up
 * front is simply overwritten by the first child that has an opinion — which
 * is why the strips dimmed and the four buttons did not.
 */
function drawLock(ctx: CanvasRenderingContext2D, l: Layout): void {
  const y = l.bandTop + l.bandHeight / 2;
  ctx.save();
  ctx.fillStyle = "rgba(7,4,15,.78)";
  ctx.fillRect(0, l.bandTop, l.width, l.bandHeight);
  ctx.fillStyle = "rgba(7,4,15,.72)";
  ctx.fillRect(0, y - 15, l.width, 30);
  ctx.strokeStyle = PALETTE.red;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, y - 15);
  ctx.lineTo(l.width, y - 15);
  ctx.moveTo(0, y + 15);
  ctx.lineTo(l.width, y + 15);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.red;
  ctx.font = '700 12px "Courier New",monospace';
  ctx.fillText("LOCKED — WATCH", l.width / 2, y + 4);
  ctx.restore();
  ctx.textAlign = "left";
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
