import type { NettleState, SimConfig } from "@neon-spore/sim";
import { instarPhaseAt } from "./instar-shape.js";
import type { Sway } from "./instar-sway.js";
import type { Figure } from "./nettle-figure.js";
import { nettleFigure } from "./nettle-figure.js";
import { type SlowSpan, slowHush } from "./slow-hush.js";

/**
 * **THE NETTLE pulses**, and the bell carries with it.
 *
 * A flier weaves side to side (`instar-sway.ts`); a jellyfish pulses up and
 * down, the bell rising as it squeezes and settling as it lets go. So the
 * sway here is `yMilli` alone — `xMilli` stays nought — and it is written
 * the same way as the flier's: a displacement, not a rotation, so a mark
 * drawn at the bell's own place and a thumb reaching for it move by the same
 * offset (`instar-mark-grip.ts`).
 *
 * Nothing here reads a clock: the pulse is a function of `beat` and
 * `beatPhase`, so a slow window (`sim/slow.ts`) slows it for free — and
 * dies down under it too (`slow-hush.ts`), since the pulse carries every mark
 * a thumb is asked for, and slowed it still took them a fifth of a tile a
 * second (`tools/director/test/boss-hush.test.ts`).
 */

/** Thousandths of the field's height the bell rises and falls each pulse. */
const RISE = 30;

/** Beats in one pulse, up and back. */
const BEATS = 3;

/** Beats the pulse takes to die away once the body is beaten. */
const STILLING = 2;

/** Where the bell is carried this frame. */
export function nettleSway(
  s: NettleState,
  cfg: SimConfig,
  slow: SlowSpan,
  beat: number,
  beatPhase: number,
): Sway {
  const swing = (beat + beatPhase) * ((Math.PI * 2) / BEATS);
  const alive =
    s.phase === "down"
      ? Math.max(0, 1 - instarPhaseAt(s, beat, beatPhase) / Math.min(STILLING, cfg.instarOutBeats))
      : 1;
  const k = alive * slowHush(slow, beat, beatPhase);
  return {
    xMilli: 0,
    yMilli: -RISE * k * (1 - Math.cos(swing)) * 0.5,
  };
}

/** The body this frame: the figure, carried. The one way to ask where THE
 * NETTLE's bell is — a drawer that called `nettleFigure` alone would put the
 * bell one place and the marks another. */
export function nettleBody(
  s: NettleState,
  cfg: SimConfig,
  slow: SlowSpan,
  beat: number,
  beatPhase: number,
): { f: Figure; sway: Sway } {
  const sway = nettleSway(s, cfg, slow, beat, beatPhase);
  const f = nettleFigure(s, beat, beatPhase);
  return {
    f: { ...f, bellX: f.bellX + sway.xMilli, bellY: f.bellY + sway.yMilli },
    sway,
  };
}
