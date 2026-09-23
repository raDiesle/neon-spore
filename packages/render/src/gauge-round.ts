import { GAUGE_LEAD_BEATS, type GaugeState, gaugeBeatsLeft } from "@neon-spore/sim";
import { drawBand } from "./band.js";
import { type Dial, drawGauge, showsGaugeMarks } from "./gauge.js";
import { drawGaugeGrip } from "./gauge-grip.js";
import { drawGaugeTitle, GAUGE_TITLE_DEPTH } from "./gauge-title.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";

/**
 * **The dial, in pixels** — one circle, asked for by the picture and by the
 * cue that stands on its needle (`boss-cue-read-w.ts`).
 *
 * The pod's far edge and the dotted line past it stop a breath under the
 * title's last row (`gauge-claw.ts`).
 */
/** Room above the half-circle for the line's end and the pod's glow, as a
 * share of the radius. */
const HEADROOM = 0.16;

export function gaugeDial(l: Layout): Dial {
  const top = l.playHeight * 0.14;
  const cy = l.playHeight * 0.62;
  return {
    cx: l.width / 2,
    cy,
    // And never below a tenth of the screen: a phone too small for the words
    // to fit is a phone where the dial overlaps the title rather than vanishes.
    r: Math.max(
      l.playHeight * 0.1,
      Math.min(
        l.width * 0.42,
        l.playHeight * 0.3,
        (cy - top - GAUGE_TITLE_DEPTH - 8) / (1 + HEADROOM),
      ),
    ),
  };
}

/**
 * THE GAUGE over the whole stage.
 *
 * `canvas2d.ts` hands the frame over and draws nothing else — no grid and no
 * hull. That is the round's first condition: the field is gone, not dimmed
 * and not re-skinned. A round that borrowed the eleven columns would be a wave
 * in a costume. The band stays, as it does on SNAKE and PINBALL: it is not the
 * field, it is the ship's panel, and it is where the pair's thumbs already
 * are.
 *
 * It is a boss wave now rather than a category of its own, and this file is
 * what did not change when that happened — which was the point. The two screens
 * are still **not** the same picture, and the difference is still the round.
 *
 * The buttons come from the wave's control set and stand in the band's own
 * sockets (`gauge-button.ts`), not in geometry invented here — the owner, 20
 * September 2026: *improve the buttons a lot so they fit the regular ship hull
 * and control set visuals*.
 */

export function drawGaugeRound(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const boss = view.world.boss;
  if (boss === null || boss.kind !== "gauge") return;

  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(0, 0, l.width, l.height);

  ctx.textAlign = "center";
  drawGaugeTitle(ctx, l, view.role, l.playHeight * 0.14);
  const dial = gaugeDial(l);
  drawGauge(ctx, dial, view.world.cfg, boss, {
    showMarks: showsGaugeMarks(view.role),
    beatPhase: view.beatPhase,
    tick: view.world.tick,
    width: l.width,
  });
  // The two thumbs the round can be taken hold of by, after the dial they
  // stand on (`gauge-grip.ts`). That file asks this one for `gaugeDial` and
  // this one asks it back for the rings: the pair is `handles.ts` and
  // `touch.ts`'s, one direction at runtime, and the circle a thumb is
  // answered at is the circle the ring is drawn from.
  drawGaugeGrip(ctx, l, view.world.cfg, dial, boss, view.role, view.time);
  drawTally(ctx, l, view, boss);
  // The ship's own panel, with the round's three in its sockets
  // (`gauge-button.ts`) — which is also where the machine stops and the dark
  // begins, the job an inset rectangle round the stage used to do.
  drawBand(ctx, l, view.world, false, false, view.time, view.controls);
  if (boss.phase === "lead") drawLead(ctx, l, view, boss);
  // The verdict stands through `spent` too: the round is over and holding
  // its own picture until the next wave arrives (`sim/wave-end.ts`).
  if (boss.phase === "verdict" || boss.phase === "spent") drawVerdict(ctx, l, view, boss);
  ctx.textAlign = "left";
}

/**
 * Marks made, as pips, and the time left as a bar that empties.
 *
 * A wave's ready gate has a bar because there is something to count to; a
 * pause has none, for the opposite reason. Here
 * there is, and the bar now costs something: the beats running out break the
 * hull, so a pair who cannot see them spending are being charged for a thing
 * nobody showed them.
 */
function drawTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: GaugeState,
): void {
  const cfg = view.world.cfg;
  // Low, just above the band. The dial is the subject and the tally is the
  // footnote, and a footnote floating in the middle of the empty half of the
  // screen reads as a second thing to watch.
  const y = l.playHeight * 0.9;
  const gap = 15;
  const left = l.width / 2 - ((cfg.gaugeMarks - 1) * gap) / 2;
  for (let i = 0; i < cfg.gaugeMarks; i++) {
    ctx.beginPath();
    ctx.arc(left + i * gap, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = i < round.marks ? PALETTE.good : "#3B3163";
    ctx.fill();
  }

  const left01 = Math.min(1, gaugeBeatsLeft(view.world, round) / cfg.gaugeRoundBeats);
  const barW = l.width * 0.5;
  const barX = (l.width - barW) / 2;
  ctx.fillStyle = "#241B4F";
  ctx.fillRect(barX, y + 18, barW, 4);
  if (left01 > 0) {
    ctx.fillStyle = left01 < 0.25 ? PALETTE.ember : PALETTE.hull;
    ctx.fillRect(barX, y + 18, Math.max(1, barW * left01), 4);
  }
}

/** The count-in, so the round does not begin on a beat nobody was watching. */
function drawLead(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: GaugeState,
): void {
  const left = GAUGE_LEAD_BEATS - (view.world.beat - round.phaseBeat);
  ctx.fillStyle = PALETTE.hullRim;
  ctx.font = '600 34px "Courier New",monospace';
  ctx.fillText(String(Math.max(1, left)), l.width / 2, l.playHeight * 0.42);
}

/**
 * How it went, over the dial for a few beats.
 *
 * The line under it used to read "costs you nothing — the field is next", and
 * it was the whole category's promise. The promise is retired: running out of
 * time breaks the hull, so the screen that announces it says what it took. A
 * verdict that still claimed nothing was lost would be the game lying about
 * damage the pair is about to see on the field.
 */
function drawVerdict(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: GaugeState,
): void {
  const y = l.playHeight * 0.42;
  ctx.fillStyle = "rgba(5,4,11,.78)";
  ctx.fillRect(0, y - 46, l.width, 96);
  ctx.fillStyle = round.passed ? PALETTE.good : PALETTE.ember;
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillText(round.passed ? "HELD" : "OUT OF TIME", l.width / 2, y);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '11px "Courier New",monospace';
  ctx.fillText(`${round.marks} of ${view.world.cfg.gaugeMarks}`, l.width / 2, y + 20);
  ctx.fillStyle = round.passed ? PALETTE.dim : PALETTE.ember;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(
    round.passed ? "the hull is whole — the field is next" : "THE HULL PAID FOR IT",
    l.width / 2,
    y + 38,
  );
}
