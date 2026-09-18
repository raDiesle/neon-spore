import type { SimConfig } from "./config.js";
import { mirrorHeard } from "./mirror.js";
import { type MirrorState, type MirrorStep, mirrorGesture } from "./simon.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **A thumb on THE MIRROR's own ship**, off the wire, on the tick.
 *
 * Two of its three gestures are made on its picture rather than on the
 * panel (`MIRROR_GESTURES`, `simon.ts`), both on one target, `mirrorLobe`,
 * with `id` 0 for its cannon and 1 for its shield — the two swellings the
 * pair's own ship has, upside down. The six steps are read off a thumb the
 * way `touch-ship.ts` reads them off the pair's own lobes, so the last round
 * is the same six gestures the first was, only made on the boss:
 *
 * - **`reflect`**: player 1's lift off its cannon is a *carry* past
 *   `mirrorCarryMilli` (`cannonLeft`, `cannonRight`) or, short of one, the
 *   maw tap (`intake`); his press on its shield is `guard`. Player 2's lift
 *   off its cannon is the muzzle swipe, left red and right cyan — the order
 *   the colours stand in on his own band. Each is one `mirrorHeard`, from
 *   the picture, and the round judges it as it judges the panel.
 * - **`hold`**: where the thumbs are. Player 1's on its cannon and player
 *   2's on its shield, together, start the count `mirror.ts` reads; a lift
 *   clears it. The other seat's thumb on a lobe is ignored — the pin is
 *   both seats or nothing, and that is the split.
 */
const P1_CANNON = 1;
const P2_SHIELD = 2;
const BOTH = P1_CANNON | P2_SHIELD;

export function mirrorLobeHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "mirrorLobe") return;
  const m = world.boss;
  if (m === null || m.kind !== "mirror") return;
  const id = command.id === 0 ? 0 : command.id === 1 ? 1 : -1;
  if (id === -1) return;
  const gesture = mirrorGesture(m);
  if (gesture === "hold") pin(world, m, player, id, command.on);
  else if (gesture === "reflect") {
    const step = lobeStep(world.cfg, player, id, command.on, command.fromMilli);
    if (step !== null) mirrorHeard(world, step, "picture");
  }
}

/** The step a thumb's press or lift on one of the mirror's lobes is, or nothing. */
export function lobeStep(
  cfg: SimConfig,
  player: 1 | 2,
  id: 0 | 1,
  on: boolean,
  fromMilli: number,
): MirrorStep | null {
  if (player === 1) {
    if (id === 1) return on ? "guard" : null;
    if (on) return null;
    if (fromMilli <= -cfg.mirrorCarryMilli) return "cannonLeft";
    if (fromMilli >= cfg.mirrorCarryMilli) return "cannonRight";
    return "intake";
  }
  if (id !== 0 || on) return null;
  if (fromMilli <= -cfg.mirrorCarryMilli) return "fireRed";
  if (fromMilli >= cfg.mirrorCarryMilli) return "fireCyan";
  return null;
}

/** A thumb landing on, or leaving, one of the two lobes under `hold`. */
function pin(world: World, m: MirrorState, player: 1 | 2, id: 0 | 1, on: boolean): void {
  const bit = player === 1 && id === 0 ? P1_CANNON : player === 2 && id === 1 ? P2_SHIELD : 0;
  if (bit === 0) return;
  const was = m.holdThumbs;
  m.holdThumbs = on ? was | bit : was & ~bit;
  const now = m.holdThumbs === BOTH;
  if (now === (was === BOTH)) return;
  m.holdBeat = now ? world.beat : -1;
  world.events.push({ type: "mirrorGrip", col: m.cannonCol, on: now });
}
