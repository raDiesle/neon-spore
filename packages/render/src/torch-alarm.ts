import { colSpan, type World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { SIREN_PAD } from "./siren-seats.js";

/** `PALETTE.rock` (#C7CBD6) as an rgb triple, for alpha-graded fills — the
 * same literal the meteor's own crater rim already uses in `creatures.ts`. */
const ROCK_RGB = "199,203,214";

/**
 * The torch alarm. It is the one piece of the HUD that reads differently
 * depending on who is looking: player 1 has the radar (`radar: "p1"` on
 * `torch`, `docs/decisions.md` #15) and has to call a column out; player 2 has
 * the shield and has to act on what gets called. Neither role tells the whole
 * story alone, which is the point.
 *
 * Derived here, not stored: the sim gains no notion of an "alarm", only a
 * queue render already reads for the radar strip (`field.ts`'s `drawRadar`).
 */
export interface TorchWarning {
  col: number;
  inBeats: number;
}

/** Clear of the hull bar (`hud.ts`, y = 14) and the guard balance (y = 48). */
const ALARM_TOP = 56;
const ALARM_HEIGHT = 12;

/** The next torch in the queue within `lead` beats of arriving, or null. */
export function torchWarning(world: World, lead: number): TorchWarning | null {
  for (let i = world.spawned; i < world.queue.length; i++) {
    const q = world.queue[i]!;
    if (q.kind !== "torch") continue;
    const inBeats = q.beat - (world.waveBeat - 1);
    if (inBeats < 0 || inBeats > lead) continue;
    return { col: q.col, inBeats };
  }
  return null;
}

export function drawTorchAlarm(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
): void {
  const warning = torchWarning(world, world.cfg.radarLead);
  if (!warning) return;

  const pulse = 0.55 + 0.45 * Math.sin(time * 7);
  // `col` is the torch's leftmost column (see `spanCenterCol` in sim/types.ts),
  // so the band runs from that column's left edge to the right edge of the
  // column past it.
  const left = l.gridLeft + warning.col * l.tile;
  const right = l.gridLeft + (warning.col + colSpan("torch")) * l.tile;

  ctx.save();

  const band = ctx.createLinearGradient(left, 0, right, 0);
  band.addColorStop(0, `rgba(${ROCK_RGB},0)`);
  band.addColorStop(0.5, `rgba(${ROCK_RGB},${0.3 * pulse})`);
  band.addColorStop(1, `rgba(${ROCK_RGB},0)`);
  ctx.fillStyle = band;
  ctx.fillRect(0, ALARM_TOP, l.width, ALARM_HEIGHT);

  // Edge vignette: a faint wash at both screen edges, legible even to a glance
  // that lands away from the strip or the text.
  const edge = Math.min(40, l.width * 0.15);
  const vg = ctx.createLinearGradient(0, 0, edge, 0);
  vg.addColorStop(0, `rgba(${ROCK_RGB},${0.22 * pulse})`);
  vg.addColorStop(1, `rgba(${ROCK_RGB},0)`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, edge, l.height);
  ctx.save();
  ctx.translate(l.width, 0);
  ctx.scale(-1, 1);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, edge, l.height);
  ctx.restore();

  // Right-aligned to the siren's own right edge, directly under it. The line
  // is the sentence the siren's chips are asking for — *this is the call, and
  // here is what to say* — so it hangs off that cluster rather than floating
  // at the middle of a screen with nothing else on that axis. Centring it made
  // it a caption for the band; the band already says where.
  ctx.font = '600 10px "Courier New",monospace';
  ctx.textAlign = "right";
  ctx.fillStyle = PALETTE.rock;
  ctx.globalAlpha = 0.6 + 0.4 * pulse;
  ctx.fillText(alarmText(l.role, warning), l.width - SIREN_PAD, ALARM_TOP + ALARM_HEIGHT - 2);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";

  ctx.restore();
}

function alarmText(role: Layout["role"], w: TorchWarning): string {
  if (role === "p2") return "TORCH INBOUND · TAKE THE COLUMN";
  // 1-based, the way a caller says a column out loud: `w.col` is the torch's
  // leftmost (0-based) column, so the pair spans `w.col + 1` to `w.col + colSpan`.
  const lo = w.col + 1;
  const hi = w.col + colSpan("torch");
  return `TORCH · COLUMNS ${lo}-${hi} · CALL IT`;
}
