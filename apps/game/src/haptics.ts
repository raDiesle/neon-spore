import type { SimEvent } from "@neon-spore/sim";
import { readSettings } from "./settings.js";

/**
 * A buzz for the two things a player must not miss.
 *
 * The game is played in a room where two people are talking over each other,
 * which is the one room a sound cue is worst in. A phone buzzing in a hand is
 * a channel that survives that, and `navigator.vibrate` is the whole of the
 * platform side of it.
 *
 * **Two events, and deliberately only two.** The hull taking a hit, and a shot
 * in the wrong colour. Both are already named in the audio catalogue, both are
 * things the pair has to notice mid-sentence, and both are the player's own
 * mistake arriving — which is what a buzz is good at saying. A phone that
 * buzzes at everything is a phone somebody turns off, and then it says nothing
 * at all.
 *
 * They are told apart by length rather than by pattern, the way their sounds
 * are told apart by shape: a hand can feel long against short and cannot count
 * pulses while reading a field.
 */

/** The hull. Long, because it is the one that costs the pair the run. */
export const HULL_MS = 120;
/** A shot in the wrong colour. Short: a correction, not an alarm. */
export const WRONG_COLOUR_MS = 40;

/**
 * How long this event should buzz for, or null for the great majority that
 * should not. Pure, and the whole of the decision — everything below it is
 * capability and consent.
 */
export function pulseFor(event: SimEvent): number | null {
  if (event.type === "breach") return HULL_MS;
  if (event.type === "reject") return WRONG_COLOUR_MS;
  return null;
}

/**
 * One frame's worth of events as one pulse, or none.
 *
 * A frame covers several ticks, and a wave that puts three rejects in one
 * frame should be one correction rather than a stutter no hand can read. The
 * longest wins, so a hull hit is never hidden behind a wrong colour that
 * happened in the same sixteen milliseconds.
 */
export function pulseForFrame(events: readonly SimEvent[]): number | null {
  let longest: number | null = null;
  for (const event of events) {
    const ms = pulseFor(event);
    if (ms !== null && (longest === null || ms > longest)) longest = ms;
  }
  return longest;
}

export interface Haptics {
  /** Feed this the frame's events, the way the mixer is fed. */
  frame: (events: readonly SimEvent[]) => void;
}

/**
 * Whether this device can buzz at all. Absent on desktop and on iOS, so the
 * settings page asks about it only where asking means something.
 */
export function canVibrate(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

/**
 * The thin caller: capability, then the player's setting, then the pulse.
 *
 * The setting is read per frame rather than held, because the settings page
 * can turn it off while the field is up and a cached flag would go on buzzing
 * at somebody who has just asked it not to. It is one `localStorage` read on
 * frames that have an event worth buzzing for, which is not most of them.
 *
 */
export function bindHaptics(buzz: (ms: number) => void = vibrate): Haptics {
  return {
    frame: (events) => {
      const ms = pulseForFrame(events);
      if (ms === null) return;
      if (!canVibrate() || !readSettings().haptics) return;
      buzz(ms);
    },
  };
}

function vibrate(ms: number): void {
  try {
    navigator.vibrate(ms);
  } catch {
    // A browser that has `vibrate` may still refuse it — outside a gesture, in
    // a background tab, or under a policy. Refusing is not a fault to report.
  }
}
