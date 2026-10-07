import { midCol } from "./config.js";
import {
  type TrapezeState,
  trapezeAims,
  trapezeBoss,
  trapezeCatching,
  trapezeFreezes,
  trapezeFrozen,
  trapezeLitStep,
  trapezeMarkCol,
  trapezeOnMark,
  trapezeSwipe,
} from "./trapeze.js";
import { trapezeCaught } from "./trapeze-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE TRAPEZE's two handles: the freeze mark `trapezeFreeze` and the draw
 * `trapezeDraw`, both on both screens and either seat's to press. Which seat's
 * is live is the lit step's (`trapezeFreezes`, `trapezeAims`); the other seat's
 * press does nothing, silently.
 *
 * **The tap is an edge**, THE VALVE's pin (`valve-hand.ts`): a thumb already
 * resting on the mark has to lift and come down again. It lands only while
 * the flag is over the lit column (`trapezeOnMark`) and stills it for
 * `trapezeFreezeBeats`; a tap off the column is a flap, and the flag swings on.
 *
 * **The draw is THE SLING's** (`sling-hand.ts`): `on: true` is the finger
 * down, and the lift carries the swipe's sign on `fromMilli`. A lift lands a
 * catch only when all three hold: the draw was counted its beats, the flag is
 * frozen *this instant*, and the swipe goes toward the lit column's half. Any
 * other lift in a step that asked for it is a flutter, the step still lit.
 */
export function trapezeHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  if (command.target !== "trapezeFreeze" && command.target !== "trapezeDraw") return;
  const s = trapezeBoss(world);
  if (s === null) return;
  const side: 0 | 1 = player === 1 ? 0 : 1;
  if (command.target === "trapezeFreeze") tap(world, s, side, command.on);
  else draw(world, s, side, command.on, command.fromMilli);
}

function tap(world: World, s: TrapezeState, side: 0 | 1, on: boolean): void {
  if (!on) {
    s.tapDown[side] = false;
    return;
  }
  const edge = !s.tapDown[side];
  s.tapDown[side] = true;
  if (!edge || !trapezeFreezes(s, side) || trapezeFrozen(s)) return;
  const col = trapezeMarkCol(world.cfg, s) ?? midCol(world.cfg);
  if (!trapezeOnMark(world, s)) {
    world.events.push({ type: "trapezeFlap", side, col });
    return;
  }
  s.frozenBeats = world.cfg.trapezeFreezeBeats;
  s.frozenBy = side;
  s.drawnBeats[side] = 0;
  s.holding[side] = false;
  world.events.push({ type: "trapezeFreeze", side, col });
}

function draw(world: World, s: TrapezeState, side: 0 | 1, on: boolean, milli: number): void {
  if (on) {
    s.holding[side] = true;
    return;
  }
  if (!s.holding[side] || !Number.isInteger(milli)) return;
  s.holding[side] = false;
  const drawn = s.drawnBeats[side] >= world.cfg.trapezeDrawBeats;
  s.drawnBeats[side] = 0;
  if (!trapezeCatching(s) || !trapezeAims(s, side)) return;
  const step = trapezeLitStep(s);
  if (step === null) return;
  if (drawn && trapezeFrozen(s) && trapezeSwipe(milli) === Math.sign(step.offset)) {
    trapezeCaught(world, s, side);
    return;
  }
  const col = trapezeMarkCol(world.cfg, s) ?? midCol(world.cfg);
  world.events.push({ type: "trapezeFlutter", side, col });
}
