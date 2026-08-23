import type { World } from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The field itself: the background, the grid that pulses on the
 * beat, and the radar strip along the top edge.
 *
 * The beat is visible here and nowhere else in the geometry — docs/spec/systems.md 5.8 asks for
 * grid lines and crossing points that light up on every beat and fade, because
 * the pulse is the thing both players share across a voice delay.
 */
export function drawBackground(ctx: CanvasRenderingContext2D, l: Layout): void {
  const g = ctx.createRadialGradient(
    l.width / 2,
    l.playHeight * 0.2,
    10,
    l.width / 2,
    l.playHeight * 0.2,
    Math.max(l.width, l.playHeight),
  );
  g.addColorStop(0, "#1D1547");
  g.addColorStop(1, "#08060F");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, l.width, l.height);
}

/**
 * `flash` is 1 on the beat and decays to 0 before the next one. It is derived
 * from `beatPhase`, never stored — the simulation has no notion of a fade.
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cannonCol: number,
  flash: number,
): void {
  ctx.strokeStyle = `rgba(124,107,196,${0.07 + 0.3 * flash})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let c = 0; c <= l.cols; c++) {
    const x = l.gridLeft + c * l.tile;
    ctx.moveTo(x, l.gridTop);
    ctx.lineTo(x, l.gridTop + l.gridHeight);
  }
  for (let r = 0; r <= l.rows; r++) {
    const y = l.gridTop + r * l.tile;
    ctx.moveTo(l.gridLeft, y);
    ctx.lineTo(l.gridLeft + l.gridWidth, y);
  }
  ctx.stroke();

  // The crossing points are the places everything snaps to, so they carry the
  // pulse more strongly than the lines do.
  ctx.fillStyle = `rgba(164,147,232,${0.18 + 0.5 * flash})`;
  const s = 1.2 + 1.6 * flash;
  for (let c = 0; c <= l.cols; c++) {
    for (let r = 0; r <= l.rows; r++) {
      ctx.fillRect(l.gridLeft + c * l.tile - s / 2, l.gridTop + r * l.tile - s / 2, s, s);
    }
  }

  // The cannon's own column, straight up. Spec 5.8: this is the only path
  // marker left in the field — everything else is read off the radar.
  const x = tileCX(l, cannonCol);
  const cg = ctx.createLinearGradient(0, l.gridTop, 0, l.gridTop + l.gridHeight);
  cg.addColorStop(0, "rgba(47,224,240,0)");
  cg.addColorStop(1, "rgba(47,224,240,.16)");
  ctx.fillStyle = cg;
  ctx.fillRect(x - l.tile / 2, l.gridTop, l.tile, l.gridHeight);
}

/**
 * Radar: arrivals only, along the top edge, in the colour of the thing that is
 * coming. Height encodes order — the closer to the edge, the sooner. There are
 * deliberately no trajectory lines inside the field, not even for meteors
 * (docs/spec/systems.md 5.8), because reading the field out loud is the game.
 */
export function drawRadar(ctx: CanvasRenderingContext2D, l: Layout, world: World): void {
  const lead = world.cfg.radarLead;
  ctx.save();
  for (let i = world.spawned; i < world.queue.length; i++) {
    const q = world.queue[i]!;
    const inBeats = q.beat - (world.waveBeat - 1);
    if (inBeats < 0 || inBeats > lead) continue;

    const hex = q.kind === "meteor" ? PALETTE.rock : q.color === "red" ? PALETTE.red : PALETTE.cyan;
    const x = tileCX(l, q.col);
    const y = l.gridTop - 7 - inBeats * ((l.radarHeight - 12) / lead);
    const a = Math.max(0.18, 1 - inBeats / (lead + 1));
    const s = 5 + 4 * (1 - inBeats / (lead + 1));

    ctx.globalAlpha = a;
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.moveTo(x, y + s);
    ctx.lineTo(x - s * 0.85, y - s * 0.55);
    ctx.lineTo(x + s * 0.85, y - s * 0.55);
    ctx.closePath();
    ctx.fill();

    // About to enter: mark the edge of its column.
    if (inBeats <= 0) {
      ctx.globalAlpha = 0.75;
      ctx.fillRect(x - l.tile * 0.36, l.gridTop - 2.5, l.tile * 0.72, 2.5);
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
