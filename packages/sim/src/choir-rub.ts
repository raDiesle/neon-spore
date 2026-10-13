import { choirOnField, mergeChoirs } from "./choir.js";
import {
  armChoir,
  CHOIR_RUBBED,
  choirArmed,
  clearChoirArm,
  keepChoirWindow,
} from "./choir-gesture.js";
import { ticksPerBeat } from "./config.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE CHOIR's rub**: both seats scrubbing the one mark in the middle of the
 * field, at the same time — the owner, 13 October 2026, putting it where the
 * two arrows against the walls were: *we will reuse the "rub" control, which
 * is somewhere in the center of the screen and related player ( or both)
 * needs to use it at the same time*. The generic rub is THE RUB LAB's
 * (`tools/director/src/rub-lab-rule.ts`, BOTH AT ONCE), and this is it played.
 *
 * The hand is a `RubCount` on `choirRub` (`drag-targets-e.ts`): `id` how many
 * times the thumb has turned back since it went down, counted by the host that
 * owns the pointers (`render/rub-turns.ts`). Each count higher than the last
 * this seat sent is that many fresh turns, as THE CAPSTAN reads its own; the
 * lift starts the count again.
 *
 * - **A turn counts only together**: while the other seat turned within
 *   `choirTogetherBeats`. A turn made alone counts nothing — it is told, so the
 *   screen can say so — and either seat's turn, made together, is one more.
 * - **The first turn made together opens the window**, and every one after
 *   keeps it open (`keepChoirWindow`): the rub lapses when the pair stops
 *   rubbing together for `choirWindowBeats`, and the thing sings.
 * - **`choirRubTurns` turns made together** draw every membrane on the field
 *   together.
 *
 * The seats' last counts and the ticks of their last turns are on the world,
 * beside `choirArm`, and in `hashWorld`: a device that disagreed about when
 * the other seat last turned would disagree about whether the next turn counted.
 */
export function choirRubHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "choirRub") return;
  const was = player === 1 ? world.choirRubAt1 : world.choirRubAt2;
  const count = command.on ? Math.max(0, command.id ?? 0) : 0;
  if (player === 1) world.choirRubAt1 = count;
  else world.choirRubAt2 = count;
  const fresh = count >= was ? count - was : count;
  if (!command.on || fresh === 0 || !choirOnField(world.creatures)) return;
  if (player === 1) world.choirTurnTick1 = world.tick;
  else world.choirTurnTick2 = world.tick;
  const other = player === 1 ? world.choirTurnTick2 : world.choirTurnTick1;
  const together = world.tick - other <= world.cfg.choirTogetherBeats * ticksPerBeat(world.cfg);
  if (!together) {
    world.events.push({ type: "choirRubTurn", player, rubbed: world.choirRubbed, together });
    return;
  }
  if (choirArmed(world) === null) armChoir(world, CHOIR_RUBBED);
  else keepChoirWindow(world);
  world.choirRubbed = Math.min(world.cfg.choirRubTurns, world.choirRubbed + fresh);
  world.events.push({ type: "choirRubTurn", player, rubbed: world.choirRubbed, together });
  if (world.choirRubbed < world.cfg.choirRubTurns) return;
  clearChoirArm(world);
  mergeChoirs(world);
}
