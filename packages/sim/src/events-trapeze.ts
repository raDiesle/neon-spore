import type { TrapezeAsk, TrapezeSide } from "./trapeze.js";

/**
 * What THE TRAPEZE says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the alien's column for a push and a shot, the gong's for a gong.
 * A seat is `seat`, nought the pilot; a zone is the side of the swing, -1
 * the left.
 */

interface TrapezeColEvent {
  /** The column it happened over. */
  col: number;
}

/** Why a swipe did nothing: not this seat's side, not the time, or not toward the middle. */
export type TrapezeWhiffWhy = "seat" | "time" | "way";

export type TrapezeEvent =
  /** The swing comes down into the field, swaying a little. */
  | ({ type: "trapezeEnter" } & TrapezeColEvent)
  /** A level lit: what it asks, and the gong to kick. */
  | ({ type: "trapezeLevel"; ask: TrapezeAsk; gongSide: TrapezeSide } & TrapezeColEvent)
  /** In a `call` level: `seat` is to push on `zone` the next time the swing comes back there. */
  | ({ type: "trapezeCall"; seat: 0 | 1; zone: TrapezeSide } & TrapezeColEvent)
  /** A swipe on time: the swing goes higher. */
  | ({ type: "trapezePush"; seat: 0 | 1; zone: TrapezeSide } & TrapezeColEvent)
  /** A swipe while the swing went out: it slows. */
  | ({ type: "trapezeBrake"; seat: 0 | 1; zone: TrapezeSide } & TrapezeColEvent)
  /** A swipe that did nothing, and why. */
  | ({
      type: "trapezeWhiff";
      seat: 0 | 1;
      zone: TrapezeSide;
      why: TrapezeWhiffWhy;
    } & TrapezeColEvent)
  /** The pilot tapped the alien: the cannon is locked on it. */
  | ({ type: "trapezeLock" } & TrapezeColEvent)
  /** The lock ran out with no bolt landed. */
  | ({ type: "trapezeUnlock" } & TrapezeColEvent)
  /** A bolt hit the alien; `gain` whether it pushed the swing higher or slowed it. */
  | ({ type: "trapezeShot"; gain: boolean; side: boolean } & TrapezeColEvent)
  /** The alien kicked the gong; `gongs` kicked so far. */
  | ({ type: "trapezeGong"; gongs: number } & TrapezeColEvent)
  /** A level ran out: the alien jumps at the hull. */
  | ({ type: "trapezeMiss" } & TrapezeColEvent)
  /** The last gong: the swing goes over the top and the ropes snap. */
  | ({ type: "trapezeSpent" } & TrapezeColEvent)
  /** The alien is gone; the wave may end. */
  | ({ type: "trapezeOut" } & TrapezeColEvent);
