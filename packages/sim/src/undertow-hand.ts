import type { Command } from "./types.js";
import { type UndertowState, undertowBoss, undertowLobeAt, undertowUnseated } from "./undertow.js";
import type { World } from "./world.js";

/**
 * **Player 2's two thumbs on the hull**, off the wire, on the tick.
 *
 * THE UNDERTOW shipped answered entirely from the panel: the maw, the beam,
 * the shield's column and the slide off are four presses and a carriage, and
 * every one of them is a control the game already had. What the fight never
 * had was a hand on the thing itself — and the thing itself is the hull, which
 * is the one part of this boss either seat can point at (the §6.2 ask,
 * `docs/spec/bosses.md` §11.20).
 *
 * Both are hers, and that is the point of them. His hands are the cannon and
 * the maw and they are full; the shield faces down for the whole of this
 * fight, so her seat is the one with a thumb to spare, and these give her a
 * second column and a way to reach *him*.
 *
 * On the tick, for `fleet-hand.ts`' reason: a thumb is where it is now, and
 * the beat only says what that came to. **What it came to is counted at the
 * foot of this file**, not in `undertow-step.ts` with the boss's own clock:
 * the free is a count of beats a thumb stayed put, which is a fact about a
 * hand, and that file is the floor's and was at its limit.
 *
 * - `undertowPin` — her thumb on a lobe standing in the hull. `id` is the
 *   column. It stops that breach widening, and keeps the maw out of it, both
 *   the way her plate does (`undertowPinned`). One pin: a thumb on a second
 *   lobe moves it off the first.
 * - `undertowFree` — her thumb on the column the floor has the cannon stuck
 *   in. Carries only `on`; the beat counts how long it stayed.
 *
 * **A seat's thumb on the other's handle is dropped without a sound**, as it
 * is on THE FLEET's chart and THE GORGE's sack.
 */
/** Both hands at rest, for the floor's own install — their fields, in their file. */
export function undertowHandsFresh(): Pick<UndertowState, "pinCol" | "freeHeld" | "freed"> {
  return { pinCol: -1, freeHeld: false, freed: 0 };
}

export function undertowHandsHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || player !== 2) return;
  const u = undertowBoss(world);
  if (u === null) return;
  if (command.target === "undertowPin") pin(world, u, command.on, command.id ?? -1);
  else if (command.target === "undertowFree") free(world, u, command.on);
}

/**
 * **The pin.** A thumb on a lobe, and nothing else: a bow is not a handle —
 * the plate has not parted yet and there is no hole to cover — and the last
 * lobe is not one either, since `undertowTake` refuses in that phase and a
 * pin there would only be a way for her to spoil his hold.
 */
function pin(world: World, u: UndertowState, on: boolean, col: number): void {
  if (!on) {
    // Lifting off a column she is no longer pinning says nothing: her thumb
    // moved to another lobe and this is the old one letting go behind it.
    if (u.pinCol !== col) return;
    u.pinCol = -1;
    world.events.push({ type: "undertowPinned", col, on: false });
    return;
  }
  if (u.phase === "last" || undertowLobeAt(u, col) === null || u.pinCol === col) return;
  if (u.pinCol >= 0) world.events.push({ type: "undertowPinned", col: u.pinCol, on: false });
  u.pinCol = col;
  world.events.push({ type: "undertowPinned", col, on: true });
}

/**
 * **The free.** Only while he is actually unseated: a thumb held on his column
 * before the floor takes him is a thumb on the hull, and the count it would
 * bank is time she did not spend watching the bow.
 */
function free(world: World, u: UndertowState, on: boolean): void {
  if (on && !undertowUnseated(u, world.beat)) return;
  u.freeHeld = on;
}

/**
 * **What her thumbs came to over the beat**, from the top of `stepUndertow`.
 *
 * Two things, and neither is the floor's. A pin whose lobe is gone — taken,
 * or withdrawn — is a thumb on the hull: the handle left the world and the
 * hold goes with it, so nothing of it can be carried into the next push.
 *
 * And **the seat given back**: her thumb held on the column the floor has the
 * cannon stuck in, counted the way the maw's hold under the last lobe is
 * counted, and at `undertowFreeBeats` the plate comes off him.
 * `unseatedUntil` goes to the beat *before* this one, so `undertowUnseats`
 * lets his next press through on the ticks that are left rather than on the
 * beat after — the whole point of the hand is the beats it wins back.
 */
export function stepUndertowHands(world: World, u: UndertowState): void {
  if (u.pinCol >= 0 && undertowLobeAt(u, u.pinCol) === null) u.pinCol = -1;
  if (!undertowUnseated(u, world.beat)) {
    u.freed = 0;
    return;
  }
  // **Lifted off, the count keeps** — `undertow-step.ts`' rule for the maw
  // held under the last lobe, and here for its reason: a count that reset on a
  // slip would ask for the one thing a phone cannot promise across a call
  // (`docs/spec/latency.md`). It is cleared above, when he has his seat back.
  if (!u.freeHeld) return;
  u.freed += 1;
  if (u.freed < world.cfg.undertowFreeBeats) return;
  u.unseatedUntil = world.beat - 1;
  u.freed = 0;
  u.freeHeld = false;
  world.events.push({ type: "undertowFreed", col: world.cannonCol });
}
