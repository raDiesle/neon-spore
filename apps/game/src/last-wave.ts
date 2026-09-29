/**
 * The wave this device last opened, so JUMP TO WAVE can open on it.
 *
 * The owner, 29 September 2026: *"when I am in director or test mode, I want
 * to scroll to the wave which I played previously on this device and
 * highlight it."* The list is thirty-odd rows on a phone, and a tester going
 * back to the wave they were on scrolled for it every time.
 *
 * Not `progress.ts`'s `furthest`: that only goes up, and a tester jumping back
 * to wave three is on wave three. Not in `Progress` at all, either, because
 * `atLevel` empties that record when the difficulty changes and the wave a
 * person last looked at is not a claim about a run. Solo and per device, the
 * same as `progress.ts`, and for the same reason it never touches the room.
 */

export const LAST_WAVE_KEY = "neon-spore.last-wave";

/** A stored value read as a wave index, or `null` for none. Anything that is
 * not a whole non-negative number in range is a hand-edit or a wave list that
 * has since shrunk, and neither is somewhere to scroll to. */
export function parseLastWave(raw: string | null, waveCount: number): number | null {
  if (raw === null || !/^\d+$/.test(raw)) return null;
  const wave = Number(raw);
  return wave < waveCount ? wave : null;
}

/** Wrapped like `progress.ts`'s store: private browsing keeps nothing, and a
 * list that cannot remember simply opens at the top. */
export function readLastWave(waveCount: number): number | null {
  try {
    return parseLastWave(localStorage.getItem(LAST_WAVE_KEY), waveCount);
  } catch {
    return null;
  }
}

export function writeLastWave(wave: number): void {
  try {
    localStorage.setItem(LAST_WAVE_KEY, String(Math.floor(wave)));
  } catch {
    // Nothing to persist to — the list opens at the top next time.
  }
}
