/**
 * The shape of a hook payload, read once.
 *
 * Every hook in this directory is handed one JSON object on stdin and has to
 * answer a question about it. The bash versions each re-derived that with a
 * `grep -o` for a quoted field and a `case` over the raw text, which is two
 * copies of a parser per hook and wrong on any input the pattern did not
 * anticipate — a `stop_hook_active` with an unusual amount of whitespace read
 * as `false`, and a `file_path` was matched wherever in the object it appeared.
 *
 * Parsed rather than pattern-matched, and shared, so a hook is left with only
 * its own decision.
 */

/** What a hook is given. Every field is optional: a payload is another program's. */
export interface HookPayload {
  tool_input?: { file_path?: unknown };
  stop_hook_active?: unknown;
}

/** The payload on stdin, or `null` when it is absent or not JSON. */
export async function readPayload(): Promise<HookPayload | null> {
  try {
    const parsed: unknown = JSON.parse(await Bun.stdin.text());
    return typeof parsed === "object" && parsed !== null ? (parsed as HookPayload) : null;
  } catch {
    return null;
  }
}

/**
 * The edited file's path, with separators normalised.
 *
 * Windows hands these over as `C:\Users\...`, and every rule written about one
 * is written with forward slashes. Normalising here rather than in each hook is
 * the difference between a rule that matches on one machine and a rule.
 */
export function editedPath(payload: HookPayload | null): string | null {
  const raw = payload?.tool_input?.file_path;
  if (typeof raw !== "string" || raw === "") return null;
  return raw.replaceAll("\\", "/");
}

/**
 * Whether this stop is the one a blocked stop already sent back to work.
 *
 * A `Stop` hook that exits 2 puts the session back to work, and the stop that
 * follows carries this flag. Acting on it again is the loop.
 */
export function stopHookActive(payload: HookPayload | null): boolean {
  return payload?.stop_hook_active === true;
}
