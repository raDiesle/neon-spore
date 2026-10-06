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
import { lampreyFreed, lampreySnapped, lampreyTapped } from "./lamprey-step.js";
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
 * pull is `-fromYMilli`, cut to `lampreyHeadPullMilli`.
 *
 * **The teeth are `lampreyTooth`**, an edge like THE VALVE's pin
 * (`valve-hand.ts`), its `id` the tooth: a thumb already resting has to lift
 * and come down again. The step's `taps` of them on the lit tooth crack it.
 *
 * **A bite comes off the tile the instant both hands are where they need to
 * be**, whichever arrived last: so a head held all the way up comes off the
 * tick the partner's thumb lands on the tail. Only the stay's own seats are
 * heard; the other's press on a part is not theirs and does nothing.
 */
export function lampreyHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const s = lampreyBoss(world);
  if (s === null) return;
  const side: 0 | 1 = player === 1 ? 0 : 1;
  if (command.target === "lampreyTail") {
    tail(world, s, side, command.on, command.fromMilli, command.fromYMilli ?? 0);
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
  const was = s.tailDown[side];
  s.tailDown[side] = on;
  const way = lampreyTailWay(s);
  const along = Math.trunc((fromMilli * way.x + fromYMilli * way.y) / 1000);
  const full = world.cfg.lampreyTailPullMilli;
  s.tailMilli[side] = on ? Math.max(0, Math.min(full, along)) : 0;
  if (on && !was && lampreyHolder(s) === side + 1) {
    world.events.push({ type: "lampreyGrip", side, col: s.col });
  }
  settle(world, s);
}

function head(world: World, s: LampreyState, side: 0 | 1, on: boolean, fromYMilli: number): void {
  const full = world.cfg.lampreyHeadPullMilli;
  s.headMilli[side] = on ? Math.max(0, Math.min(full, -Math.round(fromYMilli))) : 0;
  if (!on) s.slipped[side] = false;
  settle(world, s);
}

/**
 * Whether the bite has come off: a `pull` with the head all the way up and
 * the tail held, an `apart` with both all the way out. A head all the way up
 * on a loose tail slips, said once a press.
 */
function settle(world: World, s: LampreyState): void {
  const ask = lampreyAsks(s);
  const worker = lampreyWorker(s);
  if (worker === null || (ask !== "pull" && ask !== "apart")) return;
  const cfg = world.cfg;
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
