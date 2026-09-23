import {
  type SimConfig,
  type SpliceState,
  spliceCurrent,
  spliceNumberAt,
  spliceWanted,
} from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawMouths } from "./splice-flesh.js";
import {
  drawStraws,
  drawStubs,
  spliceFlightAt,
  spliceMouthY,
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
 * Nothing here is held between frames. The number in flight is a fraction of
 * `world.beat - feedBeat` over `spliceFeedBeats`, and the verdict is a fraction
 * of `world.beat - verdictBeat` — both read off the fight's own state every
 * frame, which is the one thing a restart cannot leave stale
 * (`packages/render/test/restart.test.ts`).
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
  if (full) drawStraws(ctx, l, cfg, s);
  else drawStubs(ctx, l, cfg, s);
  drawMouths(ctx, l, cfg, s, full, cannonCol, beat, beatPhase);
  if (full) drawNumbers(ctx, l, cfg, s);
  drawFlight(ctx, l, cfg, s, cannonCol, beat, beatPhase, full);
  if (full) drawClock(ctx, l, cfg, s, beat);
}

/**
 * The numbers at the top ends, upright, on the seat that is shown the tangle.
 *
 * **A number that is travelling is not also at its top end.** Watched at tempo
 * on 16 September 2026: the token coming down the straw and the label it came
 * from were both on the screen, so the tangle said the one was in two places.
 * The top end keeps its ring — a straw with nothing over it would read as a
 * straw that had gone — and the digit is where the number is.
 */
function drawNumbers(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpliceState,
): void {
  const size = Math.max(9, Math.min(16, l.tile * 0.45));
  ctx.font = `600 ${Math.round(size)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const y = spliceTopY(l, cfg);
  for (let e = 0; e < s.entranceCols.length; e++) {
    const n = spliceNumberAt(s, e);
    const top = s.topOf[e] ?? e;
    const x = tileCX(l, s.topCols[top] ?? 0);
    const spent = n <= s.fed;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.background;
    ctx.fill();
    ctx.strokeStyle = spent ? PALETTE.good : PALETTE.rock;
    ctx.stroke();
    if (e === s.feedFrom) continue;
    ctx.fillStyle = spent ? PALETTE.good : PALETTE.text;
    ctx.fillText(String(n), x, y);
  }
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

/**
 * The number on its way down, and the verdict where it landed.
 *
 * It rides the straw's own curve, so the navigator watches it cross every
 * other straw exactly where the line does. On the pilot's screen the curve is
 * clipped to the band over the mouths, so the same travel simply arrives out
 * of the fade a beat before it lands — which is the moment the pair is
 * actually waiting on.
 *
 * **The place comes out of `spliceFlightAt`** rather than out of a lerp of its
 * own, because the cue's frame stands on this same point on the seat that holds
 * the maw (`boss-cue-read-d.ts`): a word beside the number rather than round it
 * would be the picture and the field disagreeing about where the answer is.
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
  const at = spliceFlightAt(l, cfg, s, beat + beatPhase);
  if (at === null) return;
  const mouthY = spliceMouthY(l, cfg);
  // On the pilot's screen the straw above the band does not exist, so neither
  // does the number on it: it comes out of the fade rather than floating over
  // a field with nothing to hang from.
  if (!full && at.y < mouthY - l.tile * 1.2) return;
  const size = Math.max(9, Math.min(16, l.tile * 0.45));
  ctx.beginPath();
  ctx.arc(at.x, at.y, size * 0.8, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.pod;
  ctx.fill();
  ctx.font = `600 ${Math.round(size)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = PALETTE.podDark;
  ctx.fillText(String(spliceNumberAt(s, s.feedFrom)), at.x, at.y);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
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
  ctx.fillStyle = left <= 4 ? PALETTE.red : PALETTE.dim;
  ctx.textAlign = "center";
  ctx.fillText(
    `${wanted === -1 ? s.topOf.length : s.fed + 1} OF ${s.topOf.length} · ${left}`,
    l.gridLeft + l.gridWidth / 2,
    spliceTopY(l, cfg) - l.tile * 0.7,
  );
  ctx.textAlign = "start";
}
