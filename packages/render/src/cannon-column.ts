import { gradientSlot, slotGradient } from "./gradient-slot.js";
import { mixHex, rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * **The cannon's own column, straight up** — spec 5.8's one path marker left
 * in the field, everything else being read off the radar.
 *
 * **In the cannon's colour, not the shield's.** It was a cyan wash, and cyan
 * is the shield; the owner, 5 October 2026, on THE HIVE: *the colour of the
 * crosshair helper to shoot cannon should be in same colour as the cannon
 * colour and it should look more cool.* The cannon is a lobe of the ship, so
 * its colour is the seat's (`seat-skin.ts`): violet on player one's screen,
 * amber on player two's.
 *
 * **A gunsight, and it stands still.** A soft wash, two rails at the column's
 * edges, a hairline down its middle in a narrow glow of its own, and a tick either side of that line at
 * every row — longer every fourth, a range ladder — all fading out towards
 * the top. Nothing travels up it: a light moving in the cannon's column is
 * what a bolt is, and the sight must never be mistaken for one. It brightens
 * on the beat and on nothing else.
 *
 * Three fills a frame and no `save`: the wash, the glow, then rails, line
 * and ticks as one path under one gradient. Every gradient depends on the
 * layout and the seat only.
 */
const washSlot = gradientSlot<CanvasGradient>();
const glowSlot = gradientSlot<CanvasGradient>();
const sightSlot = gradientSlot<CanvasGradient>();

/** Of a tile: the glow's width round the hairline, the hairline's width, the gap a tick leaves round it, a tick's reach. */
const GLOW_W = 0.36;
const CORE_W = 0.05;
const TICK_GAP = 0.1;
const TICK = 0.16;
const RANGE_TICK = 0.3;
/** Every how many rows a tick is a range mark. */
const RANGE_EVERY = 4;

export function drawCannonColumn(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cannonCol: number,
  flash: number,
  skin: SeatSkin,
): void {
  if (l.gridHeight <= 0) return;
  const top = l.gridTop;
  const bottom = top + l.gridHeight;
  const t = l.tile;
  const x = tileCX(l, cannonCol);
  const key = `${top},${l.gridHeight},${skin.tint}`;
  const fade =
    (stops: readonly (readonly [number, number])[], hex = skin.tint) =>
    () => {
      const g = ctx.createLinearGradient(0, top, 0, bottom);
      for (const [at, a] of stops) g.addColorStop(at, rgba(hex, a));
      return g;
    };

  const alpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha * (0.8 + 0.2 * flash);
  ctx.fillStyle = slotGradient(
    ctx,
    washSlot,
    key,
    fade([
      [0, 0],
      [0.6, 0.06],
      [1, 0.18],
    ]),
  );
  ctx.fillRect(x - t / 2, top, t, l.gridHeight);
  const lit = mixHex(skin.tint, skin.rim, 0.4);
  ctx.fillStyle = slotGradient(
    ctx,
    glowSlot,
    key,
    fade(
      [
        [0, 0],
        [0.55, 0.06],
        [1, 0.22],
      ],
      lit,
    ),
  );
  ctx.fillRect(x - (t * GLOW_W) / 2, top, t * GLOW_W, l.gridHeight);

  ctx.beginPath();
  const rail = Math.max(1, t * 0.04);
  ctx.rect(x - t / 2, top, rail, l.gridHeight);
  ctx.rect(x + t / 2 - rail, top, rail, l.gridHeight);
  const core = Math.max(1, t * CORE_W);
  ctx.rect(x - core / 2, top, core, l.gridHeight);
  const tickH = Math.max(1, t * 0.035);
  for (let r = 1; r < l.rows; r++) {
    const y = top + r * t - tickH / 2;
    const reach = t * (r % RANGE_EVERY === 0 ? RANGE_TICK : TICK);
    const gap = t * TICK_GAP;
    ctx.rect(x - gap - reach, y, reach, tickH);
    ctx.rect(x + gap, y, reach, tickH);
  }
  ctx.fillStyle = slotGradient(
    ctx,
    sightSlot,
    key,
    fade([
      [0, 0],
      [0.45, 0.26],
      [1, 0.8],
    ]),
  );
  ctx.fill();
  ctx.globalAlpha = alpha;
}
