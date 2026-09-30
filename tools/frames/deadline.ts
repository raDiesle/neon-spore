/**
 * **A step that stalls says which step it was**, instead of saying nothing.
 *
 * `serve.ts` raced the preview's port against a clock, and `sheet.ts` raced
 * nothing: on 30 September 2026 a `bun run sheet` of six frames, started from a
 * backgrounded shell, printed nothing for fifty minutes and was stopped by
 * hand, and the same command in the foreground wrote its sheet in seconds.
 * Whichever of the launch, `setContent` or the screenshot stalled did it in
 * silence. One race, shared, so the next tool that talks to a browser has it.
 */

/** `p`, or a throw carrying `message` once the clock passes `deadline` (ms since
 * the epoch). The timer is cleared either way, so a settled race holds no process
 * open. */
export async function within<T>(p: Promise<T>, deadline: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), Math.max(0, deadline - Date.now()));
  });
  try {
    return await Promise.race([p, late]);
  } finally {
    clearTimeout(timer);
  }
}
