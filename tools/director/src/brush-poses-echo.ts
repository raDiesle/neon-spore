import type { World } from "@neon-spore/sim";
import { COL, midpoint, tile } from "./brush-frame.js";
import { fresh, run, POSE_TPB as TPB, until } from "./pose-kit.js";

/**
 * THE ECHO's specimen, split out of `brush-poses.ts` when THE CAROM took that
 * file over its 250-line limit — along a seam the older file already had:
 * `echoPairWorld` and `echoes` were exported from it for exactly one reason,
 * `brush-poses.test.ts` reaching the division without a canvas, and a builder
 * with its own test seam is a builder that can stand in its own file.
 *
 * THE ECHO, one beat after its first division: two small bodies standing side
 * by side.
 *
 * The settled single body every other living kind gets drew a small slick or
 * bulb and stopped there — a picture of a body that happens to be little,
 * saying nothing about the one thing this brush places. What an echo *is* is a
 * thing that comes apart, and `ECHO_AXES[0]` is sideways precisely because
 * "two halves side by side is the plainest picture of a thing coming apart"
 * (`sim/echo-split.ts`). So the pose waits for that division rather than for a
 * settling, and the chip shows the pair.
 *
 * One division and not three. Eight bodies in a block is what the pair sees
 * when they have already lost the argument, and at 34 px it is a smudge; two
 * is the sentence the brush is for.
 *
 * Cyan, so the two are bulbs — the same authored colour `livingArt` gives any
 * kind that carries none, reached the same way (`authorsBodyColor`).
 */
export function echoArt(): HTMLCanvasElement {
  const world = echoPairWorld();
  return tile(world, midpoint(echoes(world)), 4.5);
}

/**
 * The world that frame is taken from, exported so the moment can be tested
 * without a canvas — `brush-art.ts` swallows a pose that cannot be built and
 * falls back to the plain contour, so a division this run stopped reaching
 * would go quiet rather than red (`brush-poses.test.ts`).
 */
export function echoPairWorld(): World {
  const world = fresh([{ beat: 0, col: COL, kind: "echo", color: "cyan" }]);
  until(world, "the echo divided once", (w) => echoes(w).length >= 2);
  // And then the rest of that beat. The two halves inherit the parent's
  // `fromCol`, so on the tick the division lands they are both still drawn
  // where the one body stood (`splitEchoes`) — the glide apart is the whole of
  // that beat, and a frame taken at its start is a picture of one body again.
  run(world, TPB - 1);
  return world;
}

/** The echo bodies on the field, in the order the world holds them. */
export function echoes(world: World): { col: number; row: number }[] {
  return world.creatures.filter((c) => c.kind === "echo");
}
