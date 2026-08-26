import { type BalanceSheet, balanceSheet, share, type Tally } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";

/**
 * The screen after the run: what the two of you were like together.
 *
 * It is the cheapest emotional payoff in the project and the numbers were
 * already in the world — every one of them was being counted while nobody was
 * being shown them. What it is *for* is making a pair start over, which is why
 * it opens with one shared percentage and not with a list of failures, and why
 * nothing on it can be read backwards to say who missed (docs/spec/structure.md
 * 7.2). The sim owns the arithmetic; this file owns nothing but the picture.
 *
 * Both players see the same sheet on both devices. There is no per-role
 * variant and there must not be one — a screen that told player 1 something
 * player 2 could not see would be exactly the apportioning of blame the design
 * spent a paragraph refusing.
 */

interface Row {
  label: string;
  tally: Tally;
  /** Shown under the label when the row has nothing in it. */
  empty: string;
}

export function drawBalanceSheet(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const sheet = balanceSheet(view.world);

  ctx.fillStyle = "rgba(7,4,15,.88)";
  ctx.fillRect(0, 0, l.width, l.height);

  const mid = l.width / 2;
  // Everything hangs off one column, so the sheet keeps its proportions on a
  // narrow phone and on the director's wide stage alike.
  const colWidth = Math.min(l.width - 44, 300);
  const left = mid - colWidth / 2;
  let y = Math.max(46, l.height * 0.5 - 190);

  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.red;
  ctx.font = '600 15px "Courier New",monospace';
  ctx.fillText("HULL BREACHED", mid, y);

  y += 46;
  y = drawSync(ctx, mid, y, sheet);

  y += 22;
  for (const row of rows(sheet)) {
    y = drawRow(ctx, left, y, colWidth, row);
  }

  y += 12;
  for (const [label, value] of memories(sheet)) {
    y = drawMemory(ctx, left, y, colWidth, label, value);
  }

  y += 20;
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '11px "Courier New",monospace';
  ctx.fillText(`${sheet.score} points · wave ${view.world.wave + 1}`, mid, y);
  ctx.fillText("tap to restart", mid, y + 22);
  ctx.textAlign = "left";
}

/**
 * The one shared number. A run that never asked anything of the pair has none
 * — better a dash than a 0% nobody earned.
 */
function drawSync(ctx: CanvasRenderingContext2D, mid: number, y: number, s: BalanceSheet): number {
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '10px "Courier New",monospace';
  ctx.fillText("SYNC", mid, y - 34);

  ctx.fillStyle = syncColor(s.sync);
  ctx.font = '600 44px "Courier New",monospace';
  ctx.fillText(s.sync === null ? "—" : `${s.sync}%`, mid, y);

  ctx.fillStyle = PALETTE.dim;
  ctx.font = '10px "Courier New",monospace';
  ctx.fillText(
    s.moments === 0
      ? "nothing was asked of you yet"
      : `${s.moments} moment${s.moments === 1 ? "" : "s"} that needed both of you`,
    mid,
    y + 18,
  );
  return y + 18;
}

/**
 * Never red. The sheet is allowed to say a run went badly; it is not allowed
 * to look like a telling-off, because the whole point of it is the next run.
 */
function syncColor(sync: number | null): string {
  if (sync === null) return PALETTE.dim;
  if (sync >= 75) return PALETTE.cyan;
  if (sync >= 45) return PALETTE.hull;
  return PALETTE.pod;
}

/**
 * The sub-values. Each is a share of something both of them had a hand in —
 * see `balanceSheet` for why that is the test a row has to pass.
 */
function rows(s: BalanceSheet): Row[] {
  return [
    { label: "WARDS", tally: s.wards, empty: "no rock reached you" },
    { label: "TIMING", tally: s.timing, empty: "no shield was in column" },
    { label: "COLOUR", tally: s.color, empty: "nothing was shot" },
    { label: "PODS", tally: s.pods, empty: "no pod came down" },
  ];
}

function drawRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  row: Row,
): number {
  const pct = share(row.tally);
  const labelWidth = 58;
  const countWidth = 46;
  const barX = x + labelWidth;
  const barWidth = Math.max(0, width - labelWidth - countWidth);

  ctx.textAlign = "left";
  ctx.font = '10px "Courier New",monospace';
  ctx.fillStyle = pct === null ? "#4B4177" : PALETTE.text;
  ctx.fillText(row.label, x, y + 4);

  ctx.fillStyle = "#2A1F4E";
  ctx.fillRect(barX, y - 3, barWidth, 6);
  if (pct !== null) {
    ctx.fillStyle = syncColor(pct);
    ctx.fillRect(barX, y - 3, (barWidth * pct) / 100, 6);
  }

  ctx.textAlign = "right";
  ctx.font = '10px "Courier New",monospace';
  if (pct === null) {
    ctx.fillStyle = "#4B4177";
    ctx.fillText("—", x + width, y + 4);
  } else {
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText(`${row.tally.good}/${row.tally.of}`, x + width, y + 4);
  }

  // A row with nothing in it says why, rather than reading as a zero.
  if (pct === null) {
    ctx.textAlign = "left";
    ctx.fillStyle = "#4B4177";
    ctx.font = '9px "Courier New",monospace';
    ctx.fillText(row.empty, barX, y + 15);
    return y + 30;
  }
  return y + 22;
}

/**
 * The shared memories the spec asks for instead of only numbers. They are not
 * percentages and must not be drawn as bars: a memory is a thing that happened
 * once, and rounding it into a share would take away the only part of the
 * sheet a pair repeats to each other afterwards.
 */
function memories(s: BalanceSheet): [string, string][] {
  return [
    ["longest clean run", `${s.bestStreak}`],
    ["pods shot loose", `${s.podsFreed}`],
    ["waves cleared", `${s.wavesCleared}`],
  ];
}

function drawMemory(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
): number {
  ctx.font = '10px "Courier New",monospace';
  ctx.textAlign = "left";
  ctx.fillStyle = PALETTE.dim;
  ctx.fillText(label, x, y);
  ctx.textAlign = "right";
  ctx.fillStyle = PALETTE.text;
  ctx.fillText(value, x + width, y);
  ctx.textAlign = "left";
  return y + 16;
}
