/**
 * The brief a fresh session reads before it opens a queue item.
 *
 * Its own file, and the cut is the one `after-edit-size.ts` asked for while the
 * size paragraph below was being added: `claim.ts` is about **who holds an
 * item** — the branch, the `Taken:` line, and the three states a listing
 * reports — and this is about **what the session that takes it is told**. The
 * two grow for different reasons. A claim changes when the mechanism does,
 * which is rarely; the brief gains a paragraph every time the ledger finds
 * something a session was not told in time, which is why this file exists at
 * all.
 */

import { answerTo, waiting } from "./asking.js";
import type { Item } from "./queue.js";

/**
 * The prompt a fresh session is opened with. Copy-pasteable and cold-readable:
 * it names the branch that was already created for it, so the session checks
 * that branch out rather than inventing a name the queue cannot recognise.
 *
 * `needs` is the title of an entry that has not landed yet, when the caller
 * found one (`needs.ts`). `next` without an argument never hands such an item
 * out, so this only ever arrives from `next <n>` — somebody who named the
 * blocked half on purpose, and who is owed the reason rather than a refusal.
 *
 * `home` is the main checkout's absolute path (`mainCheckout`). The worktree
 * command is printed under it because a relative one, run from a session the
 * desktop app started in `.claude/worktrees/<session>/`, made a tree inside a
 * tree on 23 September 2026. Without it — a test — the path stays relative.
 *
 * `here` is the asking session's own tree when it is a clean worktree that is
 * not the main checkout (`sessionTree`). A desktop session is refused every
 * write outside the tree it was opened in, so a new tree would be one it could
 * not edit — a lane on 26 September 2026 made one, removed it, and checked the
 * branch out where it stood. With `here` the prompt says that instead.
 */
export function promptFor(
  item: Item,
  branch: string,
  {
    stale,
    needs,
    home,
    here,
  }: { stale?: string; needs?: string; home?: string; here?: string } = {},
): string {
  const from = item.source === "parked" ? "docs/parked.md" : "docs/queue.md";
  const tree = branch.replace(/^claude\//, "");
  const trees = home ? `${home}/.claude/worktrees` : ".claude/worktrees";
  return [
    `Work this item on Neon Spore. Read CLAUDE.md first.`,
    "",
    // The one thing the listing knows that the entry does not: the tree has
    // moved under it since it was written (`stale.ts`).
    ...(stale
      ? [
          `**The entry is ${stale}.** The files it names may have been split,`,
          `renamed or already answered — check what is there now before you build.`,
          "",
        ]
      : []),
    ...(needs
      ? [
          // Said above the entry rather than inside it, because the entry's own
          // body says it in prose the tool cannot see — *once lane one lands*,
          // *do not start it here* — and that prose is what `next` walked past
          // on 21 September 2026.
          `**Something this entry needs has not landed.** It waits on:`,
          "",
          `    ${needs}`,
          "",
          `That entry is still in the queue. You were handed this one by name, so`,
          `build what does not depend on it, and say in your report what you left`,
          `for the session that closes the other half.`,
          "",
        ]
      : []),
    ...(waiting(item)
      ? [
          // The whole difference an `Asks:` makes, said at the top where a
          // session reads it before it starts building the wrong thing.
          `**This one opens with a question, and the owner answers it.** Put it`,
          `to them before you write anything, in one message, with the options`,
          `the body names:`,
          "",
          `    ${item.asks}`,
          "",
          `Their answer is the spec. If it has not arrived by the time you have`,
          `everything else ready, say so and land nothing that depends on it.`,
          "",
        ]
      : item.asks
        ? [
            // An answered ask is ordinary work again, and the one thing this
            // session must not do is ask it a second time: the entry keeps
            // every answer it was given, so the live one is said here rather
            // than left to be picked out of the body.
            `**The question this entry opened with has been answered, and the`,
            `answer is the spec:**`,
            "",
            `    ${answerTo(item)}`,
            "",
            `Build that. Do not put the choice back to the owner.`,
            "",
          ]
        : [
            `It is a technical improvement, not a look — it lands on main like any`,
            `refactor.`,
            "",
          ]),
    // **Size is decided here or it is discovered at minute 180.** The prompt
    // used to say one thing about it, in its last line, and it said it as a
    // fallback: leave what you finished. That is the discovery
    // `docs/lane-speed.md` exists to stop — the top 14% of lanes carry 38% of
    // the minutes and they are all one sitting asked to hold two pieces of
    // work. `CLAUDE.md` now says the split is decided before the work starts,
    // and this is where the work starts. Printed for every item rather than
    // for ones an entry marks large: the queue has no size field, and adding
    // one would make the writer of an entry guess at the size of work they are
    // not doing.
    `**Decide the size before you start.** If this is more than one sitting,`,
    `name the halves in your first message and work them in order — a half is`,
    `only a half if it lands green on its own. The seams this tree already has`,
    `are the table of cuts in docs/lane-speed.md; read it rather than inventing`,
    `one.`,
    "",
    ...(here
      ? [
          `The branch is already made and is your claim on the item — check it out in`,
          `the clean worktree you are standing in, do not make another:`,
          "",
          `    git -C ${here} checkout ${branch}`,
          "",
          `then \`bun install\` in that tree (.claude/skills/lane says why).`,
        ]
      : [
          `The branch is already made and is your claim on the item — check it out in`,
          `its own worktree, do not make another:`,
          "",
          `    git worktree add ${trees}/${tree} ${branch}`,
          "",
          `then \`bun install\` from inside that tree (.claude/skills/lane says why).`,
        ]),
    "",
    `## ${item.title}`,
    "",
    item.body,
    "",
    `When it is green: bun run check, commit, land. Remove the entry from`,
    `${from} in the same commit — \`bun run queue done "${item.title}"\`.`,
    `Landing deletes the branch, which is what releases the item.`,
    `If it turns out to be bigger than one session, leave what you finished`,
    `committed and rewrite the entry to say what is left.`,
  ].join("\n");
}
