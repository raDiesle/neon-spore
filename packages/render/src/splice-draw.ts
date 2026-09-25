import {
  type SimConfig,
  type SpliceState,
  spliceCurrent,
  spliceNumberAt,
  spliceWanted,
} from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawAirRush, drawSlimeBall, drawSpentBall } from "./splice-ball.js";
import { drawEater, spliceSpent } from "./splice-eater.js";
import { drawHold } from "./splice-hold.js";
import { drawPipes } from "./splice-pipe.js";
import {
  drawStraws,
  drawStubs,
  SPLICE_SHAKE_BEATS,
  spliceFlightAt,
  spliceMouthY,
  splicePipeTopY,
  spliceStubTopY,
  spliceTopY,
} from "./splice-straws.js";
import { showsSpliceTangle } from "./view-role.js";

/**
 * THE SPLICE, drawn — and drawn differently on each screen, which is the fight.
 *
 * The seat holding the cannon gets the mouths and a hand's width of straw over
 * each; the seat that cannot reach a mouth gets the whole tangle and the
 * numbers on it (`showsSpliceTangle`). Both get the number that is travelling,
 * because a control has to be answered on the screen it was pressed from —
 * what the pilot sees is it arriving out of the fade, which is the last stretch
 * of the same curve the navigator has been watching it cross.
 *
 * Nothing here is held between frames. Each number in flight is a fraction of
 * `world.beat` less the beat it was sucked, over `spliceFeedBeats`, and the verdict is a fraction
 * of `world.beat - verdictBeat` — both read off the fight's own state every
 * frame, which is the one thing a restart cannot leave stale
 * (`packages/render/test/restart.test.ts`).
 *
 * In the order the eye reads it, back to front: the living hold the fight is
 * in (`splice-hold.ts`), the straws, the pipes they end in
 * (`splice-pipe.ts`), the numbers as balls of slime to collect
 * (`splice-ball.ts`), the eater that is the clock (`splice-eater.ts`), the
 * number in flight, and the readout over all of it.
 */
export function drawSplice(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpliceState,
  cannonCol: number,
  beat: number,
  beatPhase: number,
): void {
  const full = showsSpliceTangle(l.role);
  const b = beat + beatPhase;
  drawHold(ctx, l, cfg, b, 1 - beatPhase);
  if (full) drawStraws(ctx, l, cfg, s);
  else drawStubs(ctx, l, cfg, s);
  const flying = s.flights.map((f) => ({ straw: f.straw, y: spliceFlightAt(l, cfg, s, f, b).y }));
  drawPipes(ctx, l, cfg, s, full, cannonCol, b, flying);
  // The number the eater has bitten is in its mouth, not on its top end.
  if (full) drawNumbers(ctx, l, cfg, s, b, s.eatBeat === -1 ? -1 : spliceWanted(s));
  drawEater(ctx, l, cfg, s, full, cannonCol, b);
  drawFlight(ctx, l, cfg, s, cannonCol, beat, beatPhase, full);
  if (full) drawClock(ctx, l, cfg, s, beat);
}

/**
 * The numbers at the top ends, upright, on the seat that is shown the tangle —
 * each one a ball of slime to be collected, and a green ghost once it has been.
 *
 * **A number that is travelling is not also at its top end.** Watched at tempo
 * on 16 September 2026: the token coming down the straw and the label it came
 * from were both on the screen, so the tangle said the one was in two places.
 * The ball shakes on its top end for the first beat of a feed and *is* the
 * token for that beat (`drawFlight`), so here it is left out; so is the one in
 * the eater's mouth (`gone`).
 *
 * In the last four beats of the round every ball still to be had trembles,
 * which is the clock's red said a second way.
 */
function drawNumbers(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpliceState,
  b: number,
  gone: number,
): void {
  const r = spliceBallR(l);
  const y = spliceTopY(l, cfg);
  const late =
    s.eatBeat === -1 && s.passBeat === -1 ? Math.max(0, (spliceSpent(s, b) - 0.8) * 5) : 0;
  for (let e = 0; e < s.entranceCols.length; e++) {
    if (e === gone || s.flights.some((f) => f.straw === e)) continue;
    const n = spliceNumberAt(s, e);
    const top = s.topOf[e] ?? e;
    const x = tileCX(l, s.topCols[top] ?? 0);
    if (n <= s.fed) drawSpentBall(ctx, x, y, r, String(n));
    else drawSlimeBall(ctx, x, y, r, b, e, String(n), { shake: late * 0.5, alpha: 1 });
  }
}

/** A number's ball, the same size at its top end and on its way down. */
function spliceBallR(l: Layout): number {
  return Math.max(6, Math.min(18, l.tile * 0.42));
}

/**
 * The numbers on their way down, and the verdict where the last one landed.
 *
 * It rides the straw's own curve, so the navigator watches it cross every
 * other straw exactly where the line does. On the pilot's screen the curve is
 * clipped to the band over the mouths, so the same travel simply arrives out
 * of the fade a beat before it lands — which is the moment the pair is
 * actually waiting on.
 *
 * **The place comes out of `spliceFlightAt`** rather than out of a lerp of its
 * own, because the pipe it swells on the last stretch reads the same point.
 */
function drawFlight(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpliceState,
  cannonCol: number,
  beat: number,
  beatPhase: number,
  full: boolean,
): void {
  if (s.verdictBeat !== -1 && s.verdict !== 0) {
    const since = beat + beatPhase - s.verdictBeat;
    if (since >= 0 && since < 2) {
      const col = s.verdictStraw === -1 ? cannonCol : (s.entranceCols[s.verdictStraw] ?? 0);
      ctx.beginPath();
      ctx.arc(tileCX(l, col), spliceMouthY(l, cfg), l.tile * (0.34 + since * 0.5), 0, Math.PI * 2);
      ctx.strokeStyle = s.verdict === 1 ? PALETTE.good : PALETTE.red;
      ctx.globalAlpha = Math.max(0, 1 - since / 2);
      ctx.lineWidth = Math.max(1.5, l.tile * 0.08);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1;
    }
  }
  const b = beat + beatPhase;
  const r = spliceBallR(l);
  for (const f of s.flights) {
    const at = spliceFlightAt(l, cfg, s, f, b);
    // On the pilot's screen the straw above the band does not exist, so
    // neither does the number on it: it comes out of the fade rather than
    // floating over a field with nothing to hang from.
    if (!full && at.y < spliceStubTopY(l, cfg)) continue;
    // The rumble: for the first beat the ball shakes on its top end, harder as
    // the beat goes, with the air rushing in round it — the suck taking hold
    // before it takes the number (the owner, 25 September 2026).
    const since = b - f.beat;
    const shake = since < SPLICE_SHAKE_BEATS ? Math.min(1, since / SPLICE_SHAKE_BEATS) : 0;
    if (shake > 0) drawAirRush(ctx, at.x, at.y, r, b, 0.4 + 0.6 * shake);
    // Inside its pipe it is seen through the wall the pipe swells round it with.
    const inPipe = at.y > splicePipeTopY(l, cfg) + r * 0.5;
    const label = String(spliceNumberAt(s, f.straw));
    drawSlimeBall(ctx, at.x, at.y, inPipe ? r * 0.85 : r, b, f.straw, label, {
      shake: Math.max(shake, since < SPLICE_SHAKE_BEATS ? 0 : 0.3),
      alpha: inPipe ? 0.6 : 1,
    });
  }
}

/**
 * The round's clock, on the seat that is shown the tangle and nowhere else.
 *
 * The pilot is being told what to do and has two beats of travel to watch; a
 * countdown on their screen would be a second thing to read at the one moment
 * they should be listening. The navigator is the one deciding how much to say,
 * so they are the one who is told how long they have.
 *
 * **It is a readout at a fixed offset from the top of the screen.** Only the
 * clock moves — the straws, the mouths and the numbers are on the field, not
 * in the strip.
 */
function drawClock(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpliceState,
  beat: number,
): void {
  const left = Math.max(0, spliceCurrent(s).beats - (beat - s.roundBeat));
  const wanted = spliceWanted(s);
  ctx.font = `${Math.round(Math.max(8, Math.min(12, l.tile * 0.32)))}px "Courier New",monospace`;
  ctx.textAlign = "center";
  const text = `${wanted === -1 ? s.topOf.length : s.fed + 1} OF ${s.topOf.length} · ${left}`;
  const x = l.gridLeft + l.gridWidth / 2;
  const y = spliceTopY(l, cfg) - l.tile * 0.9;
  // Over the hold's dark vault and whatever the eater has let down past it.
  ctx.fillStyle = PALETTE.background;
  ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = left <= 4 ? PALETTE.red : PALETTE.dim;
  ctx.fillText(text, x, y);
  ctx.textAlign = "start";
}
