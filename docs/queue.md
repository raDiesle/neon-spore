# Queue

Technical work a session found and did not do. Every entry here is waiting for
a session of its own, and every entry here drains without the owner deciding
anything.

**What belongs here.** A refactor stepped around, a rule re-derived instead of
called, a file grown past ~250 lines, dead code, a slow path, a missing test, a
document that no longer describes the code, a tool that would have helped. The
test is one question: **could a fresh session finish this alone and prove it
with `bun run check`?** Yes — it goes here, in the same commit as the work that
found it, without asking first.

**What does not.** A thing the game could be — a creature, a mechanic, a
control, a weapon, a boss, a round — is a decision, and a decision drains only
through the owner. It goes in `docs/spec/`, where the director's
`◇ NOT BUILT YET` sheet reads it next to the built things it would sit beside.
A *look* is not queued either: it is offered in `tools/versus/`, because the
only way to choose one is to see it. Mixing decisions into this file is exactly
what buried the last one under sixty-two entries nobody could face.

**Draining it.** `bun run queue` lists what is waiting, half-done work from
`docs/parked.md` first, and says which items somebody is already on.
`bun run queue next` *hands out* the first free one: it creates that item's
branch and prints a prompt naming it. The branch is the claim — two sessions
cannot be given the same item, because the second `git branch` fails and the
item is skipped. The session checks that branch out in its own worktree, does
the item, removes the entry with `bun run queue done <n|title>`, and lands;
landing deletes the branch, which releases the item at the moment the work
reaches `main`. If a handed-out item is never started, `bun run queue release
<n|title>` gives it back.

The claim is a branch rather than a mark in this file because a mark has to be
committed to be seen, and the session that took the item has not committed
anything yet — the moment the mark would be useful is the moment it does not
exist. Worktrees of one repository share their refs, so a lane's branch is
visible to the next `bun run queue` with no commit and no push. A cloud session
works in its own clone, so its claim is invisible here until it pushes; two at
once is the ceiling anyway, and locally that ceiling is enforced.

**The format**, one `##` per item, and both fields are required because the
session that picks it up has read nothing else:

```
## One line saying what to change

- **Found:** 2026-09-03, claude/some-lane
- **Files:** `packages/sim/src/step.ts`, `packages/sim/test/step.test.ts`

What is wrong, what to do about it, and anything the code does not already
say. Written for somebody who was not there.
```

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on.

<!-- No entries. Nothing is owed by this being empty; it means the sessions
     that ran last found nothing they had to step around. -->
