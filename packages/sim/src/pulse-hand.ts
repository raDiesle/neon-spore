import { ticksPerBeat } from "./config-derived.js";
import type { PulseHeart, PulseState } from "./pulse.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE PULSE's hand on the bar** — the one gesture in this round that is not
 * a step, and the only object in the game both seats own
 * (`docs/spec/interludes.md`, THE PULSE's *Three bars, three hands*).
 *
 * The round splits nothing in its verbs: both panels carry the same four
 * arrows and a press is judged the same way whichever thumb it came from
 * (`pulse-controls.ts`). So the state it gains is not a seat's, it is the
 * **meter's** — the one number that was already the whole of whether a stage
 * is lost, fed and drained by the pair together.
 *
 * **The brace is either seat's**, under `flutter`. A thumb on the bar takes
 * that seat out of the song: its own notes are passed over rather than missed,
 * and nothing it presses counts. What it buys is on the other side — the seat
 * still playing pays `pulseBracePermille` of a miss instead of all of it. One
 * of them carries the pair for as long as the other can hold on, which is the
 * sentence this round has always been about said with a thumb.
 *
 * **Under `arrest` one thumb buys nothing at all.** The bar is going, and the
 * only thing that puts anything back into it is **both** of them on it at
 * once: `pulseArrestGainMilli` a beat, while neither of them is hitting an
 * arrow. A bar spent saving the meter is a bar of arrows missed by both, so
 * the pair has to agree out loud on which bar to spend — which is THE INSTAR's
 * *together means together* arriving in a round.
 *
 * Nothing here can hurt them. A thumb on a steady bar does nothing, and a
 * brace is never worse than not bracing: what it costs is the notes it passes
 * over, which are notes that seat was not going to be judged on either way.
 */
export function pulseHandHeard(
  world: World,
  state: PulseState,
  player: 1 | 2,
  command: Command,
): void {
  if (command.kind !== "drag" || command.target !== "pulseMeter") return;
  if (pulseHeart(world.cfg, state) === "steady") return;
  const was = player === 1 ? state.brace1 : state.brace2;
  if (was === command.on) return;
  if (player === 1) state.brace1 = command.on;
  else state.brace2 = command.on;
  world.events.push({ type: command.on ? "pulseBrace" : "pulseSlip", player });
  if (state.brace1 && state.brace2) world.events.push({ type: "pulseArrest" });
}

/** The two figures `pulseHeart` reads, as little of `SimConfig` as it needs. */
export interface PulseHeartBounds {
  pulseFlutterMilli: number;
  pulseArrestMilli: number;
}

/**
 * What the bar has become. Never stored — the meter is the whole of it, the
 * way `snakeGrip` reads a body's length and `scoutLoad` a ship's motes.
 */
export function pulseHeart(cfg: PulseHeartBounds, state: PulseState): PulseHeart {
  if (state.meter < cfg.pulseArrestMilli) return "arrest";
  if (state.meter < cfg.pulseFlutterMilli) return "flutter";
  return "steady";
}

/** Whether this seat's thumb is on the bar and counting: never on a steady one. */
export function pulseBraced(cfg: PulseHeartBounds, state: PulseState, player: 1 | 2): boolean {
  if (pulseHeart(cfg, state) === "steady") return false;
  return player === 1 ? state.brace1 : state.brace2;
}

/**
 * What a miss costs this seat, in thousandths of a tile of meter: all of it
 * ordinarily, and `pulseBracePermille` of it while the *other* seat is holding
 * the bar for them.
 */
export function pulseMissCost(world: World, state: PulseState, player: 1 | 2): number {
  const other: 1 | 2 = player === 1 ? 2 : 1;
  const full = world.cfg.pulseMissMilli;
  if (!pulseBraced(world.cfg, state, other)) return full;
  return Math.round((full * world.cfg.pulseBracePermille) / 1000);
}

/**
 * Both thumbs on a bar that is not steady: `pulseArrestGainMilli` a beat back
 * into it, and nothing while either of them is off it — the whole point of the
 * last state is that it takes the pair.
 *
 * **On the beat and not on the tick**, because it is a figure the pair counts
 * in: a gain per tick would climb the whole bar inside a step and the gesture
 * would be a button. And **capped at `pulseFlutterMilli`**, which is where the
 * hand was offered: holding the bar buys the stage back out of danger and
 * never fills it, so the song is still the only thing that can.
 */
export function stepPulseArrest(world: World, state: PulseState): void {
  if (pulseHeart(world.cfg, state) === "steady") return;
  if (!state.brace1 || !state.brace2) return;
  if (world.tick % ticksPerBeat(world.cfg) !== 0) return;
  state.meter = Math.min(world.cfg.pulseFlutterMilli, state.meter + world.cfg.pulseArrestGainMilli);
}
