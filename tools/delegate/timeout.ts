/**
 * Aider has no run-level limit of its own, and a worker that stops making
 * progress otherwise runs until the model's context is full. This ceiling
 * aborts the run after a fixed wall-clock duration.
 */

const DEFAULT_TIMEOUT_MIN = 8;
const MS_PER_MIN = 60_000;

export function ceilingMs(env: Record<string, string | undefined>): number {
  const raw = env.DELEGATE_TIMEOUT_MIN;
  if (raw === undefined || raw === "") return DEFAULT_TIMEOUT_MIN * MS_PER_MIN;

  const minutes = Number(raw);
  if (!Number.isFinite(minutes) || minutes <= 0) return DEFAULT_TIMEOUT_MIN * MS_PER_MIN;

  return Math.round(minutes * MS_PER_MIN);
}
