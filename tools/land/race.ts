/**
 * Whether some other lane landed while this one was in `bun run check`.
 *
 * Its own file because it is the one question in this tool that is not about
 * the state of the world but about two different moments in it — `plan()`
 * cannot decide it, and `run.ts` is where the two readings are taken.
 */

/**
 * Whether the trunk moved under this landing while it was working, said as the
 * refusal or `undefined` for the ordinary case.
 *
 * A landing is rebase, then `bun run check`, then fast-forward, and the check
 * is minutes long. Nothing holds the trunk across that gap, and what happens at
 * the end depends on who does:
 *
 * - A tree with `main` checked out fast-forwards with `merge --ff-only`, which
 *   refuses on its own if the trunk moved. The check was wasted and nothing was
 *   lost.
 * - A clone where nothing holds the trunk — `moveRef`, which is every cloud
 *   session — moves it with `git branch --force main <head>`. That head was
 *   built on the trunk as it stood *before* the check started, so whatever
 *   landed in the meantime is dropped without a word.
 *
 * So the shas are read twice and compared here. `plan()` cannot decide this: it
 * is not a fact about the state of the world but about two different moments in
 * it, which is why this is a function of both and lives beside the ref move
 * rather than inside the planning.
 *
 * An unreadable sha on either side is not a refusal. `git()` answers `""` for
 * a read it could not do, and a landing that has got this far has already
 * proved the repository works — declining to move the trunk over a question
 * that was never answered would be a refusal with nothing behind it.
 */
export function trunkRaced(trunk: string, before: string, now: string): string | undefined {
  if (!before || !now || before === now) return undefined;
  return (
    `${trunk} moved from ${before.slice(0, 7)} to ${now.slice(0, 7)} while this landing was ` +
    `checking; the replay and the check are results about a trunk that is gone. Nothing was ` +
    `moved — run bun run land again and it will replay onto ${now.slice(0, 7)}`
  );
}
