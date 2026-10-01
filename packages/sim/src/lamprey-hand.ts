import {
  LAMPREY_TEETH,
  type LampreyState,
  lampreyBiting,
  lampreyBoss,
  lampreyTapper,
} from "./lamprey.js";
import { lampreyCracked, lampreySnapped } from "./lamprey-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE LAMPREY's two handles: the jaw and the teeth.
 *
 * **The jaw is `lampreyJaw`**, a thumb that follows: the drag's `id` is the
 * column under it and `on` whether it is down, recorded for either seat
 * whenever the eel is up, so a thumb already on the hull when the mouth bites
 * holds it from the first beat. Only the bite's pinner holds, and only within
 * `lampreyGripCols` of wherever the jaw has crawled to (`lampreyHeld`).
 *
 * **The teeth are `lampreyTooth`**, an edge like THE VALVE's pin
 * (`valve-hand.ts`), its `id` the tooth: a thumb already resting has to lift
 * and come down again. Only the tapper's press counts, only while a bite is
 * on, and only the lit tooth cracks — any other snaps the last one back.
 */
export function lampreyHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const s = lampreyBoss(world);
  if (s === null) return;
  const side: 0 | 1 = player === 1 ? 0 : 1;
  const id = command.id ?? -1;
  if (command.target === "lampreyJaw") {
    if (!Number.isInteger(id) || id < 0 || id >= world.cfg.cols) return;
    s.holdCol[side] = command.on ? id : -1;
  } else if (command.target === "lampreyTooth") tap(world, s, player, side, id, command.on);
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
  if (!edge || !lampreyBiting(s) || lampreyTapper(s) !== player) return;
  if (!Number.isInteger(id) || id < 0 || id >= LAMPREY_TEETH) return;
  if (id === s.litTooth) lampreyCracked(world, s, side);
  else lampreySnapped(world, s, side);
}
