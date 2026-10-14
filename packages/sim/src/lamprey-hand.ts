import {
  LAMPREY_TEETH,
  type LampreyState,
  lampreyAsks,
  lampreyBoss,
  lampreyHeadPull,
  lampreyHolder,
  lampreyTailHeld,
  lampreyTailPull,
  lampreyWorker,
} from "./lamprey.js";
import { lampreyTailWay } from "./lamprey-leap.js";
import { lampreyPlugPressed, lampreyPlugPulled, lampreyTailOffered } from "./lamprey-plug.js";
import { lampreyFreed, lampreySnapped, lampreyTapped } from "./lamprey-step.js";
import { lampreyTowEnd, lampreyTowHeard } from "./lamprey-tow.js";
import { type Pull, pullHeard, pullTravelMilli } from "./pull.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE LAMPREY's three handles: the tail, the head and the teeth, heard on the
 * tick.
 *
 * **The tail is `lampreyTail`**, the holder's: `on` is the thumb down on it,
 * and in an `apart` the carry is read along the body away from the head
 * (`lampreyTailWay`) — `fromMilli` across and `fromYMilli` down, the tile
 * being the one length two phones share.
 *
 * **The head is `lampreyHead`**, the worker's, pulled **up**: `fromYMilli` is
 * negative going up the screen, THE CURTAIN's hem (`curtain-hand.ts`), so the
 * pull is `-fromYMilli`, cut to `lampreyHeadPullMilli`. In a `tow` the same
 * drag carries the head along its curve instead (`lamprey-tow.ts`).
 *
 * **The head and the tail are the one generic PULL** (`pull.ts`) for their
 * travel — up, and out along the body — and for a lift let go short, which
 * is said (`pullShort`). The count is not theirs: what either is worth is
 * whether the partner's hand is there too (`settle`), so a pull is *held*
 * at its reach rather than counted at it. The tow's knob stays where it is
 * let go, so a tow lifted part way is a pull taken in two presses, never a
 * short one, and is off the rule.
 *
 * **The teeth are `lampreyTooth`**, an edge like THE VALVE's pin
 * (`valve-hand.ts`), its `id` the tooth: a thumb already resting has to lift
 * and come down again. The step's `taps` of them on the lit tooth crack it.
 *
 * **A plug is a panel button as well** (`lamprey-plug.ts`): the worker's
 * press of the button the teeth have pushes it back in, heard here like any
 * other command; the tail is the holder's pull, and only there once the
 * button is in. A thumb down before it is not heard until it lifts.
 *
 * **A bite comes off the tile the instant both hands are where they need to
 * be**, whichever arrived last: so a head held all the way up comes off the
 * tick the partner's thumb lands on the tail. Only the stay's own seats are
 * heard; the other's press on a part is not theirs and does nothing.
 */
export function lampreyHeard(world: World, player: 1 | 2, command: Command): void {
  const s = lampreyBoss(world);
  if (s === null) return;
  if (command.kind !== "drag") {
    lampreyPlugPressed(world, s, player, command);
    return;
  }
  const side: 0 | 1 = player === 1 ? 0 : 1;
  if (command.target === "lampreyTail") {
    tail(world, s, side, command.on, command.fromMilli, command.fromYMilli ?? 0);
  } else if (command.target === "lampreyHead" && lampreyAsks(s) === "tow") {
    lampreyTowHeard(world, s, side, command.on, command.fromMilli, command.fromYMilli ?? 0);
    settle(world, s);
  } else if (command.target === "lampreyHead") {
    head(world, s, side, command.on, command.fromYMilli ?? 0);
  } else if (command.target === "lampreyTooth") {
    tap(world, s, player, side, command.id ?? -1, command.on);
  }
}

function tail(
  world: World,
  s: LampreyState,
  side: 0 | 1,
  on: boolean,
  fromMilli: number,
  fromYMilli: number,
): void {
  // A plug's tail is not there until the button is in: a thumb down before
  // then is not heard, and is not until it lifts and takes hold again.
  if (lampreyAsks(s) === "plug" && (s.slipped[side] || !lampreyTailOffered(world.cfg, s))) {
    s.slipped[side] = on;
    s.tailDown[side] = false;
    s.tailMilli[side] = 0;
    return;
  }
  const was = s.tailDown[side];
  s.tailDown[side] = on;
  const way = lampreyTailWay(s);
  const along = Math.trunc((fromMilli * way.x + fromYMilli * way.y) / 1000);
  const rope: Pull = { way: "down", reachMilli: world.cfg.lampreyTailPullMilli };
  // A tail carried out — an `apart`'s or a tow's — let go short of the reach
  // is said; a `pull`'s tail is only held, and has no distance to fall short of.
  const carried = lampreyAsks(s) === "apart" || lampreyAsks(s) === "tow";
  if (!on && carried && lampreyHolder(s) === side + 1) {
    shortOf(world, s, rope.reachMilli, s.tailMilli[side] ?? 0, side);
  }
  s.tailMilli[side] = on ? pullTravelMilli(rope, along) : 0;
  if (on && !was && lampreyHolder(s) === side + 1) {
    world.events.push({ type: "lampreyGrip", side, col: s.col });
  }
  settle(world, s);
}

function head(world: World, s: LampreyState, side: 0 | 1, on: boolean, fromYMilli: number): void {
  const rope: Pull = { way: "up", reachMilli: world.cfg.lampreyHeadPullMilli };
  const asked = lampreyAsks(s) === "pull" || lampreyAsks(s) === "apart";
  if (!on && asked && lampreyWorker(s) === side + 1) {
    shortOf(world, s, rope.reachMilli, s.headMilli[side] ?? 0, side);
  }
  s.headMilli[side] = on ? pullTravelMilli(rope, fromYMilli) : 0;
  if (!on) s.slipped[side] = false;
  settle(world, s);
}

/**
 * A hand let go of a held pull: `held` is how far along its way it had it,
 * read as the lift. Short of `reachMilli` and past a tap, it is refused and
 * said.
 */
function shortOf(world: World, s: LampreyState, reachMilli: number, held: number, side: 0 | 1) {
  if (pullHeard({ way: "down", reachMilli }, false, false, held).heard !== "short") return;
  world.events.push({ type: "pullShort", col: s.col, player: side === 0 ? 1 : 2 });
}

/**
 * Whether the bite has come off: a `pull` with the head all the way up and
 * the tail held, an `apart` with both all the way out, a `tow` with the head
 * at the curve's end and the tail all the way out — the head left there,
 * so whichever gets there last. A head all the way up on a loose tail slips,
 * said once a press.
 */
function settle(world: World, s: LampreyState): void {
  const ask = lampreyAsks(s);
  const worker = lampreyWorker(s);
  const cfg = world.cfg;
  if (worker !== null && ask === "tow") {
    if (s.towMilli < cfg.lampreyTowMilli || lampreyTailPull(s) < cfg.lampreyTailPullMilli) return;
    // Off the hull where the curve ends, so the leap on starts where the head is.
    const end = lampreyTowEnd(world, s);
    s.col = end.col;
    s.row = end.row;
    lampreyFreed(world, s);
    return;
  }
  if (worker !== null && ask === "plug") {
    if (lampreyPlugPulled(world, s)) lampreyFreed(world, s);
    return;
  }
  if (worker === null || (ask !== "pull" && ask !== "apart")) return;
  const up = lampreyHeadPull(s) >= cfg.lampreyHeadPullMilli;
  if (ask === "apart") {
    if (up && lampreyTailPull(s) >= cfg.lampreyTailPullMilli) lampreyFreed(world, s);
    return;
  }
  if (!up) return;
  if (lampreyTailHeld(s)) {
    lampreyFreed(world, s);
    return;
  }
  const side: 0 | 1 = worker === 1 ? 0 : 1;
  if (s.slipped[side]) return;
  s.slipped[side] = true;
  world.events.push({ type: "lampreySlip", side, col: s.col });
}

function tap(
  world: World,
  s: LampreyState,
  player: 1 | 2,
  side: 0 | 1,
  id: number,
  on: boolean,
): void {
  if (!on) {
    s.tapDown[side] = false;
    return;
  }
  const edge = !s.tapDown[side];
  s.tapDown[side] = true;
  if (!edge || lampreyAsks(s) !== "teeth" || lampreyWorker(s) !== player) return;
  if (!Number.isInteger(id) || id < 0 || id >= LAMPREY_TEETH) return;
  if (id === s.litTooth && lampreyTailHeld(s)) lampreyTapped(world, s, side);
  else lampreySnapped(world, s, side);
}
