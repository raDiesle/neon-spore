import { spanOf, type World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { ALARM_HEIGHT, alarmRows } from "./ship-top-rows.js";
import { sirenCentre } from "./siren.js";
import { SIREN_PAD } from "./siren-seats.js";

/** `PALETTE.rock` (#C7CBD6) as an rgb triple, for alpha-graded fills — the
 * same literal the meteor's own crater rim already uses in `creatures.ts`. */
const ROCK_RGB = "199,203,214";
/** The call's own line: a size up from the 10 px it was written at, for the
 * same reason the siren's old dial grew, on 16 October 2026. */
const ALARM_FONT = '700 11px "Courier New",monospace';

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
  /**
   * How many columns it will cover when it lands — the queue entry's own
   * width and not the kind's, because a torch's is authored now (`RockSize`)
   * and a one-tile one is a thing a wave may write. A band drawn at the kind's
   * width would tell player 1 to call two columns for a rock standing in one,
   * which is the pair rehearsing a plate that covers the wrong lane.
   */
  span: number;
}

/** The next torch in the queue within `lead` beats of arriving, or null. */
export function torchWarning(world: World, lead: number): TorchWarning | null {
  for (let i = world.spawned; i < world.queue.length; i++) {
    const q = world.queue[i]!;
    if (q.kind !== "torch") continue;
    const inBeats = q.beat - (world.waveBeat - 1);
    if (inBeats < 0 || inBeats > lead) continue;
    return { col: q.col, inBeats, span: spanOf(q) };
  }
  return null;
}

/**
 * The lowest this band reaches, or null when no torch is close enough to be
 * called. For whoever has to keep off it: a rehearsal's caption box is placed
 * around what the ship has already written (`ship-top-chrome.ts`). Where the
 * band *goes* is `ship-top-rows.ts`.
 */
export function torchAlarmFoot(l: Layout, world: World): number | null {
  if (!torchWarning(world, world.cfg.radarLead)) return null;
  return alarmRows(l, world).torch + ALARM_HEIGHT;
}

export function drawTorchAlarm(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
): void {
  const warning = torchWarning(world, world.cfg.radarLead);
  if (!warning) return;

  const top = alarmRows(l, world).torch;
  const pulse = 0.55 + 0.45 * Math.sin(time * 7);
  // `col` is the torch's leftmost column (see `spanCenterCol` in sim/types.ts),
  // so the band runs from that column's left edge to the right edge of the
  // column past it.
  const left = l.gridLeft + warning.col * l.tile;
  const right = l.gridLeft + (warning.col + warning.span) * l.tile;

  ctx.save();

  const band = ctx.createLinearGradient(left, 0, right, 0);
  band.addColorStop(0, `rgba(${ROCK_RGB},0)`);
  band.addColorStop(0.5, `rgba(${ROCK_RGB},${0.3 * pulse})`);
  band.addColorStop(1, `rgba(${ROCK_RGB},0)`);
  ctx.fillStyle = band;
  ctx.fillRect(0, top, l.width, ALARM_HEIGHT);

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

  // Centred under the siren, on the row under its duty word. The line is the
  // sentence the siren's chips are asking for — *this is the call, and here is
  // what to say* — so it hangs off the dial rather than off the band or the
  // torch: the owner, 16 October 2026, *the text should go below the siren*.
  // It stood right-aligned to the cluster's right edge until then, which put
  // it under a chip rather than under the light that had just gone up.
  ctx.font = ALARM_FONT;
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.rock;
  ctx.globalAlpha = 0.8 + 0.2 * pulse;
  const text = alarmText(l.role, warning);
  // Pulled back inside the screen when too wide to be centred, as the duty
  // word above it is (`siren.ts`).
  const half = ctx.measureText(text).width / 2;
  const mid = sirenCentre(l).x;
  const x = Math.min(Math.max(mid, SIREN_PAD / 2 + half), l.width - SIREN_PAD / 2 - half);
  ctx.fillText(text, x, top + ALARM_HEIGHT - 1);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";

  ctx.restore();
}

function alarmText(role: Layout["role"], w: TorchWarning): string {
  if (role === "p2") return "TORCH INBOUND · TAKE THE COLUMN";
  // 1-based, the way a caller says a column out loud: `w.col` is the torch's
  // leftmost (0-based) column, so the pair spans `w.col + 1` to `w.col + span`.
  // One column at a one-tile torch, and the line says so rather than naming a
  // range of one.
  const lo = w.col + 1;
  const hi = w.col + w.span;
  return lo === hi ? `TORCH · COLUMN ${lo} · CALL IT` : `TORCH · COLUMNS ${lo}-${hi} · CALL IT`;
}
