import {
  type HiveState,
  hiveClenched,
  hiveClenchUntil,
  NO_PINCH,
  type SimConfig,
} from "@neon-spore/sim";
import { type Point, SITE_R } from "./hive-shape.js";
import type { Layout } from "./layout.js";

/**
 * **THE HIVE's two held states, in field pixels**: how far a clench has drawn
 * the mass up out of reach, how much of it is left to wait out, how far
 * through her hold a pinched lobe is, and the collar a wrung breach wears
 * where its colour would have been.
 *
 * Cut off `hive-shape.ts` the day the states were drawn, because that file
 * was 24 lines under its ceiling and these four are one subject: the mass at
 * rest is next door — where it hangs, where its sites are, how it goes out —
 * and this is the mass with a thumb on it. Nothing here is per seat either
 * (`hive-shape.ts` says why); which of the two thumbs may be where is
 * `hive-grip.ts`.
 */

/**
 * How far a clench draws the whole mass up, in tiles, and over how much of a
 * beat it gets there.
 *
 * It is more than the jolt of a seal by a factor of five, and it has to be:
 * a jolt is a flinch, and this is a state that lasts six beats and puts every
 * breach out of a bolt's reach. A thumb reaching for the underside is
 * reaching *up*, past where the lobes hung a beat ago.
 */
const CLENCH_RISE = 0.5;
const CLENCH_IN_BEATS = 0.5;

/**
 * How far the clench has drawn the mass up, in tiles, net of the haul.
 *
 * Off the world every frame rather than out of `Effects`, because this one
 * outlasts a frame by six beats — the flinch of a wrong colour is the
 * transient next door (`hive-fx.ts`), and the two are drawn on the same
 * axis so that a wrong bolt inside a clench still reads as a flinch.
 *
 * **The haul is subtracted, not animated.** What the pilot's thumb has
 * carried is a number in the simulation (`s.haulMilli`), so the mass follows
 * his finger frame by frame and arrives at the bottom on the tick the carry
 * is enough — there is nothing here to catch up with, which is the whole
 * difference between dragging a thing and pressing a button that moves it.
 */
export function hiveClenchRise(
  s: HiveState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (!hiveClenched(s)) return 0;
  const inBeats = Math.max(0.01, CLENCH_IN_BEATS);
  const up = Math.min(1, (beat - s.phaseBeat + beatPhase) / inBeats);
  const hauled = Math.min(1, Math.max(0, s.haulMilli / Math.max(1, cfg.hiveHaulMilli)));
  return CLENCH_RISE * up * (1 - hauled);
}

/**
 * How much of a clench is left, 1 the beat it draws up and 0 the beat it
 * lets go — the dial under the pilot's thumb (`grip-rings.ts`), and nothing
 * else reads it. `-1` while nothing is clenched, so the drawer asks once.
 */
export function hiveClenchLeft(
  s: HiveState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  const until = hiveClenchUntil(s, cfg);
  if (until < 0) return -1;
  const beats = Math.max(1, cfg.hiveClenchBeats);
  return Math.min(1, Math.max(0, (until - beat - beatPhase) / beats));
}

/**
 * How far through her hold the pinched lobe is, 0 at the press and 1 when the
 * colour is out of it; `-1` when no thumb is on one.
 *
 * The lobe it is about is `s.pinch`, and the caller has to ask whether that
 * is the site it is drawing: two lobes swell at once late in the fight and
 * only one of them can be held.
 */
export function hivePinchPhase(
  s: HiveState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.pinch === NO_PINCH) return -1;
  const beats = Math.max(1, cfg.hivePinchBeats);
  return Math.min(1, Math.max(0, (beat - s.pinchBeat + beatPhase) / beats));
}

/**
 * The ring a wrung breach wears: a collar just outside the aperture, where a
 * colour would have been.
 *
 * It is a *second* shape rather than a colour, on purpose. The navigator's
 * screen already draws every open breach in wax-grey, so a wrung one drawn
 * grey there would say nothing at all — and the one thing the pair must not
 * have to guess is which breach either bolt will seal (§11.14).
 */
export function hiveWrungRingPath(l: Layout, c: Point, open = 1): Path2D {
  const r = l.tile * SITE_R * 0.8 * open;
  const p = new Path2D();
  p.ellipse(c.x, c.y + r * 0.35, r, r * 0.7, 0, 0, Math.PI * 2);
  return p;
}
