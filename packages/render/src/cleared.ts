import {
  beatSeconds,
  clearHolds,
  clockText,
  playSeconds,
  restSeconds,
  retriesText,
  type World,
} from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drop } from "./text-drop.js";
import { waveName } from "./wave-intro.js";

/**
 * **The screen between the waves**: the wave just cleared, and what it cost.
 *
 * The owner, 18 September 2026: *"Right now when a wave is finished to the
 * moment it switches to next wave and starts tutorial/guide is very boring."*
 * It was: the pair emptied the field and then watched it, for three beats,
 * until the host was asked for the next wave. `docs/spec/between-waves.md` is
 * the sheet that decided what stands there before any of it was drawn, and
 * this is that sheet built. *No shipped alternative* is the exemption — there
 * was no screen here to vote against (`docs/looks.md`).
 *
 * **It is not congratulation, it is punctuation.** What is hard about the
 * moment is the turn it asks for: the pair has been playing, and the next thing
 * required of them is to *read* a guide — a rehearsal at full size with words
 * inside the picture. A pair still braced for the wave they were in arrives at
 * it mid-sentence. So this is the stop, loud enough that two people talking at
 * each other look up.
 *
 * **Three things and nothing else**, in the introduction's own type and in its
 * own place on the screen — the wave, by number and name; and the clock and the
 * retries, which are what a run *is* since the point score came out on 12
 * September 2026 (`sim/wave-fail.ts`, `docs/spec/structure.md` §7.2). No score,
 * no per-seat number — nothing on it may be read backwards to say who missed,
 * which is the rule the balance sheet is built on and this would have broken
 * ninety-seven times a run. Nothing to press, either: the pair's thumbs are
 * asked for at the end of the guide, and a button here is a second gate thirty
 * seconds before the first.
 *
 * **The hand-off is one movement.** The block stands where the wave's name will
 * stand again, and it goes *up* as the guide's own header comes *down* into the
 * band (`guide-tide.ts`, `OpeningFx.waveAge`) — the same gesture in opposite
 * directions, on the same kit. Two entrances of different kinds two seconds
 * apart is what would have made it two screens.
 *
 * Stateless, and no clock on `Effects`: `restSeconds` derives the age from the
 * world, so both phones read the same moment off the same state and a restart
 * has nothing to leave behind.
 */

/** How long the exit takes — the introduction's own, for the same reason. */
const FADE = 0.55;
/** The three baselines, as the gaps between them. */
const NAME_DROP = 30;
const COST_DROP = 28;

/**
 * The shortest rest this will draw on.
 *
 * The sheet's finding, and the reason `waveRestBeats` went from 3 to 6: a rest
 * of 1.9 seconds is not long enough to read two lines in. A configuration that
 * makes it shorter than this is a watching tool's — the director loops a pose
 * on a one-beat rest — and what it wants there is the field it had before, not
 * a screen that flashes.
 */
const NEEDS_SECONDS = 2;

export function drawWaveCleared(ctx: CanvasRenderingContext2D, l: Layout, world: World): void {
  const total = world.cfg.waveRestBeats * beatSeconds(world.cfg);
  if (!clearHolds(world) || total < NEEDS_SECONDS) return;
  const age = restSeconds(world);
  const out = Math.max(0, Math.min(1, (age - (total - FADE)) / FADE));

  // The field stays under it, dimmed rather than covered: what the pair is
  // looking at is the thing they just emptied, and a sheet over it would take
  // that away the way it would have taken the breach away from a lost wave
  // (`lost-screen.ts`). It arrives with the first line and leaves with them.
  ctx.fillStyle = `rgba(5,4,11,${(0.62 * Math.min(1, age / 0.25) * (1 - out)).toFixed(3)})`;
  ctx.fillRect(0, 0, l.width, l.height);

  const mid = l.width / 2;
  ctx.textAlign = "center";
  // The introduction's own place, because it is the place a wave is named
  // (`wave-intro.ts`): what rises out of it is what the next name falls into.
  let y = l.playHeight * 0.42;

  drop(ctx, mid, y, age, 0, out, () => {
    ctx.font = '600 11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(`WAVE ${world.wave + 1} CLEARED`, 0, 0);
  });

  y += NAME_DROP;
  drop(ctx, mid, y, age, 1, out, () => {
    ctx.font = '700 21px "Courier New",monospace';
    ctx.fillStyle = PALETTE.hullRim;
    ctx.fillText(waveName(world), 0, 0);
  });

  y += COST_DROP;
  drop(ctx, mid, y, age, 2, out, () => {
    ctx.font = '13px "Courier New",monospace';
    ctx.fillStyle = PALETTE.text;
    // The two figures a run is, in the formats the balance sheet reads them
    // in — one clock format in the game, and it is the sim's (`wave-fail.ts`).
    ctx.fillText(`${clockText(playSeconds(world))} · ${retriesText(world.retries)}`, 0, 0);
  });

  ctx.textAlign = "left";
}
