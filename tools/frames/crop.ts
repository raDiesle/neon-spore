/**
 * **Cropping and magnifying a captured frame**, so a change the size of a
 * creature can be looked at.
 *
 * A body is drawn at `l.tile * 0.4`, which on a 390 px phone is about forty
 * pixels — so a before-and-after of a change to its *shape* is two pictures in
 * which the change is a handful of them. The eyelid lane could not judge its
 * own work from the frames this tool produced and could not show the owner
 * what had changed, which by `CLAUDE.md`'s rule is the same as sending
 * nothing. It hand-rolled a throwaway that loaded both PNGs into a page,
 * cropped a rectangle and scaled it, then deleted it — exactly the friction
 * `shot.ts` exists to stop being paid twice.
 *
 * **Both halves are the real frame rather than a resize of a picture.** The
 * rectangle is clipped out of the screenshot in the frame's own CSS pixels,
 * and the magnification is the browser's device scale factor — so what comes
 * back is the game drawn at three times the resolution, not forty pixels
 * stretched over a hundred and twenty.
 */

/** A rectangle inside the captured frame, in its own CSS pixels. */
export interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * `--at x,y,w,h`, in the frame's own CSS pixels with the origin at the top
 * left of `#stage`.
 *
 * Refused rather than clamped when it is malformed or empty: a crop silently
 * corrected into a rectangle nobody asked for is a picture of the wrong thing,
 * and the whole point of the flag is that the caller says where to look.
 */
export function parseAt(value: string): Crop {
  const parts = value.split(",").map((p) => p.trim());
  if (parts.length !== 4) {
    throw new Error(`--at ${JSON.stringify(value)}: want four numbers, x,y,w,h in CSS pixels`);
  }
  const [x, y, width, height] = parts.map(Number) as [number, number, number, number];
  for (const [name, n] of [
    ["x", x],
    ["y", y],
    ["w", width],
    ["h", height],
  ] as const) {
    if (!Number.isFinite(n)) throw new Error(`--at: ${name} is not a number in ${parts.join(",")}`);
  }
  if (x < 0 || y < 0) throw new Error("--at: x and y are measured from the frame's top left");
  if (width <= 0 || height <= 0) throw new Error("--at: a crop with no area is not a picture");
  return { x, y, width, height };
}

/** The box a screenshot clips to: the crop, moved onto the element's own place
 * on the page, because `page.screenshot` clips in page coordinates. */
export function clipFor(stage: { x: number; y: number }, at: Crop): Crop {
  return { x: stage.x + at.x, y: stage.y + at.y, width: at.width, height: at.height };
}

/**
 * Whether two runs came back with the same pictures, frame for frame.
 *
 * Digests of the **whole** frame rather than of what was written, so a crop
 * cannot make a pair look different by framing one difference, nor identical
 * by cutting the only one away. `bun run frames` refuses to write a pair that
 * is the same on both sides, and that refusal has to be about the game rather
 * than about the rectangle somebody asked to look at.
 */
export function sameFrames(before: readonly string[], after: readonly string[]): boolean {
  return before.length === after.length && before.every((digest, i) => digest === after[i]);
}
