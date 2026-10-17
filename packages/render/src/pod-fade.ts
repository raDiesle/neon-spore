/**
 * **How present a pod form is drawn**, for the one caller that fades one —
 * THE PULSE's pod lane, where an arrival far up its lane is faint
 * (`drawPodBody`'s `alpha`).
 *
 * The forms set `globalAlpha` outright at every layer — a sphere at 1, a rim
 * at 0.85, a stud's back at 0.4 — so an alpha set round one is overwritten
 * by the first of them. Each of those sets goes through `faded` instead,
 * which is the value itself everywhere but inside `withPodFade`: the field
 * draws exactly what it drew before.
 *
 * A module-level number rather than one more parameter through every layer of
 * the seed, because it lives for one call and is put back in a `finally` —
 * nothing of it outlives a frame (`restart.test.ts`'s rule).
 */
let fade = 1;

/** `alpha` as the form means it, times the fade in force. */
export function faded(alpha: number): number {
  return alpha * fade;
}

/** Runs `draw` with every form's alpha scaled by `alpha`. */
export function withPodFade(alpha: number, draw: () => void): void {
  const was = fade;
  fade = was * alpha;
  try {
    draw();
  } finally {
    fade = was;
  }
}
