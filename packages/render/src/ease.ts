/**
 * The one easing curve `render/` uses, and the one place it is written out.
 *
 * `3t² − 2t³`: flat at both ends, so a movement starts and stops rather than
 * running at one speed. Five files carried a private copy of the expression
 * before this one existed, two of them clamping first and three of them
 * relying on the caller — the clamp is here now, and every call site was
 * already handing it a number in range.
 */
export function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}
