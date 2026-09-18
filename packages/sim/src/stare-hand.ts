import { type StareState, stareLidFree } from "./stare.js";
import { enterStare, openStare, stareBoss } from "./stare-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The one hand on THE STARE**: the lid, pulled down over the eye by the
 * seat it is not looking at, off the wire, on the tick.
 *
 * Cut off `stare-step.ts` at the seam `sinew-hand.ts` names: next door is
 * what the *eye* does on the beat — turn, look, strain, reopen — and this is
 * what the *thumb* does, which is the half with the coupling in it. On the
 * tick rather than the beat (`step.ts`), because a lid that waited for the
 * beat to shut would free the watched seat up to a whole beat after the
 * other one had already told them *go*.
 *
 * **Which seat may pull is not a side, it is a role**, and the role changes
 * every look: the lid belongs to whoever the eye is *not* looking at
 * (`stareLidFree`). That is decided here rather than at the hit test, for
 * `balloonHeard`'s reason — a device that decided for itself whose gesture
 * a message was would be a device the other one cannot check — and it is
 * what makes the lid a coupling rather than an escape: the seat that can
 * reach it is the seat that is already free, and what they buy with it is
 * the other's freedom at the price of their own next look.
 */

/**
 * One seat's thumb on the lid.
 *
 * `fromYMilli` is how far *down* the thumb has come from where it grabbed,
 * cut to `stareLidPullMilli`; a pull upward is no pull. The bottom is the
 * event: the tick the depth reaches it, the phase is `shut`, the watched
 * seat is free and the picture is told once. A thumb that lifts while the
 * lid is shut opens it (`openStare`); one that lifts before the bottom just
 * lets the lid spring back, and nothing has happened.
 *
 * While the lid is shut the depth is pinned at the bottom whatever the thumb
 * does: a lid pulled shut is not a lid a thumb can hold half-open, because
 * the eye is already straining against it and the only question left is
 * *when* it opens, not how far.
 */
export function stareLidHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "stareLid") return;
  const s = stareBoss(world);
  if (s === null) return;
  if (!command.on) {
    release(world, s, player);
    return;
  }
  if (s.phase === "shut") return;
  if (!stareLidFree(s, player)) return;
  const bottom = world.cfg.stareLidPullMilli;
  s.lidSeat = player;
  s.lidMilli = Math.max(0, Math.min(bottom, Math.round(command.fromYMilli ?? 0)));
  if (s.lidMilli < bottom) return;
  // Shut. The look is over for the watched seat, and `watching` is left as
  // it was: the picture goes on showing whose look this was, under a lid.
  enterStare(s, "shut", world.beat);
  world.events.push({ type: "stareShut", player });
}

/**
 * The thumb comes off. From `shut` that is the lid rising and the eye taking
 * the puller (`openStare`); from `looking` it is a half-pull let go, and the
 * lid springs back to nothing. Any other phase, and the thumb was on nothing.
 */
function release(world: World, s: StareState, player: 1 | 2): void {
  if (s.lidSeat !== player) return;
  if (s.phase === "shut") {
    openStare(world, s, false);
    return;
  }
  if (s.phase !== "looking") return;
  s.lidSeat = 0;
  s.lidMilli = 0;
}
