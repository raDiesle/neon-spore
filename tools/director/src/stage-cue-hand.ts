import {
  type BossCue,
  type Field,
  type Hold,
  type Layout,
  touchDown,
  touchMove,
  touchUp,
} from "@neon-spore/render";
import { type Command, instarActing, instarBoss, type World } from "@neon-spore/sim";
import { instarGesture } from "./stage-cue-gesture.js";

/**
 * **The desk's two thumbs**: what `3` has hold of, and what it does with it
 * on every tick it stays down.
 *
 * Its own file because the key and the hand are two jobs. `stage-cue-key.ts`
 * decides **which mark a seat is given and when** — the reading, the pacing,
 * the seats the role speaks for. This decides nothing: it puts a thumb where
 * it is told, carries it where `stage-cue-gesture.ts` says the finger would
 * be, and lets go. Everything leaves through the same `touchDown`,
 * `touchMove` and `touchUp` the mouse goes through, so what the world is told
 * is what a thumb on that spot would have told it.
 *
 * **A thumb outlives the mark it answered, on purpose.** A pull let go of
 * before the step lands slips back to nought and takes the partner's with it
 * (`sim/instar-step.ts`), so a hand whose mark is done stays exactly where it
 * is. `drop` is the one that ends it: the step landed or the body is morphing
 * again, nothing is being asked, and every thumb comes up together.
 */

interface Thumb {
  hold: Hold;
  /** Where it went down — a lift reports it, and a slap goes back to it. */
  x: number;
  y: number;
  /** Ticks it has been down, counting from one. */
  ticks: number;
}

export interface CueHand {
  /** Of these seats, the ones with no thumb down — who a mark may go to. */
  free: (seats: readonly (1 | 2)[]) => readonly (1 | 2)[];
  press: (l: Layout, seat: 1 | 2, cue: BossCue) => void;
  /** One tick of every thumb that is down. */
  move: (l: Layout, world: World) => void;
  /** Every thumb up, if the boss has stopped asking for anything. */
  drop: (l: Layout, world: World) => void;
  /** Every thumb up. `where` is false for a window losing focus, which is
   * the one lift with no point to report: player 2's muzzle swipe and player
   * 1's tap on the cannon are decided by where the hand ended, and a shot
   * nobody finished is worse than none (`touch.ts`). */
  lift: (l: Layout, where: boolean) => void;
  /** How many thumbs are down. */
  count: () => number;
}

export function cueHand(
  field: () => Field,
  send: (player: 1 | 2, command: Command) => void,
): CueHand {
  const thumbs = new Map<1 | 2, Thumb>();
  const seated = (seat: 1 | 2): Field => ({ ...field(), seat });

  // No seat: the lift is signed by the hold that took it, which is the seat
  // that pressed (`render/touch.ts` `touchUp`).
  const up = (l: Layout, t: Thumb, where: boolean): void => {
    const end = where ? { x: t.x, y: t.y } : undefined;
    const r = touchUp(l, t.hold, end);
    if (r?.command) send(r.player, r.command);
  };

  const down = (l: Layout, seat: 1 | 2, x: number, y: number): Hold | null => {
    const t = touchDown(l, x, y, seated(seat));
    if (t === null) return null;
    if (t.command) send(t.player, t.command);
    return t.hold ?? null;
  };

  const press = (l: Layout, seat: 1 | 2, cue: BossCue): void => {
    const hold = down(l, seat, cue.x, cue.y);
    if (hold) thumbs.set(seat, { hold, x: cue.x, y: cue.y, ticks: 0 });
  };

  const move = (l: Layout, world: World): void => {
    for (const [seat, t] of [...thumbs]) {
      t.ticks++;
      const hold = t.hold;
      const origin = hold.kind === "drag" ? { x: hold.originX, y: hold.originY } : t;
      const id = hold.kind === "drag" ? hold.id : undefined;
      const go = instarGesture(l, world, { id, x: origin.x, y: origin.y }, t.ticks);
      if (go === null) continue;
      if (go.do === "lift") {
        thumbs.delete(seat);
        up(l, t, true);
        continue;
      }
      if (go.do === "again") {
        // Off and straight back on, which is what a slap is: the count is of
        // grabs, and a thumb left down is one of them (`sim/instar-hand.ts`).
        // A slap pushes its part back, and twenty of them push a blade out
        // from under the spot the first went down on; a slap that lands on
        // nothing frees the seat, and the key puts it on the mark where the
        // mark now is (`stage-cue-key.ts`, `arm`).
        up(l, t, true);
        const hold = down(l, seat, t.x, t.y);
        if (hold) t.hold = hold;
        else thumbs.delete(seat);
        continue;
      }
      const r = touchMove(l, hold, go.x, go.y);
      if (r?.command) send(r.player, r.command);
    }
  };

  const lift = (l: Layout, where: boolean): void => {
    for (const t of thumbs.values()) up(l, t, where);
    thumbs.clear();
  };

  const drop = (l: Layout, world: World): void => {
    if (thumbs.size === 0) return;
    const s = instarBoss(world);
    // Only this boss takes a thumb off by itself. Everywhere else a held key
    // is a held thumb and the key is the only thing that may end it.
    if (s === null || instarActing(s)) return;
    lift(l, true);
  };

  return {
    free: (seats) => seats.filter((s) => !thumbs.has(s)),
    press,
    move,
    drop,
    lift,
    count: () => thumbs.size,
  };
}
