/**
 * A line of type falling into place, and the one rule the owner attached to it:
 * **the text must be well readable.**
 *
 * He asked for the words to arrive rather than to appear — *maybe dropping from
 * above like a water drop shaping the text* — so a line falls stretched the way
 * a drop is stretched by its own speed, lands, flattens once, and is then
 * ordinary type standing still. The whole entrance is over in six tenths of a
 * second and each line is fully opaque long before it stops moving.
 *
 * Its own file because two screens use it now: the wave's own name and sentence
 * (`wave-intro.ts`) and the pages a guide made of prose is read in
 * (`guide-prose.ts`). One entrance, one set of numbers, one place to change it.
 */

/** How long the entrance takes. */
const DROP = 0.62;
/** How far above its place a line starts. */
const RISE = 46;
/** How much later each line begins than the one above it. */
export const STAGGER = 0.16;

/**
 * One line, falling into place. The callback draws it at the origin, centred;
 * everything about where it is and what shape it is in is this function's.
 *
 * The distortion is deliberately small and deliberately short. A drop is tall
 * while it falls and wide for one instant when it lands, and past that instant
 * the type is exactly the type — nothing here is allowed to leave a word
 * squeezed while somebody is trying to read it.
 */
export function drop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  age: number,
  index: number,
  out: number,
  paint: () => void,
): void {
  const p = Math.max(0, Math.min(1, (age - index * STAGGER) / DROP));
  if (p <= 0 || out >= 1) return;
  const fall = 1 - p;
  // Stretched by its own speed on the way down, flattened once on arrival.
  const land = Math.max(0, Math.min(1, (p - 0.72) / 0.28));
  const squash = Math.sin(land * Math.PI) * 0.3;
  const sy = 1 + fall * fall * 1.1 - squash;
  // The sideways half of the landing is deliberately a third of the upright
  // half: a line already wrapped to the screen's width that spread by a fifth
  // would spend a quarter of a second with a word off each edge.
  const sx = 1 + squash * 0.3;

  ctx.save();
  ctx.globalAlpha = Math.min(1, p * 3) * (1 - out);
  ctx.translate(x, y - fall * fall * RISE + out * -14);
  if (Math.abs(sx - 1) > 0.001 || Math.abs(sy - 1) > 0.001) ctx.scale(sx, sy);
  // The callback draws at the origin: everything about where this line is and
  // what shape it is in has already happened to the transform.
  paint();
  ctx.restore();
}
