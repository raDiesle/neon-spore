import { burgeeLitStep } from "../src/burgee.js";
import { burgeeStruck } from "../src/burgee-shot.js";
import type { World } from "../src/index.js";
import {
  beats,
  burgee,
  draw,
  install,
  runUntil,
  SCRIPT,
  shot,
  tap,
  toLit,
  toMark,
} from "./burgee-rig.js";

/**
 * THE BURGEE's steps answered as a pair would answer them, for the tests that
 * need a flag some way into its script: `burgee.test.ts` and
 * `burgee-spindle.test.ts`.
 */

/**
 * Catch the lit step: the aimer's finger down and a beat drawn, the freezer's
 * tap as the flag comes over the lit column, and the lift at once, swiped
 * toward it. The
 * freezer is the step's, or `freezer` under `"either"`. The event types seen.
 */
export function catchLit(world: World, freezer: 1 | 2 = 1): Set<string> {
  const step = burgeeLitStep(burgee(world));
  if (step === null || step.ask === "fire") throw new Error("no catch is lit");
  const f = step.freezer === "either" ? freezer : step.freezer;
  const aimer = f === 1 ? 2 : 1;
  const seen = new Set<string>();
  const add = (types: Iterable<string>) => {
    for (const t of types) seen.add(t);
  };
  add(draw(world, aimer, true));
  add(beats(world, 1));
  add(toMark(world));
  add(tap(world, f));
  add(tap(world, f, false));
  add(draw(world, aimer, false, step.offset * 400));
  return seen;
}

/** Answer the lit step, whichever it asks: a catch, or the colour it wants into the spindle. */
export function answer(world: World, freezer: 1 | 2 = 1): Set<string> {
  const step = burgeeLitStep(burgee(world));
  if (step === null) throw new Error("nothing is lit");
  if (step.ask !== "fire") return catchLit(world, freezer);
  const cursor = burgee(world).cursor;
  burgeeStruck(world, shot(step.color === "either" ? "red" : step.color));
  return runUntil(world, (w) => burgee(w).cursor > cursor);
}

/** A flag with the steps before `n` answered and step `n` lit. */
export function toStep(n: number, seed = 0): World {
  const world = install(SCRIPT, seed);
  toLit(world);
  while (burgee(world).cursor < n) {
    answer(world);
    toLit(world);
  }
  return world;
}
