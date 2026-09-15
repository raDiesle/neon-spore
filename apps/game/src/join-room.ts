import type { LinkStatus } from "@neon-spore/net";

/**
 * The rules of step 4, THE ROOM: who may shape it, and what each READY circle
 * is doing.
 *
 * The pair walk in on two phones and one of them was first — the room's
 * `host`. The host picks the seat and the tempo, and the joiner watches the
 * choice land: two people on a voice call do not both need a control for one
 * decision, and two phones each moving the same bit is how a pair ends up in
 * the seat neither wanted. The host is the room's word, not this screen's
 * (`apps/server/src/seat.ts`, `HOST_TAG`), so a host who leaves and comes back
 * second is the joiner now, and the screen follows.
 *
 * Each says READY with the hold the guides use (`sim/ready-gate.ts`,
 * `render/ready-circles.ts`), not a START button: a circle that fills under a
 * thumb, and both circles on both screens so each can see the other is still
 * reading. The circles here are DOM rather than canvas because this screen is
 * one, and their rules are here rather than in the binding so they have a test.
 *
 * Pure, for `join-steps.ts`'s reason: `join.ts` is the sheet, this is a rule.
 */

/** Whether this phone may pick the seat and the tempo: the host's, and only
 * before beat zero — a seat swapped under a stamped start is two phones
 * disagreeing about which hull is whose. */
export function mayShape(status: LinkStatus): boolean {
  if (status.host === 0 || status.host !== status.player) return false;
  return status.state === "waiting" || status.state === "syncing" || status.state === "ready";
}

export interface CircleLook {
  /** Full: this seat has said READY. */
  done: boolean;
  /** A thumb on this phone can fill it now. */
  holdable: boolean;
  /** Waiting on the person holding this screen — the one that breathes. */
  calling: boolean;
  /** The word inside it, or "" while it is empty. */
  word: string;
}

/**
 * One circle, from this phone's side. The own circle can be held only once
 * the clocks agree: a press that stamped a beat zero the two devices place
 * differently is the whole failure the clock sync exists to prevent.
 */
export function circleLook(status: LinkStatus, seat: 1 | 2): CircleLook {
  const mine = status.player === seat;
  const counting = status.state === "countdown";
  const done = counting || (mine ? status.readyHere : status.readyThere);
  const holdable = mine && status.state === "ready" && !done;
  return {
    done,
    holdable,
    calling: holdable,
    word: counting ? `${Math.ceil(status.countdownMs / 1000)}` : done ? "READY" : "",
  };
}

/** How full a held circle is: the thumb went down at `downAt`, it is `now`. */
export function holdFraction(downAt: number | null, now: number, holdMs: number): number {
  if (downAt === null) return 0;
  return Math.min(1, Math.max(0, now - downAt) / Math.max(1, holdMs));
}
