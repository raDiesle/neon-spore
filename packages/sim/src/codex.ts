import { faultStep } from "./fault-clock.js";
import { faultOn } from "./fault-placed.js";
import { otherColor } from "./kinds.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE CODEX: the fault that takes nothing away and changes what everything
 * means.**
 *
 * The other three faults are a control that answers nobody — the button is on
 * the panel, the pair can see it, and it fires by itself. This one leaves both
 * colours working. What it changes is the **key**: while it is on, a bolt fired
 * red kills what cyan kills, and cyan kills what red kills. Nothing about the
 * shot looks different — the bolt that leaves the muzzle is the colour the thumb
 * pressed, it sounds like that colour, and the lobe lights like that colour — so
 * the navigator has no way at all to know, and finds out by watching a slick
 * refuse a colour that should have taken it.
 *
 * **The pilot is the one who can see it**, and that is the whole coupling: a
 * shimmer runs across the field and the emitter's beam stands on the two colour
 * lobes, both on the pilot's screen and on nothing the navigator is shown
 * (`render/codex.ts`). So the seat that can read the key cannot fire, and the
 * seat that fires cannot read it — which is the sentence the encounter was
 * written around (`docs/spec/ideas.md`, before it was built).
 *
 * **It turns over rather than holding**, every `codexHoldBeats`, for the reason
 * an alternating cannon alternates: a key that held for the whole wave would be
 * one sentence said once and then forgotten, and the pair would be back to
 * playing an ordinary wave with the buttons relabelled. Turning over makes it a
 * thing one of them has to keep calling — *swapped… clear… swapped* — against a
 * partner who is already mid-shot.
 *
 * **No state and nothing in the hash.** Which way the key is round is a function
 * of the wave's own beat, `steerCol`'s arrangement exactly: two devices agree
 * about it because they agree about `waveBeat`, and there is nothing to keep in
 * step because there is nothing kept.
 */

// The other colour is `kinds.ts`' own `otherColor`, called rather than written
// again here: the swap this fault performs is exactly the rule the game already
// has a name for, and a second copy of a one-line rule is how the two come to
// disagree (`copies-table.ts`).

/** Whether this wave has THE CODEX on it at all. */
export function codexed(world: World): boolean {
  return faultOn(world, "codex") !== null;
}

/**
 * Whether the key is turned over **right now**: on for `codexHoldBeats`, off for
 * the same, from the first beat of the wave.
 *
 * It opens **swapped**, which is the owner's kind of decision rather than an
 * accident of the arithmetic: a fault that opened clear would let the pair fire
 * a whole hold of ordinary shots and meet the swap with a body already halfway
 * down, and the first thing this wave should teach is that the first shot is the
 * one that lies.
 */
export function codexSwapped(world: World): boolean {
  if (!codexed(world)) return false;
  const hold = Math.max(1, Math.round(world.cfg.codexHoldBeats));
  return Math.floor(faultStep(world) / hold) % 2 === 0;
}

/**
 * What a bolt of this colour **means** — the colour a body is matched against.
 *
 * Called once, where the shot is created (`bullets.ts`), and never at the twelve
 * places a colour is compared. That is deliberate and it is the whole reason
 * `Bullet.shown` exists: swapping at the comparisons would be one rule written
 * out twelve times, and the thirteenth body added to this game would be the one
 * that forgot. Swapping at the muzzle leaves every comparison correct by
 * construction — the fence's crack, a throb's half, a crystal's join, a boss's
 * rim — while the picture and the sound keep the colour the thumb pressed.
 */
export function shotMeans(world: World, pressed: Color): Color {
  return codexSwapped(world) ? otherColor(pressed) : pressed;
}
