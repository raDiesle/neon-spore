import {
  type BurgeeState,
  burgeeAims,
  burgeeBoss,
  burgeeCatching,
  burgeeFreezes,
  burgeeFrozen,
  burgeeLitStep,
  burgeeMarkCol,
  burgeeOnMark,
  burgeeSwipe,
} from "./burgee.js";
import { burgeeCaught } from "./burgee-step.js";
import { midCol } from "./config.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE BURGEE's two handles: the freeze mark `burgeeFreeze` and the draw
 * `burgeeDraw`, both on both screens and either seat's to press. Which seat's
 * is live is the lit step's (`burgeeFreezes`, `burgeeAims`); the other seat's
 * press does nothing, silently.
 *
 * **The tap is an edge**, THE VALVE's pin (`valve-hand.ts`): a thumb already
 * resting on the mark has to lift and come down again. It lands only while
 * the flag is over the lit column (`burgeeOnMark`) and stills it for
 * `burgeeFreezeBeats`; a tap off the column is a flap, and the flag swings on.
 *
 * **The draw is THE SLING's** (`sling-hand.ts`): `on: true` is the finger
 * down, and the lift carries the swipe's sign on `fromMilli`. A lift lands a
 * catch only when all three hold: the draw was counted its beats, the flag is
 * frozen *this instant*, and the swipe goes toward the lit column's half. Any
 * other lift in a step that asked for it is a flutter, the step still lit.
 */
export function burgeeHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  if (command.target !== "burgeeFreeze" && command.target !== "burgeeDraw") return;
  const s = burgeeBoss(world);
  if (s === null) return;
  const side: 0 | 1 = player === 1 ? 0 : 1;
  if (command.target === "burgeeFreeze") tap(world, s, side, command.on);
  else draw(world, s, side, command.on, command.fromMilli);
}

function tap(world: World, s: BurgeeState, side: 0 | 1, on: boolean): void {
  if (!on) {
    s.tapDown[side] = false;
    return;
  }
  const edge = !s.tapDown[side];
  s.tapDown[side] = true;
  if (!edge || !burgeeFreezes(s, side) || burgeeFrozen(s)) return;
  const col = burgeeMarkCol(world.cfg, s) ?? midCol(world.cfg);
  if (!burgeeOnMark(world, s)) {
    world.events.push({ type: "burgeeFlap", side, col });
    return;
  }
  s.frozenBeats = world.cfg.burgeeFreezeBeats;
  s.frozenBy = side;
  s.drawnBeats[side] = 0;
  s.holding[side] = false;
  world.events.push({ type: "burgeeFreeze", side, col });
}

function draw(world: World, s: BurgeeState, side: 0 | 1, on: boolean, milli: number): void {
  if (on) {
    s.holding[side] = true;
    return;
  }
  if (!s.holding[side] || !Number.isInteger(milli)) return;
  s.holding[side] = false;
  const drawn = s.drawnBeats[side] >= world.cfg.burgeeDrawBeats;
  s.drawnBeats[side] = 0;
  if (!burgeeCatching(s) || !burgeeAims(s, side)) return;
  const step = burgeeLitStep(s);
  if (step === null) return;
  if (drawn && burgeeFrozen(s) && burgeeSwipe(milli) === Math.sign(step.offset)) {
    burgeeCaught(world, s, side);
    return;
  }
  const col = burgeeMarkCol(world.cfg, s) ?? midCol(world.cfg);
  world.events.push({ type: "burgeeFlutter", side, col });
}
