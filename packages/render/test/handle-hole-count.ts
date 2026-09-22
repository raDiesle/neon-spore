import type { World } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { runFrames } from "./frame-harness.js";

/**
 * **Counting the discs a handle punches**, shared by the files that count
 * them: `handle-hole-bosses.test.ts` and `handle-hole-rulings.test.ts`.
 *
 * A ring fills a flat disc in `PALETTE.background` before anything else, so it
 * reads over whatever the fight has drawn behind it, and a fill in that colour
 * is a ring and nothing else is — except where a stage fills discs of its own,
 * which is why every count here is read as a **difference** rather than
 * against nought.
 *
 * It was one file's private helpers until a second boss lane needed the same
 * three, which is the shape of thing the rules table in
 * `sim/test/purity.test.ts` exists to stop: a count re-derived is a count that
 * drifts from the one it is being compared against.
 */

/** Frames of a world **held still**: what a ring does is counted off a beat. */
export function drawn(world: World, role: ViewRole): string {
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 3,
    onTick: () => {},
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

/** How many discs are punched out of this screen. */
export function holes(world: World, role: ViewRole): number {
  return drawn(world, role).split(PALETTE.background).length - 1;
}

/** What the handle added, on each of the three screens. */
export function added(bare: World, held: World): { p1: number; p2: number; test: number } {
  return {
    p1: holes(held, "p1") - holes(bare, "p1"),
    p2: holes(held, "p2") - holes(bare, "p2"),
    test: holes(held, "test") - holes(bare, "test"),
  };
}

/**
 * The other reading, for a handle that is **always** on offer while its boss
 * is up and so has no ring-free state of its own to be compared against.
 *
 * `test` is the seat that owns both, so it is the both-seats picture; a screen
 * that punches one fewer disc than it is a screen whose other ring cut
 * nothing. It says the same thing the difference above does without needing a
 * state the fight never enters.
 */
export function spared(world: () => World): { p1: number; p2: number } {
  const both = holes(world(), "test");
  return { p1: both - holes(world(), "p1"), p2: both - holes(world(), "p2") };
}
