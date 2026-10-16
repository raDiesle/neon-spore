/**
 * **The bosses whose names are a page of their own**, gathered for
 * `boss-surface.ts`: each `boss-surface-<boss>.ts` beside it is one boss's
 * list, cut off when that boss outgrew a few lines of the shared one. Cut
 * from `boss-surface.ts` itself when THE GEODE's page took it to 250 lines.
 */

// What a boss asks a hand for, which its rings read (`boss-surface-asks.ts`).
export * from "./boss-surface-asks.js";
// THE BASTION's, the same way (`boss-surface-bastion.ts`).
export * from "./boss-surface-bastion.js";
// THE BROOD's, THE GEODE's and THE HYDRA's (`boss-surface-brood.ts`,
// `boss-surface-geode.ts`, `boss-surface-hydra.ts`).
export * from "./boss-surface-brood.js";
// THE CHRYSALIS's, the same way (`boss-surface-chrysalis.ts`).
export * from "./boss-surface-chrysalis.js";
// And the clock bosses' names, whole — a list of the same kind, cut for the
// same reason `bosses.ts` was (`boss-surface-clocks.ts`).
export * from "./boss-surface-clocks.js";
export * from "./boss-surface-geode.js";
export * from "./boss-surface-hydra.js";
// THE LATCH's, from the day it was written (`boss-surface-latch.ts`).
export * from "./boss-surface-latch.js";
export * from "./boss-surface-matron.js";
// THE MAZE's, since its lever's ring became the simulation's (`boss-surface-maze.ts`).
export * from "./boss-surface-maze.js";
// And PINBALL's, whole: the round whose state is a shot rather than a clock
// (`boss-surface-pinball.ts`).
export * from "./boss-surface-pinball.js";
// And SNAKE's, whole: the round with two axes of state and the only one with
// a gesture on its own body (`boss-surface-snake.ts`).
export * from "./boss-surface-snake.js";
// THE SPLICE's, since its flights became a list (`boss-surface-splice.ts`).
export * from "./boss-surface-splice.js";
