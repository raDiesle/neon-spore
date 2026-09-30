/**
 * `--unverified` — what a landing could not check, **printed and never
 * queued.**
 *
 * From 9 to 30 September 2026 every item became an `## Unverified at <sha>:`
 * entry in `docs/queue.md`, on the argument that a report ends with the
 * session and a queue entry survives it. On 27 September the owner took out
 * the items only a phone in a hand could check; on 30 September, with twenty
 * *watched at tempo* entries on the list, he took out the rest: *"do not
 * handle non checked items to be unresolved from me. they should be gone from
 * queue and do not block other tasks."* A thing a landing could not look at
 * is his regression pass, whatever machine could have looked at it, so the
 * landing prints it and the report names it in the word *unverified*, and
 * the queue holds only work a session can finish and prove with
 * `bun run check`. **Do not write such an entry by hand either.**
 *
 * Pure on purpose, like `notes.ts`; `note-commit.ts` is the half that prints.
 */

/**
 * `--unverified <what>`, repeatable, also accepted as `--unverified=<what>`.
 *
 * Repeatable because a lane that adds a creature has usually left two or three
 * different things unlooked-at — the shape sheet, the wave at tempo, the frame
 * cost — and each is its own line in the landing's output.
 */
export function parseUnverified(argv: readonly string[]): string[] {
  const items: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? "";
    if (arg.startsWith("--unverified=")) {
      const value = arg.slice("--unverified=".length).trim();
      if (value) items.push(value);
      continue;
    }
    if (arg !== "--unverified") continue;
    const value = (argv[i + 1] ?? "").trim();
    // A bare `--unverified` at the end of the line, or one followed by the
    // next flag, is a session that meant to say something and said nothing.
    // It is the caller's job to notice an empty result and say so.
    if (!value || value.startsWith("--")) continue;
    items.push(value);
    i++;
  }
  return items;
}
